import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TenantView } from './views/TenantView';
import { OwnerView } from './views/OwnerView';
import { Footer } from './components/Footer';


function App() {
  const { role } = useApp();

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
