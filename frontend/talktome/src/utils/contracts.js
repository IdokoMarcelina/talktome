import { readContract } from 'wagmi/actions'
import { config } from '../config/wagmi'
import { CONTRACTS } from '../config/contracts'

export const checkUserRegistration = async (address) => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.ENS_REGISTRY.address || CONTRACTS.ENS_REGISTRY.address === "0x...") {
      console.warn('Contract address not properly configured. Skipping registration check.')
      return { isRegistered: false, userRecord: null }
    }

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
      // If isRegistered function reverts, assume user is not registered
      // This could happen if the function doesn't exist or the user is not in the registry
      console.warn('isRegistered function reverted, assuming user is not registered:', contractError.message)
      return { isRegistered: false, userRecord: null }
    }

    if (isRegistered) {
      try {
        const userRecord = await readContract(config, {
          address: CONTRACTS.ENS_REGISTRY.address,
          abi: CONTRACTS.ENS_REGISTRY.abi,
          functionName: 'getUserRecord',
          args: [address],
        })
        return { isRegistered: true, userRecord }
      } catch (recordError) {
        console.warn('getUserRecord failed, but user is registered:', recordError.message)
        return { isRegistered: true, userRecord: null }
      }
    }

    return { isRegistered: false, userRecord: null }
  } catch (error) {
    console.error('Error checking registration:', error)
    return { isRegistered: false, userRecord: null }
  }
}

export const getGlobalChatRoom = async () => {
  try {
    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      console.warn('Chat contract address not properly configured.')
      return null
    }

    const globalChatRoomId = await readContract(config, {
      address: CONTRACTS.CHAT_DAPP.address,
      abi: CONTRACTS.CHAT_DAPP.abi,
      functionName: 'getGlobalChatRoom',
    })
    return globalChatRoomId
  } catch (error) {
    console.error('Error getting global chat room:', error)

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