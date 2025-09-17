import { readContract } from 'wagmi/actions'
import { config } from '../config/wagmi'
import { CONTRACTS } from '../config/contracts'

// Rate limiting cache
const contractCallCache = new Map()
const CACHE_DURATION = 5000 // 5 seconds cache

const getCachedResult = (key) => {
  const cached = contractCallCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedResult = (key, data) => {
  contractCallCache.set(key, { data, timestamp: Date.now() })
}

export const checkUserRegistration = async (address) => {
  const cacheKey = `registration_${address}`

  // Check cache first
  const cached = getCachedResult(cacheKey)
  if (cached) {
    console.log('Using cached registration result for', address)
    return cached
  }

  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.ENS_REGISTRY.address || CONTRACTS.ENS_REGISTRY.address === "0x...") {
      console.warn('Contract address not properly configured. Skipping registration check.')
      return { isRegistered: false, userRecord: null }
    }

    // Add delay to prevent too many requests
    await new Promise(resolve => setTimeout(resolve, 100))

    // Try to check if user is registered
    let isRegistered = false
    try {
      isRegistered = await readContract(config, {
        address: CONTRACTS.ENS_REGISTRY.address,
        abi: CONTRACTS.ENS_REGISTRY.abi,
        functionName: 'checkIsRegistered',
        args: [address],
      })
    } catch (contractError) {
      // Handle specific RPC errors
      if (contractError.message && contractError.message.includes('Too Many Requests') ||
          contractError.message && contractError.message.includes('429')) {
        console.warn('Rate limited, retrying after delay...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        // Try once more after delay
        try {
          isRegistered = await readContract(config, {
            address: CONTRACTS.ENS_REGISTRY.address,
            abi: CONTRACTS.ENS_REGISTRY.abi,
            functionName: 'checkIsRegistered',
            args: [address],
          })
        } catch (retryError) {
          console.warn('Retry failed, assuming user is not registered')
          return { isRegistered: false, userRecord: null }
        }
      } else if (contractError.message && contractError.message.includes('Internal JSON-RPC error')) {
        throw new Error('Internal JSON-RPC error: Network connectivity issue')
      } else {
        // If isRegistered function reverts, assume user is not registered
        console.warn('isRegistered function reverted, assuming user is not registered:', contractError.message)
        return { isRegistered: false, userRecord: null }
      }
    }

    if (isRegistered) {
      try {
        // Add delay between calls
        await new Promise(resolve => setTimeout(resolve, 200))

        const userRecord = await readContract(config, {
          address: CONTRACTS.ENS_REGISTRY.address,
          abi: CONTRACTS.ENS_REGISTRY.abi,
          functionName: 'getUserRecord',
          args: [address],
        })

        const result = { isRegistered: true, userRecord }
        setCachedResult(cacheKey, result)
        return result
      } catch (recordError) {
        // Handle RPC errors for getUserRecord too
        if (recordError.message && recordError.message.includes('Too Many Requests') ||
            recordError.message && recordError.message.includes('429')) {
          console.warn('Rate limited on getUserRecord, using basic registration info')
          const result = { isRegistered: true, userRecord: null }
          setCachedResult(cacheKey, result)
          return result
        } else if (recordError.message && recordError.message.includes('Internal JSON-RPC error')) {
          throw new Error('Internal JSON-RPC error: Network connectivity issue')
        }

        console.warn('getUserRecord failed, but user is registered:', recordError.message)
        const result = { isRegistered: true, userRecord: null }
        setCachedResult(cacheKey, result)
        return result
      }
    }

    const result = { isRegistered: false, userRecord: null }
    setCachedResult(cacheKey, result)
    return result
  } catch (error) {
    console.error('Error checking registration:', error)

    // Cache negative result briefly to avoid repeated failures
    if (error.message && error.message.includes('Too Many Requests')) {
      const result = { isRegistered: false, userRecord: null }
      setCachedResult(cacheKey, result)
      return result
    }

    throw error // Re-throw to let the hook handle retries
  }
}

export const getGlobalChatRoom = async () => {
  const cacheKey = 'globalChatRoom'

  // Check cache first
  const cached = getCachedResult(cacheKey)
  if (cached) {
    console.log('Using cached global chat room result')
    return cached
  }

  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      console.warn('Chat contract address not properly configured.')
      return null
    }

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 150))

    const globalChatRoomId = await readContract(config, {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'getGlobalChatRoom',
    })

    // Cache the result for longer since global chat room doesn't change
    contractCallCache.set(cacheKey, { data: globalChatRoomId, timestamp: Date.now() })
    return globalChatRoomId
  } catch (error) {
    console.error('Error getting global chat room:', error)

    // Handle rate limiting
    if (error.message && (error.message.includes('Too Many Requests') || error.message.includes('429'))) {
      console.warn('Rate limited on getGlobalChatRoom, using fallback')
      return null
    }

    // Handle contract not deployed or function not found
    if (error.message && (error.message.includes('function') || error.message.includes('reverted'))) {
      console.warn('Global chat room not available - contract may not be properly deployed')
    }

    return null
  }
}

export const getChatRoomMessages = async (chatRoomId, offset = 0, limit = 50) => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      console.warn('Chat contract address not properly configured.')
      return []
    }

    const messages = await readContract(config, {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'getChatRoomMessages',
      args: [chatRoomId, offset, limit],
    })
    return messages
  } catch (error) {
    console.error('Error getting messages:', error)

    // Handle specific contract errors
    if (error.message && error.message.includes('Not a participant')) {
      // Re-throw with cleaner message for the hook to handle
      throw new Error('Not a participant of this chat room')
    } else if (error.message && error.message.includes('reverted')) {
      throw new Error('Contract call failed - please try again')
    }

    return []
  }
}

export const getUserChatRooms = async (userAddress) => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      console.warn('Chat contract address not properly configured.')
      return []
    }

    const chatRooms = await readContract(config, {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'getUserChatRooms',
      args: [userAddress],
    })
    return chatRooms
  } catch (error) {
    console.error('Error getting user chat rooms:', error)
    return []
  }
}

export const formatMessage = (message) => {
  return {
    sender: message.sender,
    recipient: message.recipient,
    content: message.content,
    timestamp: Number(message.timestamp) * 1000, // Convert to milliseconds
    isRead: message.isRead,
    isGroupMessage: message.recipient === '0x0000000000000000000000000000000000000000'
  }
}

export const formatChatRoomId = (chatRoomId) => {
  return chatRoomId
}

export const checkGlobalChatParticipation = async (userAddress) => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      console.warn('Chat contract address not properly configured.')
      return false
    }

    const isParticipant = await readContract(config, {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'isParticipantOfGlobalChat',
      args: [userAddress],
    })
    return isParticipant
  } catch (error) {
    console.error('Error checking global chat participation:', error)
    return false
  }
}

export const getAllRegisteredUsers = async () => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.ENS_REGISTRY.address || CONTRACTS.ENS_REGISTRY.address === "0x...") {
      console.warn('ENS Registry contract address not properly configured.')
      return []
    }

    const addresses = await readContract(config, {
      address: CONTRACTS.ENS_REGISTRY.address,
      abi: CONTRACTS.ENS_REGISTRY.abi,
      functionName: 'getAllRegisteredAddresses',
    })

    // Get user records for each address
    const users = await Promise.all(
      addresses.map(async (address) => {
        try {
          const userRecord = await readContract(config, {
            address: CONTRACTS.ENS_REGISTRY.address,
            abi: CONTRACTS.ENS_REGISTRY.abi,
            functionName: 'getUserRecord',
            args: [address],
          })
          return {
            address,
            ensName: userRecord.ensName,
            profileImageIPFS: userRecord.profileImageIPFS,
            bio: userRecord.bio,
            registrationTime: userRecord.registrationTime,
            isActive: userRecord.isActive
          }
        } catch (error) {
          console.error('Error getting user record for', address, error)
          return null
        }
      })
    )

    return users.filter(user => user !== null && user.isActive)
  } catch (error) {
    console.error('Error getting all registered users:', error)
    return []
  }
}

export const createDirectMessage = async (participantAddress) => {
  try {
    // This would be handled by wagmi's writeContract in the component
    // We're just providing the contract call structure
    return {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'createDirectMessage',
      args: [participantAddress],
    }
  } catch (error) {
    console.error('Error creating direct message setup:', error)
    throw error
  }
}