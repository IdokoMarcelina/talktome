import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import RegisterPage from './components/RegisterPage'
import ChatPage from './components/ChatPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Always show LandingPage first */}
        <Route path="/" element={<LandingPage />} />

        {/* Only allow register if connected */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Only allow chat if registered */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
