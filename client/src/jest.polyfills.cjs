const { TextEncoder, TextDecoder } = require('util');

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

// Set process.env for Vite env vars (babel plugin transforms import.meta.env to process.env)
process.env.VITE_API_URL = 'http://localhost:3001/api';
process.env.VITE_ENV = 'test';
