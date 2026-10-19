export const lakh = (n) => `₹${Number(n).toFixed(2)}L`
export const mileageLabel = (c) => (c.fuel === 'Electric' ? `${c.mileage} km range` : `${c.mileage} kmpl`)
