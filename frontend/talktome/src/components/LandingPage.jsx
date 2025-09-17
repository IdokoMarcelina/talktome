import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useRegistration } from '../hooks/useRegistration'
import { useNavigation } from '../hooks/useNavigation'
import ThemeToggle from './ThemeToggle'

const LandingPage = () => {
  const { isConnected, address } = useWallet()
  const { isRegistered, isCheckingRegistration, checkRegistration } = useRegistration(address)
  const { hasUserConnected, handleWalletConnect, handleRegistrationCheck } = useNavigation()

  useEffect(() => {
    if (isConnected && address && hasUserConnected) {
      checkRegistration().then((result) => {
        if (result) {
          handleRegistrationCheck(result.isRegistered)
        }
      })
    }
  }, [isConnected, address, hasUserConnected, checkRegistration, handleRegistrationCheck])

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-4">
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-black/10 dark:border-white/10 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Talk2Me</h1>
            <p className="text-black/70 dark:text-white/70 mb-8">Connect. Chat. Decentralize.</p>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-black/70 dark:text-white/90 mb-6">
                  Join the decentralized chat revolution with your .Talk2me ENS name
                </p>
              </div>

              {isCheckingRegistration && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-black/10 dark:bg-white/10 rounded-lg">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-black/90 dark:text-white/90">Checking registration...</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading'
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated')

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
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
                            )
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200"
                              >
                                Wrong network
                              </button>
                            )
                          }

                          return (
                            <div className="flex gap-3">
                              <button
                                onClick={openChainModal}
                                style={{ display: 'flex', alignItems: 'center' }}
                                type="button"
                                className="bg-black/20 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/30 text-black dark:text-white px-4 py-2 rounded-lg transition-all duration-200"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? 'Chain icon'}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
                              >
                                {account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ''}
                              </button>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  }}
                </ConnectButton.Custom>
              </div>

              <div className="text-center text-black/60 dark:text-white/60 text-sm">
                <p>By connecting, you agree to our terms of service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage