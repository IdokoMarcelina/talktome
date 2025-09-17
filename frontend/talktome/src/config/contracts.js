export const CONTRACTS = {
  ENS_REGISTRY: {
    address: "0xe635F635540F09eec503376A170Fc4bad928EBb7",
    abi: [
      {
        "inputs": [
          {"internalType": "string", "name": "_ensName", "type": "string"},
          {"internalType": "string", "name": "_profileImageIPFS", "type": "string"},
          {"internalType": "string", "name": "_bio", "type": "string"}
        ],
        "name": "registerENS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "checkIsRegistered",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "getUserRecord",
        "outputs": [
          {
            "components": [
              {"internalType": "address", "name": "owner", "type": "address"},
              {"internalType": "string", "name": "ensName", "type": "string"},
              {"internalType": "string", "name": "profileImageIPFS", "type": "string"},
              {"internalType": "string", "name": "bio", "type": "string"},
              {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
              {"internalType": "bool", "name": "isActive", "type": "bool"}
            ],
            "internalType": "struct ENSRegistry.ENSRecord",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getAllRegisteredAddresses",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  CHAT_DAPP: {
    address: "0x013b2134021F8166240f345e635085847086b252", 
    abi: [
      {
        "inputs": [{"internalType": "string", "name": "_content", "type": "string"}],
        "name": "sendGroupMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "bytes32", "name": "_chatRoomId", "type": "bytes32"},
          {"internalType": "address", "name": "_recipient", "type": "address"},
          {"internalType": "string", "name": "_content", "type": "string"}
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_participant", "type": "address"}],
        "name": "createDirectMessage",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "joinGlobalChat",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getGlobalChatRoom",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "bytes32", "name": "_chatRoomId", "type": "bytes32"},
          {"internalType": "uint256", "name": "_offset", "type": "uint256"},
          {"internalType": "uint256", "name": "_limit", "type": "uint256"}
        ],
        "name": "getChatRoomMessages",
        "outputs": [
          {
            "components": [
              {"internalType": "address", "name": "sender", "type": "address"},
              {"internalType": "address", "name": "recipient", "type": "address"},
              {"internalType": "string", "name": "content", "type": "string"},
              {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
              {"internalType": "bool", "name": "isRead", "type": "bool"}
            ],
            "internalType": "struct ChatDApp.Message[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "getUserChatRooms",
        "outputs": [{"internalType": "bytes32[]", "name": "", "type": "bytes32[]"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "bytes32", "name": "_chatRoomId", "type": "bytes32"},
          {"internalType": "address", "name": "_user", "type": "address"}
        ],
        "name": "isParticipantOfChatRoom",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "isParticipantOfGlobalChat",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "_participant", "type": "address"}],
        "name": "createDirectMessage",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
};

export const CHAIN_CONFIG = {
  chainId: 4202, // Lisk Sepolia testnet
  chainName: "Lisk Sepolia",
  rpcUrls: ["https://rpc.sepolia-api.lisk.com"],
  blockExplorer: "https://sepolia-blockscout.lisk.com"
};