// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useChatRoom } from "../hooks/useChatRoom";

export default function ChatPage() {
  const { selectedUser, messages, sendMessage } = useChatRoom();
  const { wallet } = useWallet();

  const [newMessage, setNewMessage] = useState("");

  // Safely extract addresses
  const userAddress = selectedUser?.address;
  const walletAddress = wallet?.address;

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!walletAddress || !userAddress) return;

    sendMessage({
      sender: walletAddress,
      recipient: userAddress,
      content: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  // Show fallback UI if no user or no wallet connected
  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">⚡ Connect your wallet to start chatting</p>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">👤 Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-orange-500">
          Chat with {selectedUser?.name || userAddress}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages?.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-xs ${
                msg.sender === walletAddress
                  ? "ml-auto bg-orange-500 text-white"
                  : "mr-auto bg-gray-200 dark:bg-gray-800 dark:text-white"
              }`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-900 dark:text-white focus:outline-none"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
