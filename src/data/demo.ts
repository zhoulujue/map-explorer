import type { Business, Review } from '@/types';

export const demoBusinesses: Business[] = [
  {
    id: 'demo-1',
    name: '美味中餐厅',
    image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
    rating: 4.5,
    review_count: 128,
    categories: [
      { alias: 'chinese', title: '中餐厅' },
      { alias: 'restaurants', title: '餐厅' }
    ],
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    location: {
      address1: '123 Grant Ave',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94108'
    },
    phone: '+1-415-123-4567',
    price: '$$',
    hours: [{
      open: [
        { day: 0, start: '1100', end: '2200' },
        { day: 1, start: '1100', end: '2200' },
        { day: 2, start: '1100', end: '2200' },
        { day: 3, start: '1100', end: '2200' },
        { day: 4, start: '1100', end: '2200' },
        { day: 5, start: '1100', end: '2300' },
        { day: 6, start: '1100', end: '2300' }
      ]
    }],
    photos: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'
    ],
    website: 'https://example-restaurant.com'
  },
  {
    id: 'demo-2',
    name: '舒适酒店',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    rating: 4.2,
    review_count: 89,
    categories: [
      { alias: 'hotels', title: '酒店' }
    ],
    coordinates: {
      latitude: 37.7849,
      longitude: -122.4094
    },
    location: {
      address1: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102'
    },
    phone: '+1-415-987-6543',
    price: '$$$',
    hours: [{
      open: [
        { day: 0, start: '0000', end: '2359' },
        { day: 1, start: '0000', end: '2359' },
        { day: 2, start: '0000', end: '2359' },
        { day: 3, start: '0000', end: '2359' },
        { day: 4, start: '0000', end: '2359' },
        { day: 5, start: '0000', end: '2359' },
        { day: 6, start: '0000', end: '2359' }
      ]
    }],
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
    ],
    website: 'https://example-hotel.com'
  },
  {
    id: 'demo-3',
    name: '咖啡时光',
    image_url: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=300&fit=crop',
    rating: 4.7,
    review_count: 203,
    categories: [
      { alias: 'coffee', title: '咖啡厅' },
      { alias: 'cafes', title: '咖啡馆' }
    ],
    coordinates: {
      latitude: 37.7649,
      longitude: -122.4294
    },
    location: {
      address1: '789 Valencia St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94110'
    },
    phone: '+1-415-555-1234',
    price: '$',
    hours: [{
      open: [
        { day: 0, start: '0700', end: '1800' },
        { day: 1, start: '0600', end: '1900' },
        { day: 2, start: '0600', end: '1900' },
        { day: 3, start: '0600', end: '1900' },
        { day: 4, start: '0600', end: '1900' },
        { day: 5, start: '0700', end: '2000' },
        { day: 6, start: '0700', end: '2000' }
      ]
    }],
    photos: [
      'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop'
    ],
    website: 'https://example-cafe.com'
  }
];

export const demoReviews: Review[] = [
  {
    id: 'review-1',
    rating: 5,
    text: '非常棒的餐厅！食物很美味，服务也很好。环境很舒适，价格合理。强烈推荐！',
    time_created: '2024-01-15T10:30:00Z',
    user: {
      name: '张三',
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
    }
  },
  {
    id: 'review-2',
    rating: 4,
    text: '整体体验不错，菜品口味很好，分量也足。就是上菜速度有点慢，不过服务员态度很好。会再来的。',
    time_created: '2024-01-10T14:20:00Z',
    user: {
      name: '李四',
      image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=60&h=60&fit=crop&crop=face'
    }
  },
  {
    id: 'review-3',
    rating: 5,
    text: '绝对是我在这座城市最喜欢的餐厅之一！每次来都不会失望。特别推荐他们的招牌菜。',
    time_created: '2024-01-08T19:45:00Z',
    user: {
      name: '王五',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
    }
  }
];