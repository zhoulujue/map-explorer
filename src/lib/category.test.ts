import { describe, it, expect } from 'vitest'
import { mapCategoryToPlacesType } from './category'

describe('mapCategoryToPlacesType', () => {
  it('maps All to undefined', () => {
    expect(mapCategoryToPlacesType('all')).toBeUndefined()
    expect(mapCategoryToPlacesType('All')).toBeUndefined()
  })
  it('maps Food & drink to restaurant', () => {
    expect(mapCategoryToPlacesType('Food & drink')).toBe('restaurant')
  })
  it('maps Hotels to lodging', () => {
    expect(mapCategoryToPlacesType('Hotels')).toBe('lodging')
  })
  it('maps Leisure to tourist_attraction', () => {
    expect(mapCategoryToPlacesType('Leisure')).toBe('tourist_attraction')
  })
  it('maps Travel to travel_agency', () => {
    expect(mapCategoryToPlacesType('Travel')).toBe('travel_agency')
  })
  it('returns undefined for unknown', () => {
    expect(mapCategoryToPlacesType('Other')).toBeUndefined()
  })
})
