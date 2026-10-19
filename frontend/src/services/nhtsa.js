// Public REST API (no key): NHTSA vPIC
export const modelsUrl = (make) => `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`
