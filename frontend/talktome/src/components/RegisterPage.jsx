import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useRegistration } from '../hooks/useRegistration'
import ThemeToggle from './ThemeToggle'

const RegisterPage = () => {
  const { address } = useWallet()
  const {
    registerUser,
    registrationError,
    isLoading,
    isUploadingToIPFS,
    isWritePending,
    isConfirming,
    hash
  } = useRegistration(address)

  const [formData, setFormData] = useState({
    ensName: '',
    profileImage: null
  })
  const [previewImage, setPreviewImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return
      }

      setFormData(prev => ({ ...prev, profileImage: file }))

      const reader = new FileReader()
      reader.onload = (e) => setPreviewImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await registerUser(formData)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-4">
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-black/10 dark:border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Create Your Profile</h1>
            <p className="text-black/70 dark:text-white/70">Get your .Talk2me ENS name</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-black/20 dark:bg-white/20 border-2 border-dashed border-black/40 dark:border-white/40 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <svg className="w-8 h-8 text-black/60 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
              </div>
              <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200 inline-block">
                Upload Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* ENS Name Input */}
            <div>
              <label className="block text-black/90 dark:text-white/90 text-sm font-medium mb-2">
                Choose your ENS name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ensName"
                  value={formData.ensName}
                  onChange={handleInputChange}
                  placeholder="yourname"
                  className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-lg px-4 py-3 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <span className="absolute right-3 top-3 text-black/70 dark:text-white/70">.Talk2me</span>
              </div>
            </div>


            {/* Error Message */}
            {registrationError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 dark:text-red-300 text-sm">{registrationError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:opacity-50"
            >
              {isUploadingToIPFS && 'Uploading to IPFS...'}
              {isWritePending && 'Preparing Transaction...'}
              {isConfirming && 'Confirming Registration...'}
              {!isLoading && 'Register'}
            </button>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-black/10 dark:bg-white/10 rounded-lg">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-black/90 dark:text-white/90">Processing...</span>
                </div>
              </div>
            )}
          </form>

          {/* Transaction Hash */}
          {hash && (
            <div className="mt-4 p-3 bg-black/10 dark:bg-white/10 rounded-lg">
              <p className="text-black/70 dark:text-white/70 text-xs">Transaction Hash:</p>
              <p className="text-black dark:text-white text-xs font-mono break-all">{hash}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage