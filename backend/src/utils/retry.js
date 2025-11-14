// lightweight retry with exponential backoff + jitter
export const retryOperation = async (
  operation,
  { retries = 4, baseDelay = 500, maxDelay = 10000 } = {},
) => {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err;
      // exponential backoff with full jitter
      const exp = Math.min(maxDelay, baseDelay * 2 ** attempt);
      const jitter = Math.floor(Math.random() * exp);
      await new Promise((r) => setTimeout(r, jitter));
    }
  }
};
