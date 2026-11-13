const CATEGORY_IMAGES: Record<string, string> = {
  Electrician: 'assets/services/electrician-wiring-pro-v2.jpg',
  Plumber: 'assets/services/plumber-leak-pro.jpg',
  Mechanic: 'assets/services/mechanic-car-pro.jpg',
  'Appliance Repair': 'assets/services/appliance-repair-pro-v2.jpg',
  'Car Wash': 'assets/services/car-wash-pro.jpg',
  Carpenter: 'assets/services/carpenter-pro.jpg',
  Painter: 'assets/services/painter-pro.jpg',
  Cleaning: 'assets/services/cleaning-pro.jpg',
  'Pest Control': 'assets/services/pest-control-pro.jpg',
  'AC Repair': 'assets/services/ac-repair-pro.jpg',
  Gardening: 'assets/services/gardening-pro.jpg',
  Locksmith: 'assets/services/locksmith-pro-v2.jpg',
  'Solar Fitting': 'assets/services/solar-fitting-pro.jpg',
  'Tank Cleaning': 'assets/services/tank-cleaning-pro.jpg',
  Welding: 'assets/services/welding-pro-v2.jpg',
  Tiling: 'assets/services/tiling-pro.jpg',
  'CCTV Installation': 'assets/services/cctv-installation-pro.jpg',
  'Water Purifier': 'assets/services/water-purifier-pro.jpg',
  'House Shifting': 'assets/services/house-shifting-pro.jpg',
  'False Ceiling': 'assets/services/false-ceiling-pro.jpg',
  'Mobile Repair': 'assets/services/mobile-repair-pro.jpg',
  'Laptop Repair': 'assets/services/laptop-repair-pro.jpg',
  'Pet Grooming': 'assets/services/pet-grooming-pro.jpg',
  'Salon at Home': 'assets/services/salon-at-home-pro.jpg',
  'Inverter Service': 'assets/services/inverter-service-pro.jpg',
  Photography: 'assets/services/photography-pro.jpg',
  'Home Nursing': 'assets/services/home-nursing-pro.jpg'
};

export const DEFAULT_SERVICE_IMAGE = 'assets/services/electrician-wiring-pro-v2.jpg';

export function serviceImageUrl(
  imageUrl: string | null | undefined,
  categoryName: string | null | undefined
): string {
  if (imageUrl && imageUrl.trim()) return imageUrl.trim();
  if (categoryName && CATEGORY_IMAGES[categoryName]) return CATEGORY_IMAGES[categoryName];
  return DEFAULT_SERVICE_IMAGE;
}
