export default function RoadmapView({ roadmap, topic, videos }) {
  const lines = roadmap.split("\n")
  return (
    <div className="roadmap-view">
      <div className="roadmap-header">
        <h2>📚 {topic}</h2>
        <p className="video-count">{videos.length} expert videos analyzed</p>
      </div>
      <div className="roadmap-content">
        {lines.map((line, i) => {
          if (line.startsWith("# ")) return <h1 key={i} className="rm-h1">{line.slice(2)}</h1>
          if (line.startsWith("## ")) return <h2 key={i} className="rm-h2">{line.slice(3)}</h2>
          if (line.startsWith("### ")) return <h3 key={i} className="rm-h3">{line.slice(4)}</h3>
          if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="rm-bold">{line.slice(2,-2)}</p>
          if (line.startsWith("- ")) return <li key={i} className="rm-bullet">{line.slice(2)}</li>
          if (/^\d+\./.test(line)) return <li key={i} className="rm-num">{line}</li>
          if (line.trim() === "") return <br key={i} />
          return <p key={i} className="rm-para">{line}</p>
        })}
      </div>
      <div className="video-list">
        <h3>📹 Source Videos</h3>
        {videos.map(v => (
          <a key={v.id} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer" className="video-card">
            <img src={v.thumbnail} alt={v.title} />
            <div><p className="v-title">{v.title}</p><p className="v-channel">{v.channel} • {Number(v.views).toLocaleString()} views</p></div>
          </a>
        ))}
      </div>
    </div>
  )
}
