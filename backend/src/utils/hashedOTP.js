export const hashedGenerateReferralCode = (email) => {
  const emailHash = crypto
    .createHash('sha256')
    .update(email)
    .digest('hex')
    .substring(0, 5);
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${emailHash}${randomString}`.toUpperCase();
};
