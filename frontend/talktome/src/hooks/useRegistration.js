import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { checkUserRegistration } from '../utils/contracts'
import { CONTRACTS } from '../config/contracts'
import { uploadToIPFS } from '../utils/ipfs'

export const useRegistration = (address) => {
  const navigate = useNavigate()
  const [isRegistered, setIsRegistered] = useState(false)
  const [userRecord, setUserRecord] = useState(null)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false)
  const [registrationError, setRegistrationError] = useState('')

  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Check if user is registered
  const checkRegistration = useCallback(async () => {
    if (!address) return

    try {
      setIsCheckingRegistration(true)
      setRegistrationError('')

      // Add retry logic for RPC errors
      let retries = 3
      let result = null

      while (retries > 0 && !result) {
        try {
          result = await checkUserRegistration(address)
          break
        } catch (error) {
          retries--
          console.warn(`Registration check attempt failed, ${retries} retries left:`, error.message)

          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            throw error
          }
        }
      }

      setIsRegistered(result.isRegistered)
      setUserRecord(result.userRecord)
      return result
    } catch (error) {
      console.error('Error checking registration after all retries:', error)

      // Handle specific RPC errors
      if (error.message && error.message.includes('Internal JSON-RPC error')) {
        setRegistrationError('Network connectivity issue. Please try again.')
      } else {
        setRegistrationError('Failed to check registration status')
      }

      return { isRegistered: false, userRecord: null }
    } finally {
      setIsCheckingRegistration(false)
    }
  }, [address])

  // Register user with ENS
  const registerUser = useCallback(async (formData) => {
    if (!address) {
      setRegistrationError('No wallet connected')
      return false
    }

    // Check if contract address is properly configured
    if (!CONTRACTS.ENS_REGISTRY.address || CONTRACTS.ENS_REGISTRY.address === "0x...") {
      setRegistrationError('Contract not deployed yet. Registration will be available once contracts are deployed.')
      return false
    }

    if (!formData.ensName.trim()) {
      setRegistrationError('ENS name is required')
      return false
    }

    if (!formData.profileImage) {
      setRegistrationError('Profile image is required')
      return false
    }

    try {
      setRegistrationError('')
      setIsUploadingToIPFS(true)

      // Upload image to IPFS
      const ipfsUrl = await uploadToIPFS(formData.profileImage)
      setIsUploadingToIPFS(false)

      // Register ENS with smart contract
      await writeContract({
        address: CONTRACTS.ENS_REGISTRY.address,
        abi: CONTRACTS.ENS_REGISTRY.abi,
        functionName: 'registerENS',
        args: [
          formData.ensName + '.Talk2me',
          ipfsUrl,
          '' // Empty bio since we removed it
        ],
      })

      return true
    } catch (error) {
      console.error('Registration error:', error)
      setRegistrationError('Registration failed. Please try again.')
      return false
    } finally {
      setIsUploadingToIPFS(false)
    }
  }, [address, writeContract])

  // Navigate to chat when registration is confirmed
  useEffect(() => {
    if (isConfirmed) {
      navigate('/chat')
    }
  }, [isConfirmed, navigate])

  

  // Check registration on mount if address is available
  useEffect(() => {
    if (address) {
      checkRegistration()
    }
  }, [address, checkRegistration])

  const isLoading = isCheckingRegistration || isUploadingToIPFS || isWritePending || isConfirming

  return {
    isRegistered,
    userRecord,
    isCheckingRegistration,
    isUploadingToIPFS,
    registrationError: registrationError || writeError?.message,
    isLoading,
    isWritePending,
    isConfirming,
    isConfirmed,
    hash,
    checkRegistration,
    registerUser
  }
}