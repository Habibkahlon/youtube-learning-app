import { useState, useRef, useEffect } from "react"
const SUGGESTIONS = ["Explain Phase 1 in more detail","Give me a quiz on the key concepts","What are the most important takeaways?","Summarize everything in one page","What should I learn first?"]
export default function ChatAgent({ topic, roadmap, transcripts, videos, onBack }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: `Hi! I analyzed ${videos.length} expert videos on ${topic}. Ask me anything!` }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])
  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setLoading(true)
    try {
      const r = awaitfetch("https://youtube-learning-app-production-f3f9.up.railway.app/api/gemini/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, roadmap, transcripts, history: messages, message: userMsg }) })
      const d = await r.json()
      setMessages(prev => [...prev, { role: "assistant", content: d.reply }])
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]) }
    finally { setLoading(false) }
  }
  return (
    <div className="chat-agent">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>← Roadmap</button>
        <h3>💬 AI Chat — {topic}</h3>
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="avatar">{m.role === "user" ? "👤" : "🤖"}</span>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        {loading && <div className="message assistant"><span className="avatar">🤖</span><div className="bubble typing">Thinking...</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="suggestions">
        {SUGGESTIONS.map(s => <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>)}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Ask anything about the roadmap..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
        <button className="send-btn" onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  )
}
