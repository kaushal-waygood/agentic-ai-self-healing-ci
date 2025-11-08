process.on('message', (msg) => {
  if (msg?.type === 'shutdown') {
    console.log('[worker] Graceful shutdown requested.');
    process.exit(0);
  }
});
