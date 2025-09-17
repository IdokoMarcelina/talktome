import { useNavigate } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeToggle from './ThemeToggle'
import { useWallet } from '../hooks/useWallet'
import { useNavigation } from '../hooks/useNavigation'
import { useEffect } from 'react'

const LandingPage = () => {
  const { isConnected } = useWallet()
  const { hasUserConnected, handleWalletConnect } = useNavigation()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect if user explicitly clicked connect
    if (isConnected && hasUserConnected) {
      navigate('/register')
    }
  }, [isConnected, hasUserConnected, navigate])

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-4">
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              Talk2Me
            </h1>
            <p className="text-black/70 dark:text-white/70 mb-8">
              Connect. Chat. Decentralize.
            </p>

            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={() => {
                    handleWalletConnect()
                    openConnectModal()
                  }}
                  type="button"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
