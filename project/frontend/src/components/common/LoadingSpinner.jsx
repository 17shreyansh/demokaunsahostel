const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'text-center py-12'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full border-4 border-yellow-custom border-t-transparent ${sizeClasses[size]} mx-auto mb-4`}></div>
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  )
}

export default LoadingSpinner