import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, BookOpen, Activity, MoreVertical, Trash2, Pencil, X } from 'lucide-react';
import styles from './Admin.module.css';

export default function Admin() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_admin_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { name: 'Khaled M.', date: 'Today, 10:42 AM', status: 'Active' },
      { name: 'Sarah A.', date: 'Today, 09:15 AM', status: 'Active' },
      { name: 'Omar F.', date: 'Yesterday', status: 'Pending Review' },
    ];
  });

  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [challengeTarget, setChallengeTarget] = useState(() => {
    const saved = localStorage.getItem('mizan_challenge_target');
    return saved ? saved : '5';
  });
  const [openMenu, setOpenMenu] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('mizan_admin_users', JSON.stringify(users));
  }, [users]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const approveUser = (index) => {
    const updated = [...users];
    updated[index].status = 'Active';
    setUsers(updated);
  };

  const deleteUser = (index) => {
    if (window.confirm(`Are you sure you want to delete "${users[index].name}"?`)) {
      setUsers(users.filter((_, i) => i !== index));
    }
    setOpenMenu(null);
  };

  const startEdit = (index) => {
    setEditingUser({ index, name: users[index].name, status: users[index].status });
    setOpenMenu(null);
  };

  const saveEdit = () => {
    if (!editingUser || !editingUser.name.trim()) return;
    const updated = [...users];
    updated[editingUser.index] = {
      ...updated[editingUser.index],
      name: editingUser.name,
      status: editingUser.status,
    };
    setUsers(updated);
    setEditingUser(null);
  };

  const addUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return;
    setUsers([...users, { name: newUser.name, date: 'Just now', status: 'Pending Review' }]);
    setNewUser({ name: '', email: '' });
  };

  const handleChallengeChange = (e) => {
    setChallengeTarget(e.target.value);
    localStorage.setItem('mizan_challenge_target', e.target.value);
  };

  const generateReport = () => {
    const stats = localStorage.getItem('mizan_user_stats') || '{}';
    const report = `Mizan App Report\n===================\nChallenge Target: ${challengeTarget}\nUsers:\n${users.map(u => `${u.name} - ${u.status}`).join('\n')}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mizan_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem('mizan_auth_user');
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="heading-lg">Platform Overview</h2>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={generateReport}>Generate Report</Button>
          <button className={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Challenge Configurator */}
      <div className={styles.challengeConfig}>
        <label htmlFor="challengeTarget" className={styles.label}>Daily Challenge Target (ayahs)</label>
        <input
          id="challengeTarget"
          type="number"
          min="1"
          value={challengeTarget}
          onChange={handleChallengeChange}
          className={styles.input}
        />
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><Users /></div>
          <div>
            <p className="text-small">Total Users</p>
            <h3 className="heading-lg">{users.length}</h3>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><BookOpen /></div>
          <div>
            <p className="text-small">Active Readers Today</p>
            <h3 className="heading-lg">{users.filter(u => u.status === 'Active').length}</h3>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><Activity /></div>
          <div>
            <p className="text-small">Avg. Session Time</p>
            <h3 className="heading-lg">24m</h3>
          </div>
        </Card>
      </div>

      <div className={styles.recentActivity}>
        <h3 className="heading-md">Recent Signups</h3>
        <Card className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td className={styles.userNameCell}>
                    <div className={styles.avatarMini}>{user.name[0]}</div>
                    {user.name}
                  </td>
                  <td className="text-small">{user.date}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[user.status.replace(' ', '')]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      {user.status !== 'Active' && (
                        <button className={styles.approveBtn} onClick={() => approveUser(i)}>
                          Approve
                        </button>
                      )}
                      <div className={styles.menuWrapper} ref={openMenu === i ? menuRef : null}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setOpenMenu(openMenu === i ? null : i)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenu === i && (
                          <div className={styles.dropdown}>
                            <button className={styles.dropdownItem} onClick={() => startEdit(i)}>
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={() => deleteUser(i)}>
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Add New User Form */}
        <form className={styles.addUserForm} onSubmit={addUser}>
          <h4 className="heading-sm">Add New User</h4>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            className={styles.input}
          />
          <Button type="submit" variant="primary">Add User</Button>
        </form>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className="heading-md">Edit User</h3>
              <button className={styles.modalClose} onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                className={styles.input}
                value={editingUser.name}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <label className={styles.label} style={{ marginTop: 12 }}>Status</label>
              <select
                className={styles.input}
                value={editingUser.status}
                onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditingUser(null)}>Cancel</button>
              <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
