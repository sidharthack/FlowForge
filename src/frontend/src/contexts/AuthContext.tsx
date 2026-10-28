import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  role: string | null; // NEW: Expose the user's role
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('flowforge_token'));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('flowforge_token', token);

      try {
        // Decode the payload of the JWT
        const decoded: any = jwtDecode(token);

        // ASP.NET maps ClaimTypes.Role to this long URI by default
        const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const userRole = decoded[roleClaimKey] || decoded['role'];

        // If a user has multiple roles, it might be an array. Grab the first one.
        setRole(Array.isArray(userRole) ? userRole[0] : (userRole || null));
      } catch (err) {
        console.error("Failed to decode token", err);
        setRole(null);
      }

    } else {
      localStorage.removeItem('flowforge_token');
      setRole(null);
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};