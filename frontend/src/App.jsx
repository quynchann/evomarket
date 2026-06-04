import { Outlet } from 'react-router'
import { useEffect } from 'react'
import { useAuthStore } from './stores/useAuthStore'
import './App.css'

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const authState = useAuthStore.getState()
      if (!authState.isAuthenticated) {
        sessionStorage.setItem('loggedOut', 'true')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <>
      <Outlet />
    </>
  )
}

export default App
