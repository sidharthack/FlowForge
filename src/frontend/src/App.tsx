import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast'; // <-- NEW IMPORT
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Clients } from './features/clients/Clients';
import { Projects } from './features/projects/Projects';
import { ProjectBoard } from './features/tasks/ProjectBoard';

const queryClient = new QueryClient();

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to FlowForge! Select an option from the sidebar to get started.</p>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* NEW: Global Toaster configuration */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { fontSize: '14px', fontFamily: 'sans-serif' }
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId/board" element={<ProjectBoard />} />
                <Route path="/clients" element={<Clients />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;