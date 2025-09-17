

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track connection stability
  useEffect(() => {
    if (isConnected && address && !isConnecting && !isReconnecting) {
      // Wait a bit to ensure connection is stable
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [isConnected, address, isConnecting, isReconnecting]);

  const connectWallet = async (connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected: mounted && isConnected && isStable,
    isConnecting: isConnecting || isLoading || isReconnecting || (isConnected && !isStable),
    connectors,
    connect: connectWallet,
    disconnect: disconnectWallet,
    formatAddress,
    error,
    pendingConnector,
    isStable,
  };
};