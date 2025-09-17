export const uploadToIPFS = async (file) => {
  try {
    // Check if we have a real Pinata JWT configured
    const pinataJWT = import.meta.env.VITE_PINATA_JWT;

    if (pinataJWT && pinataJWT !== 'YOUR_PINATA_JWT') {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      }
    }

    // Development fallback: Convert file to data URL
    console.warn('Using development IPFS fallback - file converted to data URL');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create a mock IPFS-style URL with the data
        const dataUrl = e.target.result;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });

  } catch (error) {
    console.error('IPFS upload error:', error);

    // Ultimate fallback: Create a mock IPFS hash
    const mockHash = `QmMockHash${Date.now()}`;
    return `https://gateway.pinata.cloud/ipfs/${mockHash}`;
  }
};

export const getIPFSUrl = (hash) => {
  if (hash.startsWith('http')) {
    return hash;
  }
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};