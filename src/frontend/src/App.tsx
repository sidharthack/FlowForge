import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';

const queryClient = new QueryClient();

// Updated Dashboard - no longer needs its own logout button!
const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to FlowForge! Select an option from the sidebar to get started.</p>
    </div>
  );
};

// Placeholder for future routes
const Placeholder = ({ title }: { title: string }) => <h2>{title} Placeholder</h2>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes wrapped in the AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Placeholder title="Projects" />} />
                <Route path="/clients" element={<Placeholder title="Clients" />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;