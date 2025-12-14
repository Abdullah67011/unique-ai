const isChatPage = window.location.pathname.includes("chat.html")
const startBtn = document.getElementById("start-btn")

if (startBtn) {
  startBtn.addEventListener("click", () => {
    window.location.href = "/chat.html"
  })
}

if (isChatPage) {
  const chatEl = document.getElementById("chat")
  const inputEl = document.getElementById("inp")
  const sendBtn = document.getElementById("send")
  const conversationListEl = document.querySelector(".conversation-list")
  const newChatBtn = document.querySelector(".new-chat-btn")

  let currentConversationId = 1
  const conversations = []
  let firstChatStarted = false

  function cleanReply(text) {
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

  function append(text, who = "bot") {
    const d = document.createElement("div")
    d.className = "msg " + (who === "user" ? "user" : "bot")
    d.innerHTML = text

    chatEl.appendChild(d)
    chatEl.scrollTop = chatEl.scrollHeight

    if (text !== "…") {
      const conv = conversations.find((c) => c.id === currentConversationId)
      if (conv) conv.messages.push({ who, text })
    }
  }

  function appendPlaceholder() {
    const d = document.createElement("div")
    d.className = "msg bot"
    d.innerHTML = "…"
    chatEl.appendChild(d)
    chatEl.scrollTop = chatEl.scrollHeight
    return d
  }

  function startNewConversation() {
    const newId = Date.now()

    const newConv = {
      id: newId,
      title: "New Chat",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      messages: [],
    }

    conversations.unshift(newConv)
    currentConversationId = newId

    renderConversations()
    chatEl.innerHTML = ""

    if (!firstChatStarted) {
      append("Hey! I am your AI Assistant, How can I help you today?", "bot")
      firstChatStarted = true
    }
  }

  function renderConversations() {
    conversationListEl.innerHTML = ""

    conversations.forEach((conv) => {
      const d = document.createElement("div")
      d.className = "conversation-item" + (conv.id === currentConversationId ? " active" : "")
      d.dataset.id = conv.id

      d.innerHTML = `
                <span class="icon">💬</span>
                <span class="title">${conv.title}</span>
                <span class="time">${conv.time}</span>
            `

      d.addEventListener("click", () => switchConversation(conv.id))

      conversationListEl.appendChild(d)
    })
  }

  function switchConversation(id) {
    if (currentConversationId === id) return

    currentConversationId = id
    renderConversations()

    chatEl.innerHTML = ""
    const conv = conversations.find((c) => c.id === id)

    conv.messages.forEach((msg) => append(msg.text, msg.who))
  }

  async function sendMessage() {
    const message = inputEl.value.trim()
    if (!message) return

    append(message, "user")
    inputEl.value = ""

    const currentConv = conversations.find((c) => c.id === currentConversationId)

    if (currentConv.title === "New Chat") {
      currentConv.title = message.substring(0, 30) + (message.length > 30 ? "..." : "")
      renderConversations()
    }

    const placeholder = appendPlaceholder()

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
      placeholder.innerHTML = cleaned || "No reply"

      currentConv.messages.push({ who: "bot", text: cleaned })
    } catch (err) {
      placeholder.textContent = "Network error"
      console.error(err)
    }
  }

  sendBtn.addEventListener("click", sendMessage)

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  newChatBtn.addEventListener("click", startNewConversation)

  document.addEventListener("DOMContentLoaded", () => {
    startNewConversation()
  })
}
