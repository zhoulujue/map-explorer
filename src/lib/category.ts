export function mapCategoryToPlacesType(cat?: string): string | undefined {
  const key = (cat || 'all').toLowerCase()
  if (key === 'all') return undefined
  if (key.includes('food')) return 'restaurant'
  if (key.includes('hotel')) return 'lodging'
  if (key.includes('leisure')) return 'tourist_attraction'
  if (key.includes('travel')) return 'travel_agency'
  if (key.includes('cafe')) return 'cafe'
  if (key.includes('bar')) return 'bar'
  if (key.includes('museum')) return 'museum'
  if (key.includes('park')) return 'park'
  if (key.includes('shopping')) return 'shopping_mall'
  return undefined
}
