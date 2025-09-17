// Lisk Sepolia network configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: '0x106A', // 4202 in hex
  chainName: 'Lisk Sepolia',
  rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
}

// Add Lisk Sepolia network to MetaMask
export const addLiskSepoliaNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [LISK_SEPOLIA_CONFIG],
    })
    return true
  } catch (error) {
    console.error('Failed to add Lisk Sepolia network:', error)

    // If the chain already exists, try to switch to it
    if (error.code === 4902) {
      return await switchToLiskSepolia()
    }

    throw error
  }
}

// Switch to Lisk Sepolia network
export const switchToLiskSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: LISK_SEPOLIA_CONFIG.chainId }],
    })
    return true
  } catch (error) {
    console.error('Failed to switch to Lisk Sepolia network:', error)

    // If the network doesn't exist, add it
    if (error.code === 4902) {
      return await addLiskSepoliaNetwork()
    }

    throw error
  }
}

// Check if user is on the correct network
export const isOnLiskSepolia = async () => {
  if (!window.ethereum) {
    return false
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    return chainId === LISK_SEPOLIA_CONFIG.chainId
  } catch (error) {
    console.error('Failed to check network:', error)
    return false
  }
}

// Auto-switch to Lisk Sepolia with user confirmation
export const ensureLiskSepoliaNetwork = async () => {
  try {
    const isCorrectNetwork = await isOnLiskSepolia()

    if (!isCorrectNetwork) {
      console.log('Wrong network detected, switching to Lisk Sepolia...')
      await switchToLiskSepolia()
      return true
    }

    return true
  } catch (error) {
    console.error('Failed to ensure correct network:', error)
    throw new Error('Please switch to Lisk Sepolia network in MetaMask')
  }
}