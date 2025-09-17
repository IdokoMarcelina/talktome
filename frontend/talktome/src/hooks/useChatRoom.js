import { useState, useEffect, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '../config/contracts'
import {
  getGlobalChatRoom,
  getChatRoomMessages,
  getUserChatRooms,
  formatMessage,
  checkGlobalChatParticipation
} from '../utils/contracts'

export const useChatRoom = (address) => {
  const [messages, setMessages] = useState([])
  const [currentChatRoom, setCurrentChatRoom] = useState(null)
  const [chatRooms, setChatRooms] = useState([])
  const [activeTab, setActiveTab] = useState('group') // 'group' or 'private'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Load messages for a specific chat room
  const loadMessages = useCallback(async (chatRoomId) => {
    try {
      setError('')
      console.log('Loading messages for chat room:', chatRoomId)
      const rawMessages = await getChatRoomMessages(chatRoomId)
      const formattedMessages = rawMessages.map(formatMessage)
      setMessages(formattedMessages)
      console.log('Successfully loaded', formattedMessages.length, 'messages')
    } catch (error) {
      console.error('Error loading messages:', error)

      // Handle specific error cases
      if (error.message && error.message.includes('Not a participant')) {
        console.warn('User is not a participant of chat room:', chatRoomId)
        throw error // Re-throw so caller can handle joining
      } else {
        setError('Failed to load messages')
        throw error
      }
    }
  }, [address])

  // Join global chat and wait for confirmation
  const joinGlobalChat = useCallback(async () => {
    if (!address) return false

    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      setError('Chat contract not deployed yet')
      return false
    }

    try {
      setError('')
      console.log('Attempting to join global chat...')

      // Start the transaction
      await writeContract({
        address: CONTRACTS.CHAT_DAPP.address,
        abi: CONTRACTS.CHAT_DAPP.abi,
        functionName: 'joinGlobalChat',
        args: [],
      })

      console.log('Join transaction submitted, waiting for confirmation...')
      return true
    } catch (error) {
      console.error('Error joining global chat:', error)

      // Handle specific RPC errors with retry
      if (error.message && error.message.includes('Internal JSON-RPC error')) {
        setError('Network connectivity issue. Please try again.')
      } else {
        setError('Failed to join global chat. Please try again.')
      }
      return false
    }
  }, [address, writeContract])

  // Load global chat room
  const loadGlobalChatRoom = useCallback(async () => {
    try {
      setError('')
      const globalChatRoomId = await getGlobalChatRoom()
      if (globalChatRoomId) {
        setCurrentChatRoom(globalChatRoomId)
        console.log('Found global chat room:', globalChatRoomId)

        // Check if user is already a participant first
        const isParticipant = await checkGlobalChatParticipation(address)
        console.log('User global chat participation status:', isParticipant)

        if (isParticipant) {
          // User is already a participant, load messages directly
          try {
            await loadMessages(globalChatRoomId)
            console.log('Successfully loaded messages - user is already a participant')
          } catch (error) {
            // Sometimes contract state isn't immediately updated, try joining anyway
            console.warn('Contract says user is participant but message loading failed, attempting to join...')
            const joinSuccess = await joinGlobalChat()
            if (joinSuccess) {
              console.log('Join transaction submitted, messages will load after confirmation')
            }
          }
        } else {
          // User is not a participant, need to join first
          console.log('User not a participant, attempting to join...')
          const joinSuccess = await joinGlobalChat()
          if (joinSuccess) {
            console.log('Join transaction submitted, messages will load after confirmation')
            // Messages will be loaded automatically when transaction confirms (see useEffect below)
          }
        }
      }
    } catch (error) {
      console.error('Error loading global chat room:', error)
      setError('Failed to load global chat room')
    }
  }, [address, joinGlobalChat, loadMessages])

  // Load user's chat rooms
  const loadUserChatRooms = useCallback(async () => {
    if (!address) return

    try {
      setError('')
      const userChatRoomIds = await getUserChatRooms(address)
      setChatRooms(userChatRoomIds)
    } catch (error) {
      console.error('Error loading user chat rooms:', error)
      setError('Failed to load chat rooms')
    }
  }, [address])

  // Send message to current chat room
  const sendMessage = useCallback(async (content, chatType = 'global', recipientAddress = null) => {
    if (!content.trim()) return false

    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      setError('Chat contract not deployed yet')
      return false
    }

    try {
      setError('')
      console.log('Sending message, type:', chatType, 'recipient:', recipientAddress)

      if (chatType === 'global') {
        // Send group message to global chat
        await writeContract({
          address: CONTRACTS.CHAT_DAPP.address,
          abi: CONTRACTS.CHAT_DAPP.abi,
          functionName: 'sendGroupMessage',
          args: [content],
        })
        console.log('Global message sent successfully')
      } else if (chatType === 'direct' && recipientAddress && currentChatRoom) {
        // Send direct message
        await writeContract({
          address: CONTRACTS.CHAT_DAPP.address,
          abi: CONTRACTS.CHAT_DAPP.abi,
          functionName: 'sendMessage',
          args: [currentChatRoom, recipientAddress, content],
        })
        console.log('Direct message sent successfully')
      } else {
        setError('Invalid message configuration')
        return false
      }

      return true
    } catch (error) {
      console.error('Error sending message:', error)

      // Handle specific error cases
      if (error.message && error.message.includes('Not a participant')) {
        setError('You need to join this chat room before sending messages')
      } else if (error.message && error.message.includes('Internal JSON-RPC error')) {
        setError('Network connectivity issue. Please try again.')
      } else {
        setError('Failed to send message. Please try again.')
      }
      return false
    }
  }, [currentChatRoom, writeContract])

  // Create direct message chat room
  const createDirectChatRoom = useCallback(async (participantAddress) => {
    if (!participantAddress) return null

    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      setError('Chat contract not deployed yet')
      return null
    }

    try {
      setError('')
      console.log('Creating direct message room with:', participantAddress)

      await writeContract({
        address: CONTRACTS.CHAT_DAPP.address,
        abi: CONTRACTS.CHAT_DAPP.abi,
        functionName: 'createDirectMessage',
        args: [participantAddress],
      })

      console.log('Direct message room creation initiated')
      return true
    } catch (error) {
      console.error('Error creating direct message room:', error)
      setError('Failed to create direct message room')
      return null
    }
  }, [writeContract])

  // Switch chat room
  const switchChatRoom = useCallback((chatRoomId) => {
    setCurrentChatRoom(chatRoomId)
    loadMessages(chatRoomId)
  }, [loadMessages])

  // Initialize chat on mount with debouncing
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true)
      try {
        console.log('Initializing chat for address:', address)

        // Stagger the calls to avoid rate limiting
        await loadGlobalChatRoom()

        if (address) {
          // Add delay before loading user chat rooms
          await new Promise(resolve => setTimeout(resolve, 500))
          await loadUserChatRooms()
        }

        console.log('Chat initialization completed')
      } catch (error) {
        console.error('Error initializing chat:', error)

        // Provide more specific error messages
        if (error.message && error.message.includes('Too Many Requests') ||
            error.message && error.message.includes('429')) {
          setError('Rate limited. Please wait a moment and try again.')
        } else if (error.message && error.message.includes('Internal JSON-RPC error')) {
          setError('Network connectivity issue. Please check your connection and try again.')
        } else if (error.message && error.message.includes('Contract')) {
          setError('Chat contracts not available. Please try again later.')
        } else {
          setError('Failed to initialize chat. Please refresh the page.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      // Add debouncing to prevent rapid re-initialization
      const timeoutId = setTimeout(() => {
        initializeChat()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [address, loadGlobalChatRoom, loadUserChatRooms])

  // Refresh messages when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && currentChatRoom) {
      console.log('Transaction confirmed, loading messages for chat room:', currentChatRoom)
      // Add a small delay to ensure the contract state is updated
      setTimeout(() => {
        loadMessages(currentChatRoom).catch(error => {
          console.error('Failed to load messages after transaction confirmation:', error)
          setError('Failed to load messages after joining chat')
        })
      }, 1000)
    }
  }, [isConfirmed, currentChatRoom, loadMessages])

  return {
    messages,
    currentChatRoom,
    chatRooms,
    activeTab,
    isLoading: isLoading || isWritePending || isConfirming,
    error: error || writeError?.message,
    isWritePending,
    isConfirming,
    hash,
    setActiveTab,
    sendMessage,
    joinGlobalChat,
    switchChatRoom,
    loadMessages,
    loadUserChatRooms,
    createDirectChatRoom
  }
}