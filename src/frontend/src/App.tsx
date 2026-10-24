import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './features/auth/Login';

// Setup TanStack Query Client
const queryClient = new QueryClient();

// A simple dashboard to prove authentication works
const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard (Protected)</h1>
      <p>Welcome to FlowForge! If you see this, you are authenticated.</p>
      <button onClick={logout} style={{ padding: '8px', background: '#dc3545', color: 'white', border: 'none' }}>
        Log Out
      </button>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;