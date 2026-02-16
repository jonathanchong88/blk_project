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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await db
        .from('worship_schedule_entries')
        .select(`
          id,
          event_id,
          role:worship_roles(id, name),
          member:worship_team_members(id, name, email, phone)
        `)
        .order('role_id');

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { event_id, role_id, member_id } = req.body;

    try {
      const { data, error } = await db
        .from('worship_schedule_entries')
        .insert({ event_id, role_id, member_id })
        .select(`
          id,
          event_id,
          role:worship_roles(id, name),
          member:worship_team_members(id, name, email, phone)
        `)
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.query;
    try {
      const { error } = await db.from('worship_schedule_entries').delete().eq('id', id);
      if (error) throw error;
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}