// backend/pages/api/worship/team.js
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
      // Fetch members and join with roles
      const { data, error } = await db
        .from('worship_team_members')
        .select(`
          *,
          roles:worship_team_member_roles (
            role:worship_roles ( id, name )
          )
        `)
        .order('name');

      if (error) throw error;

      // Transform data to a flatter structure for frontend
      const formattedData = data.map(member => ({
        ...member,
        roles: member.roles.map(r => r.role.name)
      }));

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { name, email, phone, sex, age, avatar_url, roles } = req.body; // roles is array of role_ids

    try {
      // 1. Create Member
      const { data: memberData, error: memberError } = await db
        .from('worship_team_members')
        .insert({ name, email, phone, sex, age, avatar_url })
        .select()
        .single();

      if (memberError) throw memberError;

      // 2. Assign Roles
      if (roles && roles.length > 0) {
        const roleInserts = roles.map(roleId => ({
          member_id: memberData.id,
          role_id: roleId
        }));

        const { error: roleError } = await db
          .from('worship_team_member_roles')
          .insert(roleInserts);

        if (roleError) throw roleError;
      }

      res.status(201).json(memberData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT') {
    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id, name, email, phone, sex, age, avatar_url, roles } = req.body;

    try {
      // 1. Update Member details
      const { error: updateError } = await db
        .from('worship_team_members')
        .update({ name, email, phone, sex, age, avatar_url })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. Update Roles (Delete all and re-insert)
      if (roles) {
        const { error: deleteError } = await db
          .from('worship_team_member_roles')
          .delete()
          .eq('member_id', id);
        
        if (deleteError) throw deleteError;

        if (roles.length > 0) {
          const roleInserts = roles.map(roleId => ({ member_id: id, role_id: roleId }));
          const { error: insertError } = await db
            .from('worship_team_member_roles')
            .insert(roleInserts);
          if (insertError) throw insertError;
        }
      }
      res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
