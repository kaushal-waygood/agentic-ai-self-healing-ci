export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isDisposableEmail = async (email) => {
  // You can implement disposable email checking here
  // Example: call an API like https://www.disify.com/
  return false;
};
