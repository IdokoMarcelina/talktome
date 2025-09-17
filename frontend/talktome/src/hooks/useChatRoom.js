import { useState, useEffect, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '../config/contracts'
import {
  getGlobalChatRoom,
  getChatRoomMessages,
  getUserChatRooms,
  formatMessage
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

  // Join global chat
  const joinGlobalChat = useCallback(async () => {
    if (!address) return false

    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      setError('Chat contract not deployed yet')
      return false
    }

    try {
      setError('')

      await writeContract({
        address: CONTRACTS.CHAT_DAPP.address,
        abi: CONTRACTS.CHAT_DAPP.abi,
        functionName: 'joinGlobalChat',
        args: [],
      })

      return true
    } catch (error) {
      console.error('Error joining global chat:', error)
      setError('Failed to join global chat')
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
        // First join the global chat, then load messages
        await joinGlobalChat()
        // Add a small delay to let the transaction process
        setTimeout(() => loadMessages(globalChatRoomId), 2000)
      }
    } catch (error) {
      console.error('Error loading global chat room:', error)
      setError('Failed to load global chat room')
    }
  }, [joinGlobalChat])

  // Load messages for a specific chat room
  const loadMessages = useCallback(async (chatRoomId) => {
    try {
      setError('')
      const rawMessages = await getChatRoomMessages(chatRoomId)
      const formattedMessages = rawMessages.map(formatMessage)
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)

      // Handle specific error cases
      if (error.message && error.message.includes('Not a participant')) {
        setError('You need to join this chat room first')
        // Try to join the global chat automatically
        if (chatRoomId && address) {
          console.log('Attempting to join global chat...')
          await joinGlobalChat()
        }
      } else {
        setError('Failed to load messages')
      }
    }
  }, [joinGlobalChat, address])

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
  const sendMessage = useCallback(async (content) => {
    if (!currentChatRoom || !content.trim()) return false

    // Check if contract address is properly configured
    if (!CONTRACTS.CHAT_DAPP.address || CONTRACTS.CHAT_DAPP.address === "0x...") {
      setError('Chat contract not deployed yet')
      return false
    }

    try {
      setError('')

      if (activeTab === 'group') {
        // Send group message
        await writeContract({
          address: CONTRACTS.CHAT_DAPP.address,
          abi: CONTRACTS.CHAT_DAPP.abi,
          functionName: 'sendGroupMessage',
          args: [content],
        })
      } else {
        // Send private message (would need recipient address)
        // This is a placeholder - you'd need to implement private messaging logic
        console.log('Private messaging not implemented yet')
        return false
      }

      return true
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      return false
    }
  }, [currentChatRoom, activeTab, writeContract])

  // Switch chat room
  const switchChatRoom = useCallback((chatRoomId) => {
    setCurrentChatRoom(chatRoomId)
    loadMessages(chatRoomId)
  }, [loadMessages])

  // Initialize chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true)
      try {
        await loadGlobalChatRoom()
        if (address) {
          await loadUserChatRooms()
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
        setError('Failed to initialize chat')
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      initializeChat()
    }
  }, [address, loadGlobalChatRoom, loadUserChatRooms])

  // Refresh messages when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && currentChatRoom) {
      loadMessages(currentChatRoom)
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
    loadUserChatRooms
  }
}