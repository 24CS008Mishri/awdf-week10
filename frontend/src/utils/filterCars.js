// Filter state and sort labels only. Filtering, sorting and pagination run on the server (GET /api/cars).
export const DEFAULT = { companies: [], model: '', min: 0, max: 30, yMin: 2020, yMax: 2026, fuels: [], trans: '', bodies: [], colours: [], mileage: 0, seats: 0, safety: 0, features: [], sort: 'rec', period: 'month', city: '' }
export const SORTS = { rec: 'Recommended', lo: 'Price: low to high', hi: 'Price: high to low', new: 'Newest launch', mil: 'Highest mileage', safe: 'Best safety rating', trend: 'Trending — Most Sold' }
