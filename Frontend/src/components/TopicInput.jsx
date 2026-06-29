import { useState } from "react"
const EXAMPLES = ["Amazon PPC advertising","Machine learning","React.js","Python programming","Digital marketing"]
export default function TopicInput({ onStart }) {
  const [topic, setTopic] = useState("")
  return (
    <div className="topic-screen">
      <div className="hero">
        <h1>🎓 YouTube Learning Agent</h1>
        <p>Enter any topic — AI finds expert videos and builds your personalized learning roadmap.</p>
        <div className="input-row">
          <input className="topic-input" placeholder="e.g. Amazon PPC, Machine Learning..." value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && topic.trim() && onStart(topic.trim())} />
          <button className="start-btn" onClick={() => topic.trim() && onStart(topic.trim())}>Build Roadmap →</button>
        </div>
        <div className="examples">
          <span>Try: </span>
          {EXAMPLES.map(ex => <button key={ex} className="example-chip" onClick={() => setTopic(ex)}>{ex}</button>)}
        </div>
      </div>
    </div>
  )
}
