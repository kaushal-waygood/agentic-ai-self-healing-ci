// utils/retryOperation.js
export async function retryOperation(fn, opts = {}) {
  const {
    retries = 5, // total attempts
    minDelay = 500, // ms
    maxDelay = 10_000, // ms
    factor = 2, // exponential factor
    jitter = true, // randomize delay a bit
    retryOn = (err) => true, // function(err) => boolean - whether to retry
  } = opts;

  let attempt = 0;
  let delay = minDelay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const shouldRetry = attempt < retries && retryOn(err);

      if (!shouldRetry) throw err;

      // compute delay with exponential backoff + optional jitter
      let sleep = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
      if (jitter) {
        const jitterAmount = Math.floor(Math.random() * (sleep * 0.3)); // up to 30% jitter
        sleep = Math.max(100, sleep - jitterAmount);
      }

      // give some visibility in logs
      console.warn(
        `retryOperation: attempt ${attempt} failed. Retrying in ${sleep}ms. error: ${
          err?.message || err
        }`,
      );

      // wait
      await new Promise((r) => setTimeout(r, sleep));
    }
  }

  // if we fall out, make a clear error
  throw new Error('retryOperation: exhausted all retries');
}
