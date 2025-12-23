export function generateReferralCode(email) {
  const emailPart = email.split('@')[0].substring(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6);
  return `${emailPart}${randomPart}`.toUpperCase();
}
