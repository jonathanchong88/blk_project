import db from '../../../db';
import { authenticateToken } from '../../../middleware/auth';
import { cors } from '../../../middleware/cors';

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  // Check role
  try {
      const { data: userData } = await db.from('users').select('role').eq('id', user.id).single();
      if (!['admin', 'developer', 'editor'].includes(userData.role)) {
          return res.status(403).json({ message: 'Forbidden' });
      }
  } catch (e) {
      return res.status(500).json({ error: e.message });
  }

  if (req.method === 'GET') {
      try {
          const { data, error } = await db
            .from('salvation_commitments')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          res.json(data);
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  } else {
      res.status(405).end();
  }
}