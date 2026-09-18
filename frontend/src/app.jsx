import { AuthProvider } from './context/auth_context';
import { CartProvider } from './context/cart_context';
import { AppRoutes } from './routes';
import { usePageNavigation } from './hooks';

export default function App() {
  const { currentPage, setPage } = usePageNavigation();

  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes currentPage={currentPage} setPage={setPage} />
      </CartProvider>
    </AuthProvider>
  );
}
