import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Clients } from './features/clients/Clients'; // <-- Import Clients
import { Projects } from './features/projects/Projects'; // <-- Import Projects
import { ProjectBoard } from './features/tasks/ProjectBoard'; // <-- Import the new component

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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId/board" element={<ProjectBoard />} /> {/* <-- Add this route */}
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