import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary untuk menangkap error render React dan mencegah layar putih (white screen).
 * Didesain dengan estetika Ketsai Zen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '320px',
          padding: '32px 20px',
          width: '100%'
        }}>
          <div className="zen-card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger-text)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={24} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span className="hanko-stamp" style={{ borderColor: 'var(--accent-vermilion)', color: 'var(--accent-vermilion)' }}>
                SISTEM KETSAI
              </span>
            </div>

            <h3 style={{ fontSize: '18px', margin: '8px 0', color: 'var(--text-primary)' }}>
              Terjadi Kendala Memuat Tampilan
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'Komponen mengalami kendala rendering tak terduga.'}
            </p>

            <button
              onClick={this.handleReset}
              className="zen-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '13px'
              }}
            >
              <RefreshCw size={14} />
              <span>Muat Ulang Tampilan</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
