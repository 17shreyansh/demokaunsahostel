import { Link } from 'react-router-dom'

const ErrorDisplay = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry = null,
  showBackButton = true,
  backTo = '/',
  backLabel = 'Go Back',
  fullScreen = false,
  className = ''
}) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'text-center py-12'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-yellow-custom hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors w-full"
            >
              Try Again
            </button>
          )}
          {showBackButton && (
            <Link 
              to={backTo} 
              className="block bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay