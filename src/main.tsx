import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Une erreur est survenue.' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060b14] text-white flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="max-w-md w-full bg-[#0c1629] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
              ✨
            </div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
              Gold Avenue
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Un rafraîchissement est nécessaire pour synchroniser l'affichage avec la dernière mise à jour.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
            >
              Actualiser l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

