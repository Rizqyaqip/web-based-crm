import { useState } from 'react';
import {
  LayoutDashboard,
  PackagePlus,
  History,
  ShoppingBag,
  Users,
  LogOut,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/auth_context';
import { ROUTE_PATHS } from '../routes/route_paths';
import { Logo } from '../components';

export function UserLayout({ currentPage, setPage, title, subtitle, children }) {
  const { user, logout, isAdmin } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    setIsMobileSidebarOpen(false);
    logout();
    setPage(ROUTE_PATHS.LOGIN);
  };

  const handleNavigate = (path) => {
    setPage(path);
    setIsMobileSidebarOpen(false);
  };

  const navItems = [
    {
      path: ROUTE_PATHS.USER_DASHBOARD,
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: ROUTE_PATHS.USER_STOCK_ENTRY,
      label: 'Input Stok',
      icon: PackagePlus
    },
    {
      path: ROUTE_PATHS.USER_STOCK_LOGS,
      label: 'Riwayat Stok',
      icon: History
    },
    {
      path: ROUTE_PATHS.USER_ORDERS,
      label: 'Riwayat Pesanan',
      icon: ShoppingBag
    }
  ];

  // Menu Khusus Administrator (Kelola Staf)
  if (isAdmin) {
    navItems.push({
      path: ROUTE_PATHS.ADMIN_STAFF,
      label: 'Kelola Staf',
      icon: Users
    });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-surface)' }}>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-overlay show-on-mobile"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`user-sidebar admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        {/* Brand Header with Mobile Close Button */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo height="28px" style={{ borderRadius: '3px' }} />
            <div>
              <span className="hanko-stamp">PORTAL</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="show-on-mobile"
            style={{
              display: 'none',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Identity Card */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-vermilion-light)',
            color: 'var(--accent-vermilion)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px'
          }}>
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nama || 'Pengguna'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              {isAdmin ? <ShieldAlert size={12} color="var(--accent-vermilion)" /> : <UserCheck size={12} />}
              <span style={{ textTransform: 'capitalize' }}>{user?.role || 'Staff'}</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path || (item.path === ROUTE_PATHS.USER_DASHBOARD && currentPage === 'admin-dashboard');
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-vermilion-light)' : 'transparent',
                  color: isActive ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={17} color={isActive ? 'var(--accent-vermilion)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => handleNavigate(ROUTE_PATHS.LANDING)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ExternalLink size={14} />
            <span>Kembali ke beranda</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger-text)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          className="user-header-responsive admin-header-responsive"
          style={{
            padding: '20px 32px',
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger Toggle Button on Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="show-on-mobile"
              style={{
                display: 'none',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              aria-label="Buka menu navigasi"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="user-main-responsive admin-main-responsive" style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Aliases for compatibility
export const AdminLayout = UserLayout;
export default UserLayout;
