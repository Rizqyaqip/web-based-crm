import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, ShieldAlert, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { getStaffList, createStaff, updateStaff, deleteStaff } from '../../services/api';
import { useAuth } from '../../context/auth_context';
import { Modal, FormField, Input, Select, Button, Alert } from '../../components';

export function ManageStaff({ setPage }) {
  const { user: currentUser, isAdmin } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    password: '',
    role: 'staff'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Access Guard
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '520px', margin: '60px auto', textAlign: 'center' }}>
        <div className="zen-card" style={{ padding: '40px 32px' }}>
          <ShieldAlert size={48} color="var(--accent-vermilion)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Akses Dibatasi</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Halaman Kelola Staff hanya dapat diakses oleh pengguna dengan hak akses <strong>Administrator</strong>. Anda saat ini login sebagai <strong>{currentUser?.role || 'Staf'}</strong>.
          </p>
          <button onClick={() => setPage('admin-dashboard')} className="zen-btn-primary">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaffList();
      if (res.success && res.data) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ nama: '', password: '', role: 'staff' });
    setFormError('');
    setModalMode('add');
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({ nama: staff.nama, password: '', role: staff.role });
    setFormError('');
    setModalMode('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nama.trim()) {
      setFormError('Nama staf wajib diisi');
      return;
    }

    if (modalMode === 'add' && !formData.password) {
      setFormError('Kata sandi wajib diisi untuk staf baru');
      return;
    }

    try {
      setFormLoading(true);

      if (modalMode === 'add') {
        await createStaff(formData);
      } else if (modalMode === 'edit') {
        const payload = { nama: formData.nama, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await updateStaff(selectedStaff.id, payload);
      }

      setModalMode(null);
      fetchStaff();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data staf');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (staffId, staffName) => {
    if (staffId === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }

    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus staf "${staffName}"?`);
    if (!confirmDelete) return;

    try {
      await deleteStaff(staffId);
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    } catch (err) {
      alert('Gagal menghapus staf: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Bar with Add Button */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="hanko-stamp">ADMIN</span>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Kelola Akun Staf & Administrator</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Atur peran, nama pengguna, dan hak akses operasional Ketsai
          </p>
        </div>

        {/* Prominent Add New Staff Button at top right */}
        <button
          onClick={handleOpenAdd}
          className="zen-btn-primary"
          style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}
        >
          <UserPlus size={16} />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="zen-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px' }}>Memuat daftar staf...</p>
          </div>
        ) : staffList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Belum ada akun staf terdaftar.
          </p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, width: '70px' }}>No</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Nama Pengguna / Staf</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Peran Hak Akses</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right', width: '160px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, idx) => {
                  const isCurrent = staff.id === currentUser?.id;

                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{staff.nama}</span>
                          {isCurrent && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-vermilion)', fontWeight: 700 }}>
                              (Anda)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge-status ${staff.role === 'admin' ? 'badge-danger' : 'badge-processing'}`}>
                          <Shield size={12} />
                          <span>{staff.role === 'admin' ? 'Administrator' : 'Staf Operasional'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="zen-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                            title="Edit data staf"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(staff.id, staff.nama)}
                            disabled={isCurrent}
                            className="zen-btn-outline-danger"
                            style={{ padding: '6px 10px', fontSize: '12px', opacity: isCurrent ? 0.4 : 1 }}
                            title={isCurrent ? 'Tidak bisa menghapus akun sendiri' : 'Hapus staf'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT STAFF */}
      <Modal
        isOpen={Boolean(modalMode)}
        onClose={() => !formLoading && setModalMode(null)}
        title={modalMode === 'add' ? 'Tambah Staf Baru' : 'Perbarui Data Staf'}
        subtitle="Akses operasional portal Ketsai"
        icon={<Shield size={18} />}
        size="sm"
        isLoading={formLoading}
        footer={(
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={formLoading}
              onClick={() => setModalMode(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="staff-form"
              variant="primary"
              size="sm"
              isLoading={formLoading}
            >
              Simpan Staf
            </Button>
          </div>
        )}
      >
        {formError && (
          <Alert type="error" message={formError} style={{ marginBottom: '16px' }} />
        )}

        <form id="staff-form" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Nama Pengguna / Username" required>
            <Input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: staff_dapur"
              required
              disabled={formLoading}
            />
          </FormField>

          <FormField
            label={`Kata Sandi ${modalMode === 'edit' ? '(Kosongkan jika tidak diubah)' : ''}`}
            required={modalMode === 'add'}
          >
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={modalMode === 'edit' ? 'Masukkan kata sandi baru...' : 'Kata sandi akun'}
              required={modalMode === 'add'}
              disabled={formLoading}
            />
          </FormField>

          <FormField label="Peran Hak Akses" required>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={formLoading}
              options={[
                { value: 'staff', label: 'Staff' },
                { value: 'admin', label: 'Admin' }
              ]}
            />
          </FormField>
        </form>
      </Modal>

    </div>
  );
}
