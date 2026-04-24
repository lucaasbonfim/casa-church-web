export function buildChurchHouseAddress(churchHouse) {
  return [
    churchHouse.street,
    churchHouse.number,
    churchHouse.complement,
    churchHouse.neighborhood,
    churchHouse.city,
    churchHouse.state,
    churchHouse.uf,
    churchHouse.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatDistance(distanceInKm) {
  if (distanceInKm === null || distanceInKm === undefined) return "Sem calculo";
  if (distanceInKm < 1) return `${Math.round(distanceInKm * 1000)} m`;
  return `${distanceInKm.toFixed(1)} km`;
}

export function calculateDistanceInKm(origin, destination) {
  if (!origin || !destination) return null;

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2) *
      Math.cos(originLat) *
      Math.cos(destinationLat);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
