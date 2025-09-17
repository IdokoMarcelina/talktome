import { Routes, Route, Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import LandingPage from './components/LandingPage'
import RegisterPage from './components/RegisterPage'
import ChatPage from './components/ChatPage'
import './App.css'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={
            isConnected ? <RegisterPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/chat"
          element={
            isConnected ? <ChatPage /> : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
