import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 1 неделя в миллисекундах
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

interface User {
  name: string;
  email: string;
  permissions: string[]; // Массив категорий, к которым есть доступ, e.g., ['analysis', 'development']
}

interface AuthState {
  user: User | null;
  login: (name: string, email: string, permission: string) => void;
  logout: () => void;
  isAuthenticated: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // При загрузке приложения проверяем наличие активной сессии в localStorage
    const storedUser = localStorage.getItem('user');
    const storedExpiration = localStorage.getItem('sessionExpiration');

    if (storedUser && storedExpiration) {
      const expirationTime = new Date(parseInt(storedExpiration, 10));
      if (expirationTime > new Date()) {
        // Сессия еще действительна
        setUser(JSON.parse(storedUser));
      } else {
        // Сессия истекла
        logout();
      }
    }
  }, []);

  const login = (name: string, email: string, permission: string) => {
    const expirationTime = new Date().getTime() + SESSION_DURATION;
    
    // Если пользователь уже авторизован, добавляем новое разрешение
    const updatedUser = user 
        ? { ...user, name, email, permissions: [...new Set([...user.permissions, permission])] }
        : { name, email, permissions: [permission] };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('sessionExpiration', expirationTime.toString());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiration');
    localStorage.removeItem('n8n_authenticated');
    localStorage.removeItem('n8n_authenticated_token');
  };

  const isAuthenticated = (permission: string) => {
    // Проверяем, есть ли у пользователя разрешение для данной категории
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 