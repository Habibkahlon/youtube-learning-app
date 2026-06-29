import { useState } from "react"
import TopicInput from "./components/TopicInput"
import RoadmapView from "./components/RoadmapView"
import ChatAgent from "./components/ChatAgent"
import "./App.css"
export default function App() {
  const [stage, setStage] = useState("input")
  const [topic, setTopic] = useState("")
  const [videos, setVideos] = useState([])
  const [transcripts, setTranscripts] = useState([])
  const [roadmap, setRoadmap] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")
  const API = "https://your-railway-url.up.railway.app/api"
  async function handleStart(userTopic) {
    setTopic(userTopic); setLoading(true)
    try {
      setLoadingMsg("🔍 Searching YouTube for expert videos...")
      const r1 = await fetch(`${API}/youtube/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: userTopic, max_results: 30 }) })
      const d1 = await r1.json()
      const topVideos = d1.videos.slice(0, 12)
      setVideos(topVideos)
      setLoadingMsg("📄 Fetching transcripts...")
      const r2 = await fetch(`${API}/transcripts/fetch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ video_ids: topVideos.map(v => v.id) }) })
      const d2 = await r2.json()
      setTranscripts(d2.transcripts)
      setLoadingMsg("🧠 Building your learning roadmap...")
      const r3 = await fetch(`${API}/gemini/roadmap`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: userTopic, videos: topVideos, transcripts: d2.transcripts }) })
      const d3 = await r3.json()
      setRoadmap(d3.roadmap); setStage("roadmap")
    } catch (e) { alert("Error: " + e.message) }
    finally { setLoading(false); setLoadingMsg("") }
  }
  return (
    <div className="app">
      {loading && <div className="loading-overlay"><div className="spinner" /><p>{loadingMsg}</p></div>}
      {stage === "input" && <TopicInput onStart={handleStart} />}
      {stage === "roadmap" && (
        <div className="main-layout">
          <div className="roadmap-panel">
            <RoadmapView roadmap={roadmap} topic={topic} videos={videos} />
            <button className="chat-btn" onClick={() => setStage("chat")}>💬 Open AI Chat Agent</button>
          </div>
        </div>
      )}
      {stage === "chat" && (
        <div className="main-layout split">
          <div className="roadmap-panel half"><RoadmapView roadmap={roadmap} topic={topic} videos={videos} /></div>
          <div className="chat-panel"><ChatAgent topic={topic} roadmap={roadmap} transcripts={transcripts} videos={videos} onBack={() => setStage("roadmap")} /></div>
        </div>
      )}
    </div>
  )
}
