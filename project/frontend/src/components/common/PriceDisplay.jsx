const PriceDisplay = ({ price, priceType = 'month', sessionPrice, size = 'default', sharingTypes, showAll = false }) => {
  if (!price && (!sharingTypes || sharingTypes.length === 0)) return null
  
  const sizeClass = size === 'small' ? 'text-lg' : 'text-2xl'
  const formatPrice = (amt) => Number(amt).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // If sharingTypes exist, show the lowest price
  if (sharingTypes && sharingTypes.length > 0) {
    const lowestPrice = Math.min(...sharingTypes.map(s => s.price))
    const lowestSharing = sharingTypes.find(s => s.price === lowestPrice)
    
    if (showAll) {
      return (
        <div className="price-display space-y-2">
          {sharingTypes.map((sharing, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">{sharing.name}</span>
              <span className="text-yellow-500 font-bold">
                Rs. {formatPrice(sharing.price)}
                <span className="text-xs font-normal ml-1">/{sharing.priceType || 'month'}</span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    
    return (
      <div className="price-display">
        <div className={`text-yellow-500 font-bold ${sizeClass} whitespace-nowrap`}>
          Rs. {formatPrice(lowestPrice)}
          <span className="text-sm font-normal text-yellow-500 ml-1">/{lowestSharing.priceType || 'month'}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="price-display">
      <div className={`text-yellow-500 font-bold ${sizeClass} whitespace-nowrap`}>
        Rs. {formatPrice(price)}
        <span className="text-sm font-normal text-yellow-500 ml-1">/{priceType}</span>
      </div>
    </div>
  )
}

export default PriceDisplay