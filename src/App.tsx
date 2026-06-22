import { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { trackEvent } from './services/trackingService';
import { Navbar } from './components/Navbar';
import { TenantView } from './views/TenantView';
import { OwnerView } from './views/OwnerView';
import { Footer } from './components/Footer';


function App() {
  const { role } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    // Rastrear la apertura de la aplicación (1 vez por carga)
    trackEvent({
      eventName: 'page_opened',
      userId: user?.id,
      metadata: { role }
    });
  }, [user?.id]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/20 font-sans antialiased">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {role === 'tenant' ? (
          <TenantView />
        ) : (
          <OwnerView />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
