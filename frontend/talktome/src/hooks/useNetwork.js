import { useState, useEffect, useCallback } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'
import {
  addLiskSepoliaNetwork,
  switchToLiskSepolia,
  isOnLiskSepolia,
  ensureLiskSepoliaNetwork
} from '../utils/network'

export const useNetwork = () => {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(true)
  const [networkError, setNetworkError] = useState('')

  const LISK_SEPOLIA_CHAIN_ID = 4202

  // Check if on correct network
  const checkNetwork = useCallback(async () => {
    try {
      setIsCheckingNetwork(true)
      setNetworkError('')

      const correct = await isOnLiskSepolia()
      setIsCorrectNetwork(correct)

      if (!correct && chainId) {
        setNetworkError('Please switch to Lisk Sepolia network')
      }
    } catch (error) {
      console.error('Error checking network:', error)
      setNetworkError('Failed to check network')
    } finally {
      setIsCheckingNetwork(false)
    }
  }, [chainId])

  // Switch to Lisk Sepolia
  const switchToLiskSepoliaNetwork = useCallback(async () => {
    try {
      setNetworkError('')

      // Try using wagmi first
      if (switchChain) {
        try {
          await switchChain({ chainId: LISK_SEPOLIA_CHAIN_ID })
          return true
        } catch (wagmiError) {
          console.log('Wagmi switch failed, trying manual switch...')
        }
      }

      // Fallback to manual MetaMask switch
      await switchToLiskSepolia()
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      setNetworkError('Failed to switch to Lisk Sepolia network')
      return false
    }
  }, [switchChain])

  // Add Lisk Sepolia network
  const addNetwork = useCallback(async () => {
    try {
      setNetworkError('')
      await addLiskSepoliaNetwork()
      return true
    } catch (error) {
      console.error('Failed to add network:', error)
      setNetworkError('Failed to add Lisk Sepolia network')
      return false
    }
  }, [])

  // Ensure correct network with automatic switching
  const ensureCorrectNetwork = useCallback(async () => {
    try {
      setNetworkError('')
      await ensureLiskSepoliaNetwork()
      await checkNetwork()
      return true
    } catch (error) {
      console.error('Failed to ensure correct network:', error)
      setNetworkError(error.message || 'Failed to switch to correct network')
      return false
    }
  }, [checkNetwork])

  // Check network on mount and when chainId changes
  useEffect(() => {
    checkNetwork()
  }, [checkNetwork])

  // Listen for network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = () => {
        // Reload the page when network changes to avoid stale state
        window.location.reload()
      }

      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return {
    chainId,
    isCorrectNetwork,
    isCheckingNetwork,
    networkError,
    switchToLiskSepoliaNetwork,
    addNetwork,
    ensureCorrectNetwork,
    checkNetwork
  }
}