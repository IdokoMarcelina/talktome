# Talk2Me Chat DApp - Frontend Setup Guide

A decentralized chat application built with React, RainbowKit, and smart contracts that allows users to register with .Talk2me ENS names and chat in groups or privately.

## Features

- **Wallet Connection**: Seamless wallet connection using RainbowKit
- **ENS Registration**: Register custom .Talk2me ENS names with profile pictures
- **Group Chat**: Real-time group messaging for all registered users
- **Private Messaging**: Direct messages between users
- **Transaction Signing**: All messages require blockchain transaction signatures
- **IPFS Integration**: Profile pictures stored on IPFS
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ installed
- A Web3 wallet (MetaMask, WalletConnect compatible)
- Access to an Ethereum-compatible blockchain (mainnet, testnet, or local)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**

   Update the following configuration files with your actual values:

   **src/config/wagmi.js**
   ```javascript
   export const config = getDefaultConfig({
     appName: 'Talk2Me Chat DApp',
     projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
     chains: [mainnet, polygon, optimism, arbitrum],
     ssr: false,
   })
   ```

   **src/config/contracts.js**
   ```javascript
   export const CONTRACTS = {
     ENS_REGISTRY: {
       address: "0x...", // Your deployed ENS Registry contract address
       // ... ABI is already included
     },
     CHAT_DAPP: {
       address: "0x...", // Your deployed ChatDApp contract address
       // ... ABI is already included
     }
   }
   ```

   **src/utils/ipfs.js**
   ```javascript
   const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer YOUR_PINATA_JWT`, // Get from https://pinata.cloud
     },
     body: formData,
   })
   ```

## Smart Contract Requirements

Make sure you have deployed the following contracts:

1. **ENSRegistry.sol** - Handles user registration and profile management
2. **ChatDApp.sol** - Manages chat rooms and messaging

The contract addresses need to be updated in `src/config/contracts.js`.

## Getting Started

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Connect your wallet** on the landing page

4. **Register your profile** with a .Talk2me ENS name and profile picture

5. **Start chatting** in the global chat room

## Application Flow

### 1. Landing Page (`/`)
- Users see the welcome screen
- Connect wallet button using RainbowKit
- Automatic registration check after wallet connection
- Redirects to register page if not registered, chat page if registered

### 2. Register Page (`/register`)
- Upload profile picture (stored on IPFS)
- Choose ENS name (automatically appends .Talk2me)
- Add optional bio
- Sign transaction to register on blockchain
- Loading states for IPFS upload and transaction confirmation

### 3. Chat Page (`/chat`)
- Join global chat automatically
- Send group messages (all require transaction signing)
- Real-time message updates via contract events
- Transaction confirmation feedback
- Message history loaded from blockchain

## Key Features Implementation

### Wallet Connection
- Uses RainbowKit for seamless wallet connection
- Supports multiple wallet providers
- Network switching capability
- Custom connect button styling

### Transaction Management
- All actions require signed transactions
- Loading states during transaction processing
- Transaction hash display
- Error handling for failed transactions
- No infinite loops - proper state management

### IPFS Integration
- Profile pictures uploaded to IPFS
- Pinata service integration
- Fallback mock hash for development
- Image preview before upload

### Real-time Updates
- Contract event listeners for new messages
- Automatic message refresh on events
- Scroll to bottom on new messages
- Optimistic UI updates

## Security Features

- All messages stored on blockchain
- Profile data integrity via smart contracts
- Wallet signature required for all actions
- ENS name uniqueness enforced
- Input validation and sanitization

## Styling

- TailwindCSS for responsive design
- Glass morphism effects
- Gradient backgrounds
- Custom animations
- Mobile-first responsive design

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment Notes

1. **Update Contract Addresses**: Ensure all contract addresses in config files point to your deployed contracts
2. **IPFS Configuration**: Set up proper IPFS/Pinata credentials
3. **Wallet Connect**: Register your domain with WalletConnect
4. **Network Configuration**: Update chain configurations for your target network

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Check WalletConnect project ID
   - Ensure correct network configuration
   - Try refreshing page and reconnecting

2. **Transaction Failures**
   - Verify contract addresses are correct
   - Check wallet has sufficient gas
   - Ensure user is on correct network

3. **IPFS Upload Issues**
   - Verify Pinata JWT token
   - Check file size limits (5MB max)
   - Test with smaller images

4. **Registration Not Working**
   - Ensure ENS Registry contract is deployed
   - Check if ENS name already exists
   - Verify transaction succeeded on block explorer

### Error Messages

- **"User must be registered with ENS"**: Complete registration first
- **"ENS name already taken"**: Choose a different name
- **"Not a participant of this chat room"**: Join the chat room first
- **"Image size should be less than 5MB"**: Compress the image

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.