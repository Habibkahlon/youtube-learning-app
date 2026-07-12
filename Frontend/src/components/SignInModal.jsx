import { supabase } from '../supabaseClient'
import { GoogleMark } from './AuthButton'

export default function SignInModal({ topic, onDismiss }) {
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) alert('Sign in failed: ' + error.message)
  }

  return (
    <div className="modal-scrim" onClick={onDismiss}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-preview">
          <span className="modal-badge">Not saved</span>
          <p className="modal-preview-label">Your roadmap</p>
          <p className="modal-preview-topic">{topic}</p>
        </div>

        <h2 className="modal-title">Keep this roadmap</h2>
        <p className="modal-body">
          Sign in to save it to your library, pick up where you left off,
          and build as many roadmaps as you want.
        </p>

        <button className="btn-google btn-google-lg" onClick={signInWithGoogle}>
          <GoogleMark />
          Continue with Google
        </button>

        <button className="modal-dismiss" onClick={onDismiss}>
          Keep looking around
        </button>
      </div>
    </div>
  )
}
