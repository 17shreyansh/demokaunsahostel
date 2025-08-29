const PriceDisplay = ({ price, priceType = 'month', sessionPrice, size = 'default' }) => {
  if (!price) return null
  
  const sizeClass = size === 'small' ? 'text-lg' : 'text-2xl'
  const formatPrice = (amt) => Number(amt).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
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