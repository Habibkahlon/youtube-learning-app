import { useState } from "react"
import TopicInput from "./components/TopicInput"
import RoadmapView from "./components/RoadmapView"
import ChatAgent from "./components/ChatAgent"
import "./App.css"
import { useAuth } from './useAuth'
import AuthButton from './components/AuthButton'
export default function App() {
  const [stage, setStage] = useState("input")
  const [topic, setTopic] = useState("")
  const [videos, setVideos] = useState([])
  const [transcripts, setTranscripts] = useState([])
  const [roadmap, setRoadmap] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState("")
  const API = "https://youtube-learning-app-production-f3f9.up.railway.app/api"
  async function handleStart(userTopic) {
    setTopic(userTopic); setLoading(true)
    try {
      setLoadingMsg("🔍 Searching YouTube for expert videos...")
      const r1 = await fetch(`${API}/youtube/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: userTopic, max_results: 30 }) })
      if (!r1.ok) {
        if (r1.status === 422) throw new Error("Please enter a valid topic (2–150 characters).")
        if (r1.status === 429) throw new Error("Too many requests. Please wait a minute and try again.")
        throw new Error("Couldn't search videos. Please try again shortly.")
      }
      const d1 = await r1.json()
      if (!d1.videos || d1.videos.length === 0) throw new Error("No videos found for this topic. Try a different one.")
      const topVideos = d1.videos.slice(0, 12)
      setVideos(topVideos)

      setLoadingMsg("📄 Fetching transcripts...")
      const r2 = await fetch(`${API}/transcripts/fetch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ video_ids: topVideos.map(v => v.id) }) })
      const d2 = r2.ok ? await r2.json() : { transcripts: [] }
      setTranscripts(d2.transcripts || [])

      setLoadingMsg("🧠 Building your learning roadmap...")
      const r3 = await fetch(`${API}/gemini/roadmap`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: userTopic, videos: topVideos, transcripts: d2.transcripts || [] }) })
      if (!r3.ok) {
        if (r3.status === 429) throw new Error("Too many requests. Please wait a minute and try again.")
        throw new Error("Couldn't build the roadmap. Please try again shortly.")
      }
      const d3 = await r3.json()
      if (!d3.roadmap) throw new Error("The roadmap came back empty. Please try again.")
      setRoadmap(d3.roadmap); setStage("roadmap")
    } catch (e) {
      alert(e.message)
    }
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
