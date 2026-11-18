import { useState, useEffect, useCallback } from 'react';
import { ROUTE_PATHS } from '../routes/route_paths';

const VALID_PAGES = Object.values(ROUTE_PATHS);

const PAGE_TITLES = {
  [ROUTE_PATHS.LANDING]: 'Ketsai',
  [ROUTE_PATHS.CATALOG]: 'Ketsai - Katalog Menu',
  [ROUTE_PATHS.CHECKOUT_SUCCESS]: 'Ketsai - Payment',
  [ROUTE_PATHS.LOGIN]: 'Ketsai - Login',
  [ROUTE_PATHS.USER_DASHBOARD]: 'Ketsai Portal - Dashboard',
  [ROUTE_PATHS.USER_STOCK_ENTRY]: 'Ketsai Portal - Input Stok',
  [ROUTE_PATHS.USER_STOCK_LOGS]: 'Ketsai Portal - Riwayat Stok',
  [ROUTE_PATHS.USER_ORDERS]: 'Ketsai Portal - Riwayat Checkout',
  [ROUTE_PATHS.ADMIN_STAFF]: 'Ketsai Portal - Kelola Akun Staf'
};

export function getPageFromLocation() {
  if (typeof window === 'undefined') return ROUTE_PATHS.LANDING;

  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (path && VALID_PAGES.includes(path)) {
    return path;
  }

  if (path) {
    const hyphenated = path.replace(/\//g, '-');
    if (VALID_PAGES.includes(hyphenated)) {
      return hyphenated;
    }
  }

  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (hash && VALID_PAGES.includes(hash)) {
    return hash;
  }
  if (hash) {
    const hyphenatedHash = hash.replace(/\//g, '-');
    if (VALID_PAGES.includes(hyphenatedHash)) {
      return hyphenatedHash;
    }
  }

  try {
    const isReload =
      (window.performance?.getEntriesByType &&
        window.performance.getEntriesByType('navigation')[0]?.type === 'reload') ||
      window.performance?.navigation?.type === 1;

    if (isReload) {
      const stored = sessionStorage.getItem('ketsai_active_page');
      if (stored && VALID_PAGES.includes(stored)) {
        return stored;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca navigation type / sessionStorage:', e);
  }

  return ROUTE_PATHS.LANDING;
}

export function getUrlForPage(page) {
  if (page === ROUTE_PATHS.LANDING) return '/';
  return `/${page}`;
}

export function usePageNavigation() {
  const [currentPage, setCurrentPage] = useState(() => getPageFromLocation());

  const updateDocumentTitle = useCallback((page) => {
    if (PAGE_TITLES[page]) {
      document.title = PAGE_TITLES[page];
    }
  }, []);

  useEffect(() => {
    const resolvedPage = getPageFromLocation();
    const targetUrl = getUrlForPage(resolvedPage);

    updateDocumentTitle(resolvedPage);

    try {
      sessionStorage.setItem('ketsai_active_page', resolvedPage);
    } catch {}

    if (window.location.pathname !== targetUrl && window.location.pathname !== targetUrl + '/') {
      window.history.replaceState({ page: resolvedPage }, '', targetUrl);
    }
  }, [updateDocumentTitle]);

  useEffect(() => {
    const handlePopState = (event) => {
      const targetPage = event.state?.page || getPageFromLocation();
      setCurrentPage(targetPage);
      updateDocumentTitle(targetPage);
      try {
        sessionStorage.setItem('ketsai_active_page', targetPage);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateDocumentTitle]);

  const navigateToPage = useCallback(
    (newPage, options = {}) => {
      if (!newPage) return;

      const replace = typeof options === 'boolean' ? options : options?.replace || false;
      const preserveScroll = options?.preserveScroll || false;

      setCurrentPage(newPage);
      updateDocumentTitle(newPage);

      try {
        sessionStorage.setItem('ketsai_active_page', newPage);
      } catch {}

      const targetUrl = getUrlForPage(newPage);
      if (window.location.pathname !== targetUrl) {
        if (replace) {
          window.history.replaceState({ page: newPage }, '', targetUrl);
        } else {
          window.history.pushState({ page: newPage }, '', targetUrl);
        }
      }

      if (!preserveScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [updateDocumentTitle]
  );

  return {
    currentPage,
    setPage: navigateToPage
  };
}
