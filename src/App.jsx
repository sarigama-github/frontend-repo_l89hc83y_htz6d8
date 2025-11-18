import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('school_auth')
    if (saved) setAuth(JSON.parse(saved))
  }, [])

  const handleAuthenticated = (data) => setAuth(data)
  const handleLogout = () => { localStorage.removeItem('school_auth'); setAuth(null) }

  if (!auth) {
    return <Auth onAuthenticated={handleAuthenticated} />
  }

  return <Dashboard auth={auth} onLogout={handleLogout} />
}

export default App
