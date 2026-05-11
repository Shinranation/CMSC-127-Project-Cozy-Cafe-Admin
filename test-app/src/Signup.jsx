import { useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabaseClient.js'

export default function Signup({ onBackToLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [lastSignupEmail, setLastSignupEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const configured = supabaseConfigured()
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
  const passwordStrengthScore = Object.values(passwordChecks).filter(Boolean).length
  const passwordStrongEnough = passwordStrengthScore >= 4

  async function handleSignUp() {
    if (!supabase) return
    setStatus(null)

    if (!passwordStrongEnough) {
      setStatus('Password is too weak. Use at least 8 chars with upper/lowercase, number, and symbol.')
      return
    }

    if (password !== confirmPassword) {
      setStatus('Passwords do not match.')
      return
    }

    setBusy(true)
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setStatus(error.message)
      setBusy(false)
      return
    }

    // If email confirmation is enabled in Supabase, session is usually null here.
    if (!data?.session) {
      setLastSignupEmail(email)
      setBusy(false)
      setStatus('Account created. Please confirm your email first, then sign in.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      return
    }

    // Keep signup reusable for creating another account later.
    await supabase.auth.signOut()
    setLastSignupEmail(email)
    setBusy(false)
    setStatus('Sign-up successful. You can now sign in, or register another account.')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  async function signUpWithGoogle() {
    if (!supabase) return
    setBusy(true)
    setStatus(null)

    const redirectTo = `${window.location.origin}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error) {
      setStatus(error.message)
      setBusy(false)
    }
  }

  async function resendConfirmationEmail() {
    if (!supabase) return
    const targetEmail = (email || lastSignupEmail).trim()
    if (!targetEmail) {
      setStatus('Enter your email first, then click resend confirmation.')
      return
    }

    setBusy(true)
    setStatus(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
      options: { emailRedirectTo: window.location.origin },
    })

    setBusy(false)
    if (error) {
      setStatus(error.message)
      return
    }
    setStatus(`Confirmation email resent to ${targetEmail}.`)
  }

  return (
    <main className="min-h-screen bg-[#FAF3E7] flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-[#D79A6F] max-w-lg w-full relative">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
          Create Admin Account
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Already have an account?{' '}
          <button type="button" onClick={onBackToLogin} className="underline hover:text-[#D79A6F]">
            Log in
          </button>
        </p>

        {!configured && (
          <p className="text-center text-red-500 mb-6 bg-red-50 p-3 rounded-xl text-sm">
            Missing Supabase env configuration.
          </p>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D79A6F]/50 transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D79A6F]/50 transition"
              required
            />
            {password && (
              <p className="text-xs text-gray-600 ml-1">
                Password strength: {passwordStrengthScore}/5
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 ml-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D79A6F]/50 transition"
              required
            />
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={!configured || busy || !email || !password || !confirmPassword || !passwordStrongEnough}
              className="bg-[#463124] text-white px-16 py-3 rounded-full text-2xl font-black uppercase hover:bg-[#34241a] transition-all active:scale-95 shadow-md"
            >
              Sign Up
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={resendConfirmationEmail}
              disabled={!configured || busy || !(email || lastSignupEmail)}
              className="text-xs font-semibold text-gray-600 underline hover:text-[#D79A6F]"
            >
              Resend confirmation email
            </button>
          </div>

          <div className="relative text-center my-8">
            <span className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-300 transform -translate-y-1/2"></span>
            <span className="relative z-10 px-3 bg-white text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={signUpWithGoogle}
            disabled={!configured || busy}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-gray-400 font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.2c0-.7-.1-1.3-.2-2H10v3.8h5.4c-.2 1.2-.9 2.2-2 3v-2.5h3.2c1.9-1.8 3-4.3 3-7.3z"/>
              <path fill="#34A853" d="M10 20c2.7 0 5-1 6.7-2.7l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H1.1v2.6C2.8 17.5 6.1 20 10 20z"/>
              <path fill="#FBBC05" d="M4.2 11.6c-.2-.6-.3-1.2-.3-1.6s.1-1 .3-1.6V5.8H1.1C.4 7.1 0 8.5 0 10s.4 2.9 1.1 4.2l3.1-2.6z"/>
              <path fill="#EA4335" d="M10 3.8c1.5 0 2.8.5 3.9 1.5l2.8-2.8C15 1 12.7 0 10 0 6.1 0 2.8 2.5 1.1 5.8l3.1 2.6c.8-2.4 3.1-4.2 5.8-4.2z"/>
            </svg>
            Sign up with Google
          </button>
        </form>

        {status && (
          <p className="text-center text-sm text-gray-700 mt-6 bg-gray-100 p-3 rounded-lg border border-gray-200">
            {status}
          </p>
        )}

        <div className="mt-12 text-center text-xs space-x-3 text-gray-500">
          <button type="button" onClick={onBackToLogin} className="hover:text-[#D79A6F] underline">
            Back to Login
          </button>
          <button type="button" onClick={onClose} className="hover:text-[#D79A6F] underline">
            Back to Promotions
          </button>
        </div>
      </div>
    </main>
  )
}
