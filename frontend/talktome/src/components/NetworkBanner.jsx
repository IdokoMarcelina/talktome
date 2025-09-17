import { useNetwork } from '../hooks/useNetwork'

const NetworkBanner = () => {
  const {
    isCorrectNetwork,
    isCheckingNetwork,
    networkError,
    switchToLiskSepoliaNetwork,
    ensureCorrectNetwork
  } = useNetwork()

  // Don't show banner if network is correct or still checking
  if (isCorrectNetwork || isCheckingNetwork) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Wrong Network</p>
            <p className="text-sm opacity-90">
              {networkError || 'Please switch to Lisk Sepolia network to use this app'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={switchToLiskSepoliaNetwork}
            className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Switch Network
          </button>
          <button
            onClick={ensureCorrectNetwork}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Auto-Switch
          </button>
        </div>
      </div>
    </div>
  )
}

export default NetworkBanner