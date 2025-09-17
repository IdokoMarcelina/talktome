export const uploadToIPFS = async (file) => {
  try {
    // Check if we have a real Pinata JWT configured
    const pinataJWT = import.meta.env.VITE_PINATA_JWT;

    console.log('Pinata JWT available:', !!pinataJWT);
    console.log('Pinata JWT length:', pinataJWT?.length || 0);

    if (pinataJWT && pinataJWT !== 'YOUR_PINATA_JWT' && pinataJWT.length > 20) {
      console.log('Attempting Pinata upload...');

      const formData = new FormData();
      formData.append('file', file);

      // Add metadata
      const metadata = JSON.stringify({
        name: `talk2me_profile_${Date.now()}`,
        keyvalues: {
          app: 'talk2me',
          uploadTime: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      console.log('Pinata response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Pinata upload successful:', data.IpfsHash);
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      } else {
        const errorText = await response.text();
        console.error('Pinata upload failed:', response.status, errorText);

        // Handle specific Pinata errors
        if (response.status === 403 && errorText.includes('NO_SCOPES_FOUND')) {
          console.warn('❌ Pinata JWT missing required scopes. Please update your Pinata key with "pinFileToIPFS" permissions.');
          console.warn('📝 To fix: Go to Pinata.cloud → API Keys → Create new key with "pinFileToIPFS" scope');
        }

        throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
      }
    } else {
      console.warn('Pinata JWT not configured properly or too short');
    }

    // Development fallback: Convert file to data URL
    console.warn('Using development IPFS fallback - file converted to data URL');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create a mock IPFS-style URL with the data
        const dataUrl = e.target.result;
        console.log('Created data URL fallback');
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });

  } catch (error) {
    console.error('IPFS upload error:', error);

    // Show user-friendly message for common errors
    if (error.message.includes('NO_SCOPES_FOUND')) {
      console.warn('🔄 Pinata permissions issue - using local storage fallback');
    } else {
      console.warn('🔄 Pinata unavailable - using local storage fallback');
    }

    // Ultimate fallback: Convert file to data URL
    console.warn('Using data URL fallback for development');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }
};

export const getIPFSUrl = (hash) => {
  if (hash.startsWith('http')) {
    return hash;
  }
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};