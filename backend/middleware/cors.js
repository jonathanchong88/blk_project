const Cors = require('cors');

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://blk-project-frontend-dev.onrender.com',
  process.env.VITE_FRONTEND_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

// Initializing the cors middleware
const cors = Cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // In development, you might want to be more lenient
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      
      // Automatically handle preflight OPTIONS requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return resolve();
      }
      
      return resolve(result);
    });
  });
}

module.exports = { cors, runMiddleware };