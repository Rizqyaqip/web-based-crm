import { useState } from 'react';
import { ShoppingBag, User, ArrowRight, Menu, X } from 'lucide-react';
import { useCart } from '../context/cart_context';
import { useAuth } from '../context/auth_context';
import { Logo } from '../components';

export function Navbar({ currentPage, setPage }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    setPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo & Hanko Brand */}
        <div 
          onClick={() => handleNavigate('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <Logo height="36px" style={{ borderRadius: '6px' }} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={() => handleNavigate('landing')}
            style={{
              fontSize: '14px',
              fontWeight: currentPage === 'landing' ? 700 : 500,
              color: currentPage === 'landing' ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
              position: 'relative',
              padding: '6px 0',
              transition: 'color var(--transition-fast)'
            }}
          >
            Beranda
          </button>

          <button
            onClick={() => handleNavigate('catalog')}
            style={{
              fontSize: '14px',
              fontWeight: currentPage === 'catalog' ? 700 : 500,
              color: currentPage === 'catalog' ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
              position: 'relative',
              padding: '6px 0',
              transition: 'color var(--transition-fast)'
            }}
          >
            Katalog Menu
          </button>
        </nav>

        {/* Actions: Cart & Staff Portal & Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cart Trigger (Visible on all screens) */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <ShoppingBag size={18} color="var(--accent-vermilion)" />
            <span className="hide-on-mobile">Pesanan</span>
            {totalItems > 0 && (
              <span style={{
                backgroundColor: 'var(--accent-vermilion)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                padding: '2px 7px',
                lineHeight: 1
              }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Desktop Staff Portal Button */}
          <div className="hide-on-mobile">
            {isAuthenticated ? (
              <button
                onClick={() => handleNavigate('admin-dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--text-primary)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <User size={15} />
                <span>Portal {user?.role === 'admin' ? 'Admin' : 'Staf'}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User size={15} />
                <span>Login Staf</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="show-on-desktop"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              display: 'none'
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="show-on-mobile"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer show-on-mobile">
          <button
            onClick={() => handleNavigate('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentPage === 'landing' ? 'var(--bg-card)' : 'transparent',
              color: currentPage === 'landing' ? 'var(--accent-vermilion)' : 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: currentPage === 'landing' ? 700 : 500,
              textAlign: 'left'
            }}
          >
            <span>Beranda</span>
            {currentPage === 'landing' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-vermilion)' }} />}
          </button>

          <button
            onClick={() => handleNavigate('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentPage === 'catalog' ? 'var(--bg-card)' : 'transparent',
              color: currentPage === 'catalog' ? 'var(--accent-vermilion)' : 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: currentPage === 'catalog' ? 700 : 500,
              textAlign: 'left'
            }}
          >
            <span>Katalog Menu</span>
            {currentPage === 'catalog' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-vermilion)' }} />}
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

          {isAuthenticated ? (
            <button
              onClick={() => handleNavigate('admin-dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--text-primary)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%'
              }}
            >
              <User size={16} />
              <span>Portal {user?.role === 'admin' ? 'Admin' : 'Staf'}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                width: '100%'
              }}
            >
              <User size={16} />
              <span>Login Staf</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

