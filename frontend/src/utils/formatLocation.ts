export function formatLocation(location: {
  city: string;
  postalCode: string;
}): string {
  return `${location.city}, ${location.postalCode}`;
}
