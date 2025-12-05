import type { Business } from '@/types'

const DEFAULT_EMOJI = '📍'

const BASE_MAP: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍺',
  lodging: '🏨',
  hotel: '🏨',
  shopping_mall: '🛍️',
  mall: '🛍️',
  store: '🛍️',
  hospital: '🏥',
  clinic: '🏥',
  school: '🏫',
  university: '🏫',
  gas_station: '⛽',
  park: '🌳',
  museum: '🏛️',
  bank: '🏦',
  pharmacy: '💊',
  gym: '🏋️',
  library: '📚',
  supermarket: '🛒',
  grocery_or_supermarket: '🛒',
  bakery: '🥐',
  bookstore: '📖',
  movie_theater: '🎬',
  stadium: '🏟️',
  zoo: '🦁',
  aquarium: '🐠',
  church: '⛪',
  mosque: '🕌',
  hindu_temple: '🛕',
  tourist_attraction: '🎡',
  travel_agency: '🧳',
  art_gallery: '🖼️',
  amusement_park: '🎢',
  night_club: '🍸',
  post_office: '📮',
  police: '👮',
  fire_station: '🚒',
  bus_station: '🚌',
  subway_station: '🚇',
  train_station: '🚆',
  airport: '✈️',
  parking: '🅿️',
  car_rental: '🚘',
  car_repair: '🔧',
  hardware_store: '🔩',
}

const YELP_MAP: Record<string, string> = {
  restaurants: '🍽️',
  bars: '🍺',
  coffee: '☕',
  hotels: '🏨',
  shopping: '🛍️',
}

export function emojiForType(type?: string, overrides?: Record<string, string>): string {
  const t = (type || '').toLowerCase()
  if (!t) return overrides?.default || DEFAULT_EMOJI
  if (overrides && overrides[t]) return overrides[t]
  if (t.includes('store') || t.includes('shop')) return overrides?.store || '🛍️'
  if (t.includes('travel')) return overrides?.travel_agency || '🧳'
  if (t.includes('attraction')) return overrides?.tourist_attraction || '🎡'
  if (t.includes('food')) return overrides?.restaurant || '🍽️'
  if (t.includes('school')) return overrides?.school || '🏫'
  if (t.includes('university')) return overrides?.university || '🏫'
  if (t.includes('church')) return overrides?.church || '⛪'
  if (t.includes('mosque')) return overrides?.mosque || '🕌'
  if (t.includes('temple')) return overrides?.hindu_temple || '🛕'
  if (t.includes('clinic')) return overrides?.clinic || '🏥'
  if (t.includes('hospital')) return overrides?.hospital || '🏥'
  if (t.includes('bank')) return overrides?.bank || '🏦'
  if (t.includes('pharmacy')) return overrides?.pharmacy || '💊'
  if (t.includes('supermarket') || t.includes('grocery')) return overrides?.supermarket || '🛒'
  if (t.includes('bakery')) return overrides?.bakery || '🥐'
  if (t.includes('book')) return overrides?.bookstore || '📖'
  if (t.includes('movie') || t.includes('cinema')) return overrides?.movie_theater || '🎬'
  if (t.includes('stadium')) return overrides?.stadium || '🏟️'
  if (t.includes('zoo')) return overrides?.zoo || '🦁'
  if (t.includes('aquarium')) return overrides?.aquarium || '🐠'
  if (t.includes('night')) return overrides?.night_club || '🍸'
  if (t.includes('park')) return overrides?.park || '🌳'
  if (t.includes('museum')) return overrides?.museum || '🏛️'
  if (t.includes('gas')) return overrides?.gas_station || '⛽'
  return BASE_MAP[t] || YELP_MAP[t] || overrides?.default || DEFAULT_EMOJI
}

export function emojiForBusiness(b: Business | undefined, overrides?: Record<string, string>): string {
  if (!b) return overrides?.default || DEFAULT_EMOJI
  const cats = b.categories || []
  for (const c of cats) {
    const a = c.alias?.toLowerCase()
    const t = c.title?.toLowerCase()
    const e = emojiForType(a, overrides)
    if (e !== DEFAULT_EMOJI) return e
    const e2 = emojiForType(t, overrides)
    if (e2 !== DEFAULT_EMOJI) return e2
  }
  return overrides?.default || DEFAULT_EMOJI
}

export function mergeEmojiMapping(base: Record<string, string>, overrides?: Record<string, string>): Record<string, string> {
  return { ...base, ...(overrides || {}) }
}

export const defaultEmojiMap = BASE_MAP
export const defaultEmoji = DEFAULT_EMOJI
