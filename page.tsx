"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  who: "user" | "bot"
  text: string
}

interface Conversation {
  id: number
  title: string
  time: string
  messages: Message[]
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number>(0)
  const [inputValue, setInputValue] = useState("")
  const [firstChatStarted, setFirstChatStarted] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startNewConversation()
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [conversations, currentConversationId])

  function cleanReply(text: string) {
    if (!text) return ""
    text = text.replace(/^---.*$/gm, "")
    text = text.replace(/(^|\n)\s*#{1,6}\s*(.+)/g, (m, p1, p2) => `${p1}<strong>${p2.trim()}</strong>`)
    text = text.replace(/(^|\n)([A-Za-z0-9\s-]{3,80}):/g, "$1<strong>$2:</strong>")
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    text = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    text = text.replace(/(^|\n)(\d+)\.\s/g, "<br>$2. ")
    text = text.replace(/(^|\n)-\s/g, "<br>- ")
    text = text.replace(/\n{2,}/g, "<br><br>")
    return text.trim()
  }

  function startNewConversation() {
    const newId = Date.now()
    const newConv: Conversation = {
      id: newId,
      title: "New Chat",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: [],
    }

    if (!firstChatStarted) {
      newConv.messages.push({
        who: "bot",
        text: "Hey! I am your AI Assistant, How can I help you today?",
      })
      setFirstChatStarted(true)
    }

    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newId)
  }

  function switchConversation(id: number) {
    if (currentConversationId === id) return
    setCurrentConversationId(id)
  }

  async function sendMessage() {
    const message = inputValue.trim()
    if (!message) return

    const currentConv = conversations.find((c) => c.id === currentConversationId)
    if (!currentConv) return

    const updatedMessages = [...currentConv.messages, { who: "user" as const, text: message }]

    let updatedTitle = currentConv.title
    if (currentConv.title === "New Chat") {
      updatedTitle = message.substring(0, 30) + (message.length > 30 ? "..." : "")
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversationId ? { ...c, title: updatedTitle, messages: updatedMessages } : c)),
    )

    setInputValue("")

    const placeholderMessage: Message = { who: "bot", text: "…" }
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversationId ? { ...c, messages: [...c.messages, placeholderMessage] } : c)),
    )

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: currentConv.messages,
        }),
      })

      const data = await res.json()
      const cleaned = cleanReply(data.reply)

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConversationId) {
            const newMessages = [...c.messages]
            newMessages[newMessages.length - 1] = { who: "bot", text: cleaned || "No reply" }
            return { ...c, messages: newMessages }
          }
          return c
        }),
      )
    } catch (err) {
      console.error(err)
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConversationId) {
            const newMessages = [...c.messages]
            newMessages[newMessages.length - 1] = { who: "bot", text: "Network error" }
            return { ...c, messages: newMessages }
          }
          return c
        }),
      )
    }
  }

  const currentConv = conversations.find((c) => c.id === currentConversationId)

  return (
    <div className="flex w-[90vw] max-w-[1400px] h-[90vh] max-h-[900px] rounded-3xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.1)] bg-white mx-auto my-[5vh]">
      <aside className="w-[350px] min-w-[300px] bg-white border-r border-[#e0e0e0] flex flex-col p-5">
        <div className="flex justify-between items-center mb-5 pb-2.5 border-b border-[#e0e0e0]">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Conversations</h2>
          <button
            onClick={startNewConversation}
            className="bg-[#007bff] text-white border-none w-10 h-10 rounded-full text-2xl cursor-pointer transition-all hover:bg-[#0056b3] hover:scale-105 shadow-[0_2px_5px_rgba(0,123,255,0.3)]"
          >
            +
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-1.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => switchConversation(conv.id)}
              className={`flex items-center p-4 mb-2 rounded-xl cursor-pointer transition-all ${
                conv.id === currentConversationId
                  ? "bg-[#007bff] text-white shadow-[0_2px_8px_rgba(0,123,255,0.2)]"
                  : "bg-transparent hover:bg-[#f0f0f0]"
              }`}
            >
              <span className="text-xl mr-4">💬</span>
              <span className="flex-grow font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {conv.title}
              </span>
              <span
                className={`text-sm ml-2.5 ${conv.id === currentConversationId ? "text-white/80" : "text-[#6c757d]"}`}
              >
                {conv.time}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-grow flex flex-col bg-[#f4f7f6]">
        <header className="p-4 px-8 bg-white border-b border-[#e0e0e0] flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h1 className="text-xl font-semibold text-[#1a1a1a]">AI Assistant</h1>
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#28a745] mr-2"></span>
            <span className="text-sm text-[#6c757d]">Online</span>
          </div>
        </header>

        <div
          ref={chatRef}
          className="flex-grow p-5 px-8 overflow-y-auto"
          style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f4f7f6"/><circle cx="50" cy="50" r="1" fill="%23e0e0e0" opacity="0.3"/></svg>')`,
            backgroundRepeat: "repeat",
          }}
        >
          {currentConv?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[70%] p-3 px-5 mb-4 rounded-[18px] leading-relaxed break-words shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
                msg.who === "user" ? "bg-[#dcf8c6] rounded-tr-[5px] ml-auto" : "bg-white rounded-tl-[5px] mr-auto"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          ))}
        </div>

        <footer className="flex p-4 px-8 bg-white border-t border-[#e0e0e0] items-end gap-4">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type your message here..."
            className="flex-grow p-4 border border-[#e0e0e0] rounded-[25px] text-base resize-none min-h-[50px] max-h-[150px] focus:outline-none focus:border-[#007bff] focus:shadow-[0_0_0_3px_rgba(0,123,255,0.25)] transition-all"
          />
          <button
            onClick={sendMessage}
            className="bg-[#007bff] text-white border-none w-[50px] h-[50px] rounded-full cursor-pointer flex justify-center items-center transition-all hover:bg-[#0056b3] hover:scale-105 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="translate-x-0.5"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </footer>
      </main>
    </div>
  )
}
