import { monitorEventLoopDelay, performance } from 'node:perf_hooks';

function formatMs(value) {
  if (!Number.isFinite(value)) return '0.0ms';
  return `${value.toFixed(1)}ms`;
}

function formatLag(histogram) {
  const mean = Number.isFinite(histogram?.mean)
    ? histogram.mean / 1e6
    : 0;
  const max = Number.isFinite(histogram?.max) ? histogram.max / 1e6 : 0;
  const p95 = Number.isFinite(histogram?.percentile)
    ? histogram.percentile(95) / 1e6
    : 0;

  return `lag avg ${formatMs(mean)} | p95 ${formatMs(p95)} | max ${formatMs(max)}`;
}

export async function runWithCronTelemetry(label, handler, meta = {}) {
  const histogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();
  const startedAt = performance.now();

  const metaSuffix =
    meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  console.log(`🕒 [Cron][${label}] start${metaSuffix}`);

  try {
    const result = await handler();
    const elapsed = performance.now() - startedAt;
    console.log(
      `✅ [Cron][${label}] complete in ${formatMs(elapsed)} | ${formatLag(histogram)}`,
    );
    return result;
  } catch (error) {
    const elapsed = performance.now() - startedAt;
    console.error(
      `❌ [Cron][${label}] failed in ${formatMs(elapsed)} | ${formatLag(histogram)}`,
      error?.stack || error,
    );
    throw error;
  } finally {
    histogram.disable();
  }
}

