import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useNavigation = () => {
  const navigate = useNavigate()
  const [hasUserConnected, setHasUserConnected] = useState(false)

  const handleWalletConnect = useCallback(() => {
    setHasUserConnected(true)
  }, [])

  const navigateToRegister = useCallback(() => {
    navigate('/register')
  }, [navigate])

  const navigateToChat = useCallback(() => {
    navigate('/chat')
  }, [navigate])

  const navigateToLanding = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleRegistrationCheck = useCallback((isRegistered) => {
    if (isRegistered) {
      navigateToChat()
    } else {
      navigateToRegister()
    }
  }, [navigateToChat, navigateToRegister])

  return {
    hasUserConnected,
    handleWalletConnect,
    navigateToRegister,
    navigateToChat,
    navigateToLanding,
    handleRegistrationCheck
  }
}