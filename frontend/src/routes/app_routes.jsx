import { useEffect, lazy, Suspense } from 'react';
import { ROUTE_PATHS } from './route_paths';
import { useAuth } from '../context/auth_context';
import { UserLayout, CustomerLayout } from '../layouts';
import { ErrorBoundary } from '../components';

// Route-Level Code Splitting (Lazy Loading) untuk menghemat bundle dan memori browser
const LandingPage = lazy(() => import('../features/customer/landing_page').then(m => ({ default: m.LandingPage })));
const CatalogPage = lazy(() => import('../features/customer/catalog_page').then(m => ({ default: m.CatalogPage })));
const InvoiceView = lazy(() => import('../features/customer/invoice_view').then(m => ({ default: m.InvoiceView })));
const LoginPage = lazy(() => import('../features/auth/login_page').then(m => ({ default: m.LoginPage })));

// Fitur bersama staf & admin (digeneralisir ke user)
const DashboardOverview = lazy(() => import('../features/user/dashboard_overview').then(m => ({ default: m.DashboardOverview })));
const StockEntry = lazy(() => import('../features/user/stock_entry').then(m => ({ default: m.StockEntry })));
const StockLogHistory = lazy(() => import('../features/user/stock_log_history').then(m => ({ default: m.StockLogHistory })));
const OrderHistory = lazy(() => import('../features/user/order_history').then(m => ({ default: m.OrderHistory })));

// Fitur khusus administrator (mempertahankan penamaan admin)
const ManageStaff = lazy(() => import('../features/admin/manage_staff').then(m => ({ default: m.ManageStaff })));

function RouteLoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '12px',
      color: 'var(--text-muted)'
    }}>
      <div className="animate-spin" style={{
        width: '28px',
        height: '28px',
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--accent-vermilion)',
        borderRadius: '50%'
      }} />
      <span style={{ fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Memuat Halaman...
      </span>
    </div>
  );
}

export function AppRoutes({ currentPage, setPage }) {
  const { isAuthenticated } = useAuth();
  const isPortalView = currentPage.startsWith('user-') || currentPage.startsWith('admin-');

  // Proteksi rute portal staf/admin jika belum login
  useEffect(() => {
    if (isPortalView && !isAuthenticated) {
      setPage(ROUTE_PATHS.LOGIN);
    }
  }, [isPortalView, isAuthenticated, setPage]);

  // User Portal (Admin / Staff) View Flow
  if (isPortalView && isAuthenticated) {
    let title = 'Portal Pengguna';
    let subtitle = 'Sistem manajemen operasional Ketsai';
    let content = null;

    switch (currentPage) {
      case ROUTE_PATHS.USER_DASHBOARD:
      case 'admin-dashboard':
        title = 'Dashboard';
        subtitle = 'Ringkasan data penjualan, pesanan, dan peringatan stok';
        content = <DashboardOverview setPage={setPage} />;
        break;
      case ROUTE_PATHS.USER_STOCK_ENTRY:
      case 'admin-stock-entry':
        title = 'Input Stok';
        subtitle = 'Manajemen stok';
        content = <StockEntry setPage={setPage} />;
        break;
      case ROUTE_PATHS.USER_STOCK_LOGS:
      case 'admin-stock-logs':
        title = 'Riwayat Input Stok';
        subtitle = 'Riwayat mutasi stok masuk dan keluar';
        content = <StockLogHistory />;
        break;
      case ROUTE_PATHS.USER_ORDERS:
      case 'admin-orders':
        title = 'Riwayat Pesanan';
        subtitle = 'Data riwayat checkout customer';
        content = <OrderHistory />;
        break;
      case ROUTE_PATHS.ADMIN_STAFF:
        title = 'Kelola Staf';
        subtitle = 'Manajemen akun staf';
        content = <ManageStaff setPage={setPage} />;
        break;
      default:
        content = <DashboardOverview setPage={setPage} />;
    }

    return (
      <UserLayout
        currentPage={currentPage}
        setPage={setPage}
        title={title}
        subtitle={subtitle}
      >
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            {content}
          </Suspense>
        </ErrorBoundary>
      </UserLayout>
    );
  }

  // Customer & Login Flow
  return (
    <CustomerLayout currentPage={currentPage} setPage={setPage}>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoadingFallback />}>
          {currentPage === ROUTE_PATHS.LANDING && <LandingPage setPage={setPage} />}
          {currentPage === ROUTE_PATHS.CATALOG && <CatalogPage setPage={setPage} />}
          {currentPage === ROUTE_PATHS.CHECKOUT_SUCCESS && <InvoiceView setPage={setPage} />}
          {currentPage === ROUTE_PATHS.LOGIN && <LoginPage setPage={setPage} />}
        </Suspense>
      </ErrorBoundary>
    </CustomerLayout>
  );
}
