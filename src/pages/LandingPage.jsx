import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, AlertTriangle, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'openid',
  'profile',
  'email',
].join(' ')

const features = [
  {
    icon: <Mail className="w-6 h-6 text-blue-600" />,
    title: 'Reads bill emails automatically',
    desc: 'Connects to your Gmail Bills label and extracts amounts, due dates, and providers.',
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    title: 'Flags unusual charges instantly',
    desc: 'Detects when any bill exceeds its baseline and surfaces it prominently.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-green-600" />,
    title: 'Tracks all providers in one place',
    desc: 'Rogers, Enbridge, Netflix, insurance — every recurring charge on one dashboard.',
  },
]

export default function LandingPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const googleLogin = useGoogleLogin({
    scope: SCOPES,
    onSuccess: async (tokenResponse) => {
      // Fetch basic profile using the access token
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
      const profile = await res.json()
      login(tokenResponse, profile)
      navigate('/dashboard')
    },
    onError: (err) => console.error('Google login failed', err),
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <path d="M8 10h8M8 14h5"/>
          </svg>
          <span className="text-xl font-semibold text-gray-900">BillTracker</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">
        <div className="max-w-xl w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            All your bills.<br />One dashboard.
          </h1>
          <p className="text-lg text-gray-500 mb-10">
            Auto-reads your Gmail bill emails, detects unusual charges, tracks every provider.
          </p>

          <button
            onClick={() => googleLogin()}
            className="inline-flex items-center gap-3 bg-white border border-gray-300 shadow-sm text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full text-left">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="mt-10 flex items-center gap-2 text-sm text-gray-400 max-w-md">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>We only read emails labelled Bills. We cannot send emails or access anything else in your inbox.</span>
        </div>
      </main>
    </div>
  )
}
