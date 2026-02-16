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
  const { id } = req.query;

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Get role info
      const { data: role, error: roleError } = await db
        .from('worship_roles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (roleError) throw roleError;

      // Get members with this role
      const { data: members, error: membersError } = await db
        .from('worship_team_member_roles')
        .select(`
          member:worship_team_members (*)
        `)
        .eq('role_id', id);

      if (membersError) throw membersError;

      const formattedMembers = members.map(m => m.member);

      res.json({ role, members: formattedMembers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { member_id } = req.body;
    try {
      const { error } = await db
        .from('worship_team_member_roles')
        .insert({ role_id: id, member_id });
      
      if (error) {
          // Ignore duplicate key error (already has role)
          if (error.code !== '23505') throw error;
      }
      res.status(201).json({ message: 'Member added to role' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { member_id } = req.query;
    try {
      const { error } = await db
        .from('worship_team_member_roles')
        .delete()
        .eq('role_id', id)
        .eq('member_id', member_id);
      
      if (error) throw error;
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}