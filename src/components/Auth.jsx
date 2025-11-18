import { useState } from 'react'

export default function Auth({ onAuthenticated }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const payload = mode === 'signup'
        ? { name: form.name, email: form.email, password: form.password, address: form.address || undefined, phone: form.phone || undefined }
        : { email: form.email, password: form.password }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Request failed')
      }
      const data = await res.json()
      const auth = { schoolId: data.school_id, name: data.name, email: data.email }
      localStorage.setItem('school_auth', JSON.stringify(auth))
      onAuthenticated(auth)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur border border-blue-500/20 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">School Portal</h1>
          <p className="text-blue-200/80">Sign up or log in to manage orders and payouts</p>
        </div>

        <div className="flex mb-6 bg-slate-900/40 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-semibold ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-semibold ${mode === 'signup' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-blue-200 mb-1">School name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white" />
            </div>
          )}
          <div>
            <label className="block text-sm text-blue-200 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white" />
          </div>
          <div>
            <label className="block text-sm text-blue-200 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white" />
          </div>
          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-200 mb-1">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md text-white" />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-md">
            {loading ? 'Please wait...' : (mode === 'signup' ? 'Create account' : 'Log in')}
          </button>
        </form>
      </div>
    </div>
  )
}
