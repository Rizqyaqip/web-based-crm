import { Logo } from '../components';
import instagramIcon from '../assets/instagram.png';
import youtubeIcon from '../assets/yotube.png';
import whatsappIcon from '../assets/whatsapp.png';

export function Footer({ setPage }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-card)',
      padding: 'clamp(36px, 5vw, 48px) clamp(16px, 4vw, 24px) 28px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(24px, 4vw, 36px)',
        marginBottom: '32px'
      }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Logo height="34px" style={{ borderRadius: '4px' }} />
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Ketsai menghadirkan aneka menu mulai dari olahan original Ketsai, aneka Frozen Food, hingga kesegaran es krim. Nikmati kemudahan pesan langsung tanpa ribet
          </p>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Original & Partnership Food & Beverage
          </span>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Navigasi Cepat
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <li>
              <button 
                onClick={() => { setPage('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.15s' }}
              >
                Beranda
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setPage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.15s' }}
              >
                Daftar Menu 
              </button>
            </li>
          </ul>
        </div>

        {/* Operational hours & Location */}
        <div>
          <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Jam Operasional
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <strong>Senin – Sabtu:</strong> 07:00 – 16:30 WIB
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <strong>Minggu:</strong> 08:00 – 16:30 WIB
          </p>
        </div>

        {/* Social Media & Customer Service */}
        <div>
          <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Media Sosial & Layanan
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={instagramIcon} alt="Instagram" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span>@ketsai</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={youtubeIcon} alt="YouTube" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span>Ketsai Official</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={whatsappIcon} alt="Nomor Pelayanan" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              <span>+62 851-1735-4040</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(43, 42, 40, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <span>© {new Date().getFullYear()} Ketsai. All Rights Reserved.</span>
      </div>
    </footer>
  );
}
