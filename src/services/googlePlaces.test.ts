import { describe, it, expect, vi, beforeEach } from 'vitest'
import { googlePlacesService } from './googlePlaces'

vi.mock('@/services/map', () => {
  return {
    mapService: {
      getMap: () => ({}),
      getCenter: () => ({ latitude: 37.7749, longitude: -122.4194 }),
      getApproxRadiusMeters: () => 1000,
    },
    loadGoogleMapsScript: vi.fn(() => Promise.resolve()),
  }
})

function makePlace(overrides: any = {}) {
  return {
    place_id: 'pid-1',
    name: 'Place',
    geometry: { location: { lat: () => 1, lng: () => 2 } },
    photos: [{ getUrl: () => 'http://img' }],
    rating: 4.5,
    user_ratings_total: 10,
    types: ['restaurant'],
    vicinity: 'addr',
    formatted_phone_number: '123',
    price_level: 2,
    opening_hours: { weekday_text: ['Mon: 9-5'] },
    website: 'http://site',
    reviews: [
      { rating: 5, text: 'good', relative_time_description: 'today', author_name: 'A', profile_photo_url: '' },
    ],
    ...overrides,
  }
}

beforeEach(() => {
  ;(globalThis as any).window = (globalThis as any).window || {}
  ;(window as any).google = {
    maps: {
      places: {
        PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
        RankBy: { PROMINENCE: 'PROMINENCE' },
        PlacesService: class {
          cb: any
          constructor(_container: any) {}
          nearbySearch(req: any, cb: any) { cb([makePlace()], 'OK') }
          getDetails(req: any, cb: any) {
            if (req.fields?.includes('reviews')) {
              cb(makePlace(), 'OK')
            } else {
              cb(makePlace(), 'OK')
            }
          }
          textSearch(req: any, cb: any) { cb([makePlace()], 'OK') }
        },
      },
      LatLng: class {
        constructor(public latv: number, public lngv: number) {}
      },
    },
  }
})

describe('googlePlacesService mapping', () => {
  it('searchNearbyRestaurantsAndHotels returns mapped businesses', async () => {
    const res = await googlePlacesService.searchNearbyRestaurantsAndHotels()
    expect(res[0].id).toBe('pid-1')
    expect(res[0].coordinates).toEqual({ latitude: 1, longitude: 2 })
    expect(res[0].photos?.[0]).toBe('http://img')
  })

  it('textSearch returns mapped businesses with type filter', async () => {
    const res = await googlePlacesService.textSearch('k', 1, 2, 1000, 'restaurant')
    expect(res.length).toBeGreaterThan(0)
  })

  it('getBusinessDetails returns mapped business', async () => {
    const b = await googlePlacesService.getBusinessDetails('pid-1')
    expect(b.name).toBe('Place')
    expect(b.price).toBe('$$')
  })

  it('getBusinessReviews maps reviews and handles zero results', async () => {
    // first OK
    let rv = await googlePlacesService.getBusinessReviews('pid-1')
    expect(rv[0].rating).toBe(5)
    // mock ZERO_RESULTS
    ;(window as any).google.maps.places.PlacesService = class {
      constructor(_container: any) {}
      getDetails(_req: any, cb: any) { cb({}, 'ZERO_RESULTS') }
    }
    rv = await googlePlacesService.getBusinessReviews('pid-1')
    expect(rv.length).toBe(0)
  })
})
