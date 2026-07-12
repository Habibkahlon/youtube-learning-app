import { supabase } from '../supabaseClient'

export default function AuthButton({ user }) {
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) alert('Login failed: ' + error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="auth-bar">
        <span className="auth-name">{user.user_metadata?.full_name || user.email}</span>
        <button className="auth-btn" onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return (
    <div className="auth-bar">
      <button className="auth-btn" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}
