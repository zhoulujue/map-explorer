import type { Business, Review } from '@/types'
import { mapService, loadGoogleMapsScript } from '@/services/map'

function mapPlaceToBusiness(place: any): Business {
  const lat = place.geometry?.location?.lat() ?? 0
  const lng = place.geometry?.location?.lng() ?? 0
  const photoUrl = place.photos && place.photos.length > 0
    ? place.photos[0].getUrl({ maxWidth: 320, maxHeight: 240 })
    : ''
  return {
    id: place.place_id || `${lat},${lng}`,
    name: place.name || '未知地点',
    image_url: photoUrl,
    rating: place.rating || 0,
    review_count: place.user_ratings_total || 0,
    categories: (place.types || []).map((t: string) => ({ alias: t, title: t })),
    coordinates: { latitude: lat, longitude: lng },
    location: {
      address1: place.vicinity || '',
      city: '',
      state: '',
      zip_code: '',
    },
    phone: place.formatted_phone_number || '',
    price: (place.price_level != null) ? '$'.repeat(place.price_level) : '',
    hours: place.opening_hours?.weekday_text
      ? [{ open: [] }]
      : undefined,
    photos: photoUrl ? [photoUrl] : [],
    website: (place.website as string) || '',
  }
}

class GooglePlacesService {
  private async ensureLoaded() {
    if (!window.google?.maps?.places) {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!key) throw new Error('Google Maps API key missing')
      await loadGoogleMapsScript(key)
    }
  }

  async searchNearbyRestaurantsAndHotels(): Promise<Business[]> {
    await this.ensureLoaded()
    const map = mapService.getMap()
    if (!map || !window.google?.maps?.places) throw new Error('Google Places not available')

    const center = mapService.getCenter()
    const radius = Math.min(Math.max(mapService.getApproxRadiusMeters(), 500), 50000)
    const service = new window.google.maps.places.PlacesService(map)

    const doSearch = (type: any): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        service.nearbySearch(
          {
            location: new window.google.maps.LatLng(center.latitude, center.longitude),
            radius,
            type,
            openNow: false,
            rankBy: window.google.maps.places.RankBy.PROMINENCE,
          },
          (results: any[], status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results)
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([])
            } else {
              reject(new Error(`Places search failed: ${status}`))
            }
          }
        )
      })
    }

    const [restaurants, hotels] = await Promise.all([
      doSearch('restaurant'),
      doSearch('lodging'),
    ])

    const merged = [...restaurants, ...hotels]
    // Deduplicate by place_id
    const uniqueMap = new Map<string, any>()
    for (const p of merged) {
      if (p.place_id) uniqueMap.set(p.place_id, p)
    }
    const unique = Array.from(uniqueMap.values())
    return unique.map(mapPlaceToBusiness)
  }

  async searchNearbyByType(type?: string): Promise<Business[]> {
    await this.ensureLoaded()
    const map = mapService.getMap()
    if (!map || !window.google?.maps?.places) throw new Error('Google Places not available')
    const center = mapService.getCenter()
    const radius = Math.min(Math.max(mapService.getApproxRadiusMeters(), 500), 50000)
    const service = new window.google.maps.places.PlacesService(map)

    const request: any = {
      location: new window.google.maps.LatLng(center.latitude, center.longitude),
      radius,
      rankBy: window.google.maps.places.RankBy.PROMINENCE,
    }
    if (type && type !== 'all') request.type = type

    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results.map(mapPlaceToBusiness))
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([])
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  async getBusinessDetails(placeId: string): Promise<Business> {
    await this.ensureLoaded()
    const container = document.createElement('div')
    const service = new window.google.maps.places.PlacesService(container)
    const fields = [
      'place_id',
      'name',
      'geometry',
      'photos',
      'rating',
      'user_ratings_total',
      'types',
      'vicinity',
      'formatted_phone_number',
      'price_level',
      'opening_hours',
      'website',
    ]
    return new Promise((resolve, reject) => {
      service.getDetails({ placeId, fields }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(mapPlaceToBusiness(place))
        } else {
          reject(new Error(`Places details failed: ${status}`))
        }
      })
    })
  }

  async getBusinessReviews(placeId: string): Promise<Review[]> {
    await this.ensureLoaded()
    const container = document.createElement('div')
    const service = new window.google.maps.places.PlacesService(container)
    return new Promise((resolve, reject) => {
      service.getDetails({ placeId, fields: ['reviews'] }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const reviews: Review[] = (place.reviews || []).map((r: any, idx: number) => ({
            id: `${placeId}-${r.time ?? 't'}-${idx}`,
            rating: r.rating || 0,
            text: r.text || '',
            time_created: r.relative_time_description || '',
            user: {
              name: r.author_name || '用户',
              image_url: r.profile_photo_url || '',
            },
          }))
          resolve(reviews)
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([])
        } else {
          reject(new Error(`Places reviews failed: ${status}`))
        }
      })
    })
  }

  async textSearch(
    keyword: string,
    latitude: number,
    longitude: number,
    radiusMeters: number,
    type?: string
  ): Promise<Business[]> {
    await this.ensureLoaded()
    const container = document.createElement('div')
    const service = new window.google.maps.places.PlacesService(container)
    const request: any = {
      location: new window.google.maps.LatLng(latitude, longitude),
      radius: radiusMeters,
      query: keyword,
    }
    if (type && type !== 'all') request.type = type
    return new Promise((resolve, reject) => {
      service.textSearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results.map(mapPlaceToBusiness))
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([])
        } else {
          reject(new Error(`Places text search failed: ${status}`))
        }
      })
    })
  }
}

export const googlePlacesService = new GooglePlacesService()
