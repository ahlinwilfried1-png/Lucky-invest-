import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import HistoriquePage from './components/HistoriquePage';
import { User, Product } from './types';
import { DataStore, syncWithBackend, safeLocalStorage } from './dataStore';

export default function App() {
  // Navigation Path & URL Syncing
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [isRegisterFlow, setIsRegisterFlow] = useState(true);
  const [user, setUser] = useState<User | null>(() => DataStore.getCurrentUser());
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Periodic background synchronization with central server
  useEffect(() => {
    const handleStoreUpdated = () => {
      const active = DataStore.getCurrentUser();
      if (active) {
        setUser((prev) => {
          if (!prev) return active;
          if (JSON.stringify(prev) !== JSON.stringify(active)) {
            return active;
          }
          return prev;
        });
      }
    };

    const performSync = async () => {
      try {
        await syncWithBackend();
      } catch (err) {
        console.warn('Silent periodic sync warning:', err);
      }
      handleStoreUpdated();
    };

    // Run sync immediately on mount
    performSync();

    // Poll every 3 seconds to fetch new users, deposits, and status modifications
    const interval = setInterval(performSync, 3000);

    window.addEventListener('gi_store_updated', handleStoreUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
    };
  }, []);

  // On page load, check for active session and URL MLM parameters
  useEffect(() => {
    const initAndLoad = async () => {
      try {
        await syncWithBackend();
      } catch (err) {
        console.warn('Initial backend sync failed gracefully:', err);
      }
      
      // 1. Recover active user logs
      const active = DataStore.getCurrentUser();
  
      // 2. Fetch configured VIP levels
      setProducts(DataStore.getProducts());
  
      // 3. WestPay automatic deposit verification from redirect query params
      const searchParams = new URLSearchParams(window.location.search);
      let hashQuery = "";
      if (window.location.hash && window.location.hash.includes("?")) {
        hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
      }
      const hashParams = new URLSearchParams(hashQuery);

      const getParamInsensitive = (key: string) => {
        const lowerKey = key.toLowerCase();
        
        // Scan standard search query parameters ignoring case
        for (const [k, v] of searchParams.entries()) {
          if (k.toLowerCase() === lowerKey) {
            return v;
          }
        }
        
        // Scan hash parameters ignoring case
        for (const [k, v] of hashParams.entries()) {
          if (k.toLowerCase() === lowerKey) {
            return v;
          }
        }
        
        return null;
      };

      const wpStatus = getParamInsensitive('status');
      const wpAmount = getParamInsensitive('amount');
      const wpRef = getParamInsensitive('ref');
  
      if (wpStatus === 'success' && wpAmount && wpRef) {
        const amt = parseInt(wpAmount);
        if (!isNaN(amt)) {
          if (active) {
            const res = await DataStore.createWestPayDeposit(active.id, amt, wpRef);
            if (res) {
              const updatedActive = DataStore.getCurrentUser();
              if (updatedActive) {
                setUser(updatedActive);
              }
              sessionStorage.setItem('gi_wp_success_notif', JSON.stringify({ amount: amt, ref: wpRef }));
            }
          } else {
            // Store pending credit in localStorage to credit them immediately upon login/auth
            safeLocalStorage.setItem('gi_pending_westpay_credit', JSON.stringify({ amount: amt, ref: wpRef }));
          }
  
          // Clean query parameters to prevent duplicate submission on refresh
          const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
  
      // 4. Catch referral tags in URL parameters (supports ?ref=, ?code=, ?r=, ?parrain=, ?sponsor=)
      const refCode = getParamInsensitive('ref') || 
                      getParamInsensitive('code') || 
                      getParamInsensitive('r') || 
                      getParamInsensitive('parrain') || 
                      getParamInsensitive('sponsor');
      if (refCode) {
        safeLocalStorage.setItem('gi_captured_ref', refCode.toUpperCase());
      }

      if (active) {
        setUser(active);
      } else {
        setIsRegisterFlow(true);
      }
    };

    initAndLoad();
  }, []);

  const handleAuthSuccess = async (loggedInUser: User) => {
    // Check if there is any pending WestPay credit waiting
    const pendingStr = safeLocalStorage.getItem('gi_pending_westpay_credit');
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        if (pending && pending.amount && pending.ref) {
          const res = await DataStore.createWestPayDeposit(loggedInUser.id, pending.amount, pending.ref);
          if (res) {
            const updated = DataStore.getCurrentUser();
            if (updated) {
              loggedInUser = updated;
            }
            sessionStorage.setItem('gi_wp_success_notif', JSON.stringify({ amount: pending.amount, ref: pending.ref }));
          }
        }
      } catch (err) {
        console.error('Failed to parse pending WestPay deposit:', err);
      } finally {
        safeLocalStorage.removeItem('gi_pending_westpay_credit');
      }
    }
    setUser(loggedInUser);
    if (window.location.pathname !== '/historique') {
      navigateTo('/');
    }
  };

  const handleLogout = () => {
    DataStore.saveCurrentUser(null);
    setUser(null);
    setIsRegisterFlow(true);
    navigateTo('/');
  };

  const navigateToAuth = (isRegister: boolean) => {
    setIsRegisterFlow(isRegister);
    setUser(null);
    navigateTo('/');
  };

  return (
    <div className="min-h-screen bg-[#060b14] font-sans tracking-tight leading-normal overflow-x-hidden select-none relative text-slate-100">
      
      {/* Global Midnight Blue & Subtle Gold Glow Atmosphere */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden select-none" id="site-global-brand-background">
        <div className="w-full h-full fixed inset-0 bg-[#060b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0e1f3d] via-[#070e1c] to-[#040810]" />
        {/* Ambient subtle warm gold highlights on top and bottom corners */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* 1. AUTHENTICATION & REGISTRATION SCREEN */}
      {!user && (
        <Auth 
          initialIsRegister={isRegisterFlow}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 2. DEDICATED HISTORIQUE PAGE */}
      {user && currentPath.split('#')[0] === '/historique' && (
        <HistoriquePage 
          user={user}
          onNavigate={navigateTo}
        />
      )}

      {/* 3. INVESTOR DESKTOP & MOBILE DASHBOARD AREA */}
      {user && currentPath.split('#')[0] !== '/historique' && (
        <Dashboard 
          currentUser={user}
          onLogout={handleLogout}
          onRefreshUser={(updatedUser) => setUser(updatedUser)}
          onNavigate={navigateTo}
        />
      )}

    </div>
  );
}
