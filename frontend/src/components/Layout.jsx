import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    const roles = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      subdecano: 'Subdecano'
    };
    return roles[role] || role;
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="header-title">Sistema de Recalificación</h1>
              {title && <span className="header-subtitle">/ {title}</span>}
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="user-role">{getRoleName(user?.role)}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="layout-footer">
        <div className="container">
          <p>&copy; 2026 Sistema de Recalificación Anónima. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
