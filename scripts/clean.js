const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', '.next');

try {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    console.log('✅ Cleaned stale .next build cache.');
  }
} catch (err) {
  // If OneDrive holds a file handle, retry or warn gracefully
  console.warn('⚠️ Notice: Could not fully remove .next:', err.message);
}
