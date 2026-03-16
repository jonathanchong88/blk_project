import React, { useState, useEffect } from 'react';

function SalvationList({ token, BASE_URL }) {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/salvation/commitments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            setCommitments(await response.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-list-container">
      <h2>Salvation Commitments</h2>
      <div className="table-responsive">
        <table className="user-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Decision</th>
                </tr>
            </thead>
            <tbody>
                {commitments.length === 0 ? <tr><td colSpan="5" style={{textAlign: 'center'}}>No commitments yet.</td></tr> : commitments.map(c => (
                    <tr key={c.id}>
                        <td>{new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString()}</td>
                        <td>{c.first_name} {c.last_name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone || '-'}</td>
                        <td>{c.decision_type}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalvationList;