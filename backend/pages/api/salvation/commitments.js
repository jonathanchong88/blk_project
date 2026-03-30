const db = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  // Bypass auth for testing
  // const user = await authenticateToken(req);
  // if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
      try {
          const { data, error } = await db
            .from('salvation_commitments')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
              console.error('Database error in salvation_commitments:', error);
              throw error;
          }
          res.json(data);
      } catch (err) {
          console.error('Catch error in salvation_commitments:', err);
          res.status(500).json({ error: err.message });
      }
  } else {
      res.status(405).end();
  }
}