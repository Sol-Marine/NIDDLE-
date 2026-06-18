export const lagosLocations: Record<string, [number, number]> = {
  "Lekki": [6.4551, 3.4466],
  "VI": [6.4281, 3.4219],
  "Victoria Island": [6.4281, 3.4219],
  "Ikoyi": [6.4499, 3.4378],
  "Surulere": [6.5016, 3.3583],
  "Yaba": [6.5064, 3.3745],
  "Ikeja": [6.6018, 3.3515],
  "Ikeja GRA": [6.6018, 3.3515],
  "Maryland": [6.5638, 3.3635],
  "Anthony": [6.5536, 3.3845],
  "Gbagada": [6.5456, 3.3804],
  "Oshodi": [6.5581, 3.3470],
  "Island": [6.4476, 3.4011],
  "Mainland": [6.5217, 3.3707],
  "Ajah": [6.4761, 3.7432],
  "Ibeju-Lekki": [6.4233, 3.8896],
  "Badagry": [6.4153, 2.8883],
  "Epe": [6.5844, 3.9797],
  "Apapa": [6.4489, 3.3654],
  "Lagos Island": [6.4582, 3.3932],
  "Marina": [6.4531, 3.3958],
  "CMS": [6.4524, 3.3907],
};

export function findCoords(address: string): [number, number] {
  for (const [key, coords] of Object.entries(lagosLocations)) {
    if (address.toLowerCase().includes(key.toLowerCase())) return coords;
  }
  return [6.4476, 3.4011];
}
