import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from '../features/customer/cart_drawer';
import { CheckoutModal } from '../features/customer/checkout_modal';

export function CustomerLayout({ currentPage, setPage, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPage={currentPage} setPage={setPage} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer setPage={setPage} />
      <CartDrawer />
      <CheckoutModal setPage={setPage} />
    </div>
  );
}
