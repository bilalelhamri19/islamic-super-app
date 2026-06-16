import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, BookOpen, Activity, MoreVertical, Trash2, Pencil, X, Target, TrendingUp, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './Admin.module.css';

export default function Admin() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Admin access guard
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mizan_auth_user');
      const user = saved ? JSON.parse(saved) : null;
      if (!user?.isAdmin) {
        navigate('/');
      }
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [challengeTarget, setChallengeTarget] = useState(() => {
    const saved = localStorage.getItem('mizan_challenge_target');
    return saved ? saved : '5';
  });
  const [openMenu, setOpenMenu] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get local users first
      let localUsers = [];
      try {
        const saved = localStorage.getItem('mizan_admin_users');
        if (saved) localUsers = JSON.parse(saved);
      } catch (e) {}

      // Try to get from Supabase
      if (!supabase.isMock) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            const supabaseUsers = data.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email || u.id.slice(0, 8) + '@...',
              date: new Date(u.created_at).toLocaleDateString('ar-MA'),
              status: u.is_admin ? 'Admin' : 'Active'
            }));

            // Merge local users
            localUsers.forEach(localU => {
              if (!supabaseUsers.some(su => su.email === localU.email)) {
                supabaseUsers.push(localU);
              }
            });

            setUsers(supabaseUsers);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error fetching from Supabase:', e);
        }
      }

      // Fallback to local only
      setUsers(localUsers.length > 0 ? localUsers : [
        { name: 'خالد م.', email: 'khaled@example.com', date: 'اليوم', status: 'Active' },
        { name: 'سارة أ.', email: 'sara@example.com', date: 'اليوم', status: 'Active' }
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  // Sync users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      const localOnly = users.filter(u => !u.id);
      if (localOnly.length > 0) {
        localStorage.setItem('mizan_admin_users', JSON.stringify(localOnly));
      }
    }
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

  const approveUser = async (index) => {
    const updated = [...users];
    updated[index].status = 'Active';
    setUsers(updated);
    
    if (users[index].id && !supabase.isMock) {
      await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', users[index].id);
    }
  };

  const deleteUser = async (index) => {
    if (window.confirm(`هل أنت متأكد من حذف "${users[index].name}"؟`)) {
      const userToDelete = users[index];
      const newUsers = users.filter((_, i) => i !== index);
      setUsers(newUsers);
      
      if (userToDelete.id && !supabase.isMock) {
        try {
          await supabase.auth.admin.deleteUser(userToDelete.id);
        } catch (e) { /* ignore */ }
        try {
          await supabase.from('profiles').delete().eq('id', userToDelete.id);
        } catch (e) { /* ignore */ }
      }
    }
    setOpenMenu(null);
  };

  const startEdit = (index) => {
    setEditingUser({ index, name: users[index].name, status: users[index].status });
    setOpenMenu(null);
  };

  const saveEdit = async () => {
    if (!editingUser || !editingUser.name.trim()) return;
    const updated = [...users];
    updated[editingUser.index] = {
      ...updated[editingUser.index],
      name: editingUser.name,
      status: editingUser.status,
    };
    setUsers(updated);
    setEditingUser(null);

    if (users[editingUser.index].id && !supabase.isMock) {
      await supabase
        .from('profiles')
        .update({ 
          name: editingUser.name,
          is_admin: editingUser.status === 'Admin'
        })
        .eq('id', users[editingUser.index].id);
    }
  };

  const addUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return;
    setUsers([...users, { 
      name: newUser.name, 
      email: newUser.email || newUser.name.toLowerCase().replace(/\s/g, '') + '@local.com', 
      date: 'الآن', 
      status: 'Pending Review' 
    }]);
    setNewUser({ name: '', email: '' });
  };

  const handleChallengeChange = (e) => {
    setChallengeTarget(e.target.value);
    localStorage.setItem('mizan_challenge_target', e.target.value);
  };

  const generateReport = () => {
    const report = `تقرير تطبيق إلى الجنة\n===================\nهدف التحدي اليومي: ${challengeTarget} آيات\nالمستخدمون:\n${users.map(u => `${u.name} - ${u.status}`).join('\n')}`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mizan_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const pendingUsers = users.filter(u => u.status === 'Pending Review').length;

  return (
    <div className={styles.container}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>لوحة التحكم</p>
          <h2 className={styles.pageTitle}>نظرة عامة على المنصة</h2>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.reportBtn} onClick={generateReport}>
            <Download size={16} />
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconEmerald}`}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>إجمالي المستخدمين</p>
            <h3 className={styles.statValue}>{users.length}</h3>
            <p className={styles.statSub}>مسجّل في المنصة</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGold}`}>
            <BookOpen size={22} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>القرّاء النشطون</p>
            <h3 className={styles.statValue}>{activeUsers}</h3>
            <p className={styles.statSub}>نشط اليوم</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconOrange}`}>
            <Activity size={22} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>في الانتظار</p>
            <h3 className={styles.statValue}>{pendingUsers}</h3>
            <p className={styles.statSub}>بانتظار المراجعة</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <TrendingUp size={22} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>متوسط الجلسة</p>
            <h3 className={styles.statValue}>24م</h3>
            <p className={styles.statSub}>دقيقة لكل مستخدم</p>
          </div>
        </div>
      </div>

      {/* ── Challenge Configurator ── */}
      <div className={styles.challengeConfig}>
        <div className={styles.challengeIcon}>
          <Target size={20} />
        </div>
        <div className={styles.challengeBody}>
          <p className={styles.challengeTitle}>هدف التحدي اليومي</p>
          <p className={styles.challengeSub}>عدد الآيات التي يجب على المستخدم قراءتها يومياً</p>
        </div>
        <div className={styles.challengeControl}>
          <button
            className={styles.stepBtn}
            onClick={() => handleChallengeChange({ target: { value: Math.max(1, +challengeTarget - 1).toString() } })}
          >−</button>
          <input
            id="challengeTarget"
            type="number"
            min="1"
            max="100"
            value={challengeTarget}
            onChange={handleChallengeChange}
            className={styles.challengeInput}
          />
          <button
            className={styles.stepBtn}
            onClick={() => handleChallengeChange({ target: { value: Math.min(100, +challengeTarget + 1).toString() } })}
          >+</button>
          <span className={styles.challengeUnit}>آيات</span>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>المستخدمون المسجّلون</h3>
          <span className={styles.sectionBadge}>{users.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>جار تحميل المستخدمين...</div>
        ) : (
          <Card className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>تاريخ الانضمام</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i}>
                    <td className={styles.userNameCell}>
                      <div className={styles.avatarMini}>{user.name[0]}</div>
                      <div>
                        <p className={styles.userName}>{user.name}</p>
                        {user.email && <p className={styles.userEmail}>{user.email}</p>}
                      </div>
                    </td>
                    <td className="text-small">{user.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[user.status.replace(' ', '')]}`}>
                        {user.status === 'Active' ? 'نشط' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {user.status !== 'Active' && (
                          <button className={styles.approveBtn} onClick={() => approveUser(i)}>
                            قبول
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
                            <div className={`${styles.dropdown} ${i === users.length - 1 ? styles.dropdownUp : ''}`}>
                              <button className={styles.dropdownItem} onClick={() => startEdit(i)}>
                                <Pencil size={14} />
                                تعديل
                              </button>
                              <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={() => deleteUser(i)}>
                                <Trash2 size={14} />
                                حذف
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
        )}

        {/* Add New User Form */}
        <form className={styles.addUserForm} onSubmit={addUser}>
          <div className={styles.addUserHeader}>
            <Users size={16} />
            <h4 className={styles.addUserTitle}>إضافة مستخدم جديد</h4>
          </div>
          <div className={styles.addUserFields}>
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className={styles.input}
              required
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني (اختياري)"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className={styles.input}
            />
            <Button type="submit" variant="primary">إضافة</Button>
          </div>
        </form>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تعديل المستخدم</h3>
              <button className={styles.modalClose} onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>الاسم</label>
              <input
                type="text"
                className={styles.input}
                value={editingUser.name}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <label className={styles.fieldLabel} style={{ marginTop: 14 }}>الحالة</label>
              <select
                className={styles.input}
                value={editingUser.status}
                onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
              >
                <option value="Active">نشط</option>
                <option value="Pending Review">قيد المراجعة</option>
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditingUser(null)}>إلغاء</button>
              <Button variant="primary" onClick={saveEdit}>حفظ التغييرات</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
