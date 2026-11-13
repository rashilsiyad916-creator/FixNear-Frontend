/**
 * Builds a Google Maps link for a booking or provider location.
 *
 * GPS coordinates win when present so the customer and the professional both
 * land on the exact pin, not the middle of the named area. Text addresses are
 * used for older bookings that were saved before coordinates existed.
 */
export function mapsUrl(
  address: string | null | undefined,
  latitude?: number | null,
  longitude?: number | null
): string {
  if (isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  const query = (address || '').trim() || 'Kerala, India';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function hasCoordinates(
  latitude?: number | null,
  longitude?: number | null
): boolean {
  return isValidCoord(latitude, -90, 90) && isValidCoord(longitude, -180, 180);
}

function isValidCoord(value: number | null | undefined, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
