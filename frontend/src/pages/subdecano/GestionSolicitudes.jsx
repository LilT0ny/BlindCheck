import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import './GestionSolicitudes.css';

const GestionSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const response = await api.get('/subdecano/solicitudes');
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (solicitudId, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar ${nuevoEstado === 'aprobada' ? 'aprobación' : 'rechazo'} de esta solicitud?`)) {
      return;
    }

    try {
      await api.put(`/subdecano/solicitudes/${solicitudId}/estado`, {
        estado: nuevoEstado
      });
      
      if (nuevoEstado === 'aprobada') {
        alert('✅ Solicitud aprobada. Se ha asignado automáticamente un docente recalificador.');
      } else {
        alert('✅ Solicitud rechazada exitosamente');
      }
      
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.detail || '❌ Error al actualizar solicitud');
    }
  };

  const solicitudesFiltradas = solicitudes.filter(sol => {
    if (filtro === 'todas') return true;
    return sol.estado === filtro;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'badge-warning',
      aprobada: 'badge-success',
      rechazada: 'badge-error'
    };
    return badges[estado] || 'badge-info';
  };

  if (loading) {
    return (
      <Layout title="Gestión de Solicitudes">
        <div className="text-center mt-4">
          <span className="loading"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Solicitudes">
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>📋 Gestión de Solicitudes</h2>
        </div>

        <div className="filtros">
          <button
            className={`filtro-btn ${filtro === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltro('pendiente')}
          >
            Pendientes ({solicitudes.filter(s => s.estado === 'pendiente').length})
          </button>
          <button
            className={`filtro-btn ${filtro === 'aprobada' ? 'active' : ''}`}
            onClick={() => setFiltro('aprobada')}
          >
            Aprobadas ({solicitudes.filter(s => s.estado === 'aprobada').length})
          </button>
          <button
            className={`filtro-btn ${filtro === 'rechazada' ? 'active' : ''}`}
            onClick={() => setFiltro('rechazada')}
          >
            Rechazadas ({solicitudes.filter(s => s.estado === 'rechazada').length})
          </button>
          <button
            className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
          >
            Todas ({solicitudes.length})
          </button>
        </div>

        <div className="solicitudes-table">
          <table>
            <thead>
              <tr>
                <th>Estudiante (Anónimo)</th>
                <th>Materia</th>
                <th>Docente (Anónimo)</th>
                <th>Grupo</th>
                <th>Aporte</th>
                <th>Calif. Actual</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No hay solicitudes {filtro !== 'todas' ? `en estado "${filtro}"` : ''}
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((sol) => (
                  <tr key={sol.id}>
                    <td>{sol.estudiante_nombre_anonimo}</td>
                    <td>{sol.materia_nombre}</td>
                    <td>{sol.docente_nombre_anonimo}</td>
                    <td>{sol.grupo}</td>
                    <td>{sol.aporte}</td>
                    <td>{sol.calificacion_actual}/10</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </td>
                    <td>{new Date(sol.fecha_creacion).toLocaleDateString('es-ES')}</td>
                    <td>
                      {sol.estado === 'pendiente' && (
                        <div className="acciones-btn-group">
                          <button
                            onClick={() => cambiarEstado(sol.id, 'aprobada')}
                            className="btn btn-sm btn-success"
                            title="Aprobar"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => cambiarEstado(sol.id, 'rechazada')}
                            className="btn btn-sm btn-error"
                            title="Rechazar"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default GestionSolicitudes;
