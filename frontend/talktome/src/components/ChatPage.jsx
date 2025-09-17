import { useState, useEffect, useRef } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { CONTRACTS } from '../config/contracts'
import { useWallet } from '../hooks/useWallet'
import { useRegistration } from '../hooks/useRegistration'
import { useChatRoom } from '../hooks/useChatRoom'
import ThemeToggle from './ThemeToggle'

const ChatPage = () => {
  const { address, isConnected, formatAddress } = useWallet()
  const { userRecord } = useRegistration(address)
  const {
    messages,
    currentChatRoom,
    chatRooms,
    activeTab,
    isLoading,
    error,
    isWritePending,
    isConfirming,
    hash,
    setActiveTab,
    sendMessage,
    joinGlobalChat,
    switchChatRoom,
    loadMessages
  } = useChatRoom(address)

  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const [messageInput, setMessageInput] = useState('')

  // Watch for new messages
  useWatchContractEvent({
    address: CONTRACTS.CHAT_DAPP.address,
    abi: CONTRACTS.CHAT_DAPP.abi,
    eventName: 'GroupMessageSent',
    onLogs(logs) {
      console.log('New group message:', logs)
      if (activeTab === 'group' && currentChatRoom) {
        loadMessages(currentChatRoom)
      }
    },
  })

  useWatchContractEvent({
    address: CONTRACTS.CHAT_DAPP.address,
    abi: CONTRACTS.CHAT_DAPP.abi,
    eventName: 'MessageSent',
    onLogs(logs) {
      console.log('New private message:', logs)
      if (activeTab === 'private' && currentChatRoom) {
        loadMessages(currentChatRoom)
      }
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Redirect to register if not registered
  useEffect(() => {
    if (!isConnected) {
      navigate('/')
    } else if (userRecord === null && address) {
      // User is connected but not registered
      navigate('/register')
    }
  }, [isConnected, userRecord, address, navigate])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageInput.trim()) return

    const success = await sendMessage(messageInput.trim())
    if (success) {
      setMessageInput('')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-4 bg-black/10 dark:bg-white/10 rounded-lg backdrop-blur-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-black dark:text-white text-lg">Loading Chat...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-t-2xl border border-black/10 dark:border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black dark:text-white">Talk2Me</h1>
              {userProfile && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                  <span className="text-black/90 dark:text-white/90">{userProfile.ensName}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('group')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'group'
                    ? 'bg-orange-500 text-white'
                    : 'bg-black/10 dark:bg-white/20 text-black/70 dark:text-white/70 hover:bg-black/20 dark:hover:bg-white/30'
                }`}
              >
                Group Chat
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'private'
                    ? 'bg-orange-500 text-white'
                    : 'bg-black/10 dark:bg-white/20 text-black/70 dark:text-white/70 hover:bg-black/20 dark:hover:bg-white/30'
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg border-l border-r border-black/10 dark:border-white/20 h-96 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-black/60 dark:text-white/60 py-8">
              <p>No messages yet. Be the first to say hello!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === address ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === address
                      ? 'bg-orange-500 text-white'
                      : 'bg-black/10 dark:bg-white/20 text-black dark:text-white'
                  }`}
                >
                  {message.sender !== address && (
                    <p className="text-xs opacity-70 mb-1">
                      {formatAddress(message.sender)}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-b-2xl border border-black/10 dark:border-white/10 p-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 mb-4">
              <p className="text-red-400 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Type your ${activeTab} message...`}
              className="flex-1 bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-lg px-4 py-3 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isWritePending || isConfirming}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || isWritePending || isConfirming}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isWritePending && 'Signing...'}
              {isConfirming && 'Sending...'}
              {!isWritePending && !isConfirming && 'Send'}
            </button>
          </form>

          {hash && (
            <div className="mt-3 p-2 bg-black/10 dark:bg-white/10 rounded-lg">
              <p className="text-black/70 dark:text-white/70 text-xs">Transaction: {formatAddress(hash)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage