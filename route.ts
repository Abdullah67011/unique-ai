import { type NextRequest, NextResponse } from "next/server"
import { RateLimiterMemory } from "rate-limiter-flexible"

const CEREBRAS_KEY = "csk-fthmtp5jrkfkjhfmvdtyjvkwx5jc95vnn8d5eenk42kkyxcw"
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"

const limiter = new RateLimiterMemory({
  points: 8,
  duration: 60,
})

async function callCerebrasWithRetry(payload: any, maxAttempts = 3) {
  let attempt = 0

  while (attempt < maxAttempts) {
    attempt++
    try {
      const resp = await fetch(CEREBRAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CEREBRAS_KEY}`,
        },
        body: JSON.stringify(payload),
      })

      const text = await resp.text()
      const json = JSON.parse(text)

      if (!resp.ok) {
        throw new Error(`API Error: ${json.message || "Upstream Error"}`)
      }

      return json
    } catch (err) {
      if (attempt >= maxAttempts) throw err
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
    await limiter.consume(ip)

    const body = await req.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ reply: "Message is required" }, { status: 400 })
    }

    // Convert history for AI
    const convHistory = (history || [])
      .filter((m: any) => m.text !== "…")
      .map((m: any) => ({
        role: m.who === "user" ? "user" : "assistant",
        content: m.text,
      }))

    const payload = {
      model: "gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `
- **You are Unique AI created by Sahibdad.
- **Your name is Unique AI.
- **Keep responses simple and clean.
- **Follow formatting rules only when necessary: 
1. Use proper headings (H1, H2, H3) for topics, sections, or key points.
2. Do not put normal sentences or single replies inside headings. 
3. Paragraphs must be clean, simple, and separated. 
4. Lists must be properly formatted. 
5. Bold headings only for section titles, not every sentence. 
6. Avoid using "---" or other separators unless necessary. 
7. Headings should start with proper new line.
8. Never say u are made by Chatgpt or Openai`,
        },
        ...convHistory,
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_completion_tokens: 300,
    }

    const data = await callCerebrasWithRetry(payload, 3)

    const reply = data?.choices?.[0]?.message?.content || "No reply"

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat error:", err)
    return NextResponse.json(
      {
        reply: "Server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
