import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import './GestionMaterias.css';

const GestionMaterias = () => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    try {
      const response = await api.get('/subdecano/materias');
      setMaterias(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cargar materias'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.codigo) {
      setAlert({
        type: 'error',
        message: 'Nombre y código son obligatorios'
      });
      return;
    }

    try {
      if (editingId) {
        await api.put(`/subdecano/materias/${editingId}`, formData);
        setAlert({
          type: 'success',
          message: 'Materia actualizada exitosamente'
        });
      } else {
        await api.post('/subdecano/materias', formData);
        setAlert({
          type: 'success',
          message: 'Materia creada exitosamente'
        });
      }

      cargarMaterias();
      resetForm();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.detail || 'Error al guardar materia'
      });
    }
  };

  const handleEdit = (materia) => {
    setFormData({
      nombre: materia.nombre,
      codigo: materia.codigo,
      descripcion: materia.descripcion || ''
    });
    setEditingId(materia.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subdecano/materias/${id}`);
      setAlert({
        type: 'success',
        message: 'Materia eliminada exitosamente'
      });
      cargarMaterias();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.detail || 'Error al eliminar materia'
      });
    }
    setConfirmDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      descripcion: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Layout title="Gestión de Materias">
        <div className="text-center mt-4">
          <span className="loading"></span>
          <p>Cargando materias...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Materias">
      <div className="gestion-materias">
        <div className="header-section">
          <h2>Gestión de Materias</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '✕ Cancelar' : '+ Nueva Materia'}
          </button>
        </div>

        {alert && (
          <AlertModal
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {showForm && (
          <div className="card form-card">
            <h3>{editingId ? 'Editar Materia' : 'Nueva Materia'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código de Materia *</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="ej: CS-301"
                  required
                  disabled={!!editingId}
                />
              </div>

              <div className="form-group">
                <label>Nombre de la Materia *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="ej: Estructuras de Datos"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción de la materia..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Actualizar' : 'Crear'} Materia
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="stats-section">
          <div className="stat-box">
            <div className="stat-number">{materias.length}</div>
            <div className="stat-label">Materias</div>
          </div>
        </div>

        {materias.length === 0 ? (
          <div className="card empty-state">
            <p>No hay materias registradas</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Crear primera materia
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map(materia => (
                    <tr key={materia.id}>
                      <td className="code">{materia.codigo}</td>
                      <td>{materia.nombre}</td>
                      <td className="description">
                        {materia.descripcion || 'Sin descripción'}
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(materia)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setConfirmDelete(materia)}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {confirmDelete && (
          <ConfirmModal
            title="Eliminar Materia"
            message={`¿Estás seguro de que deseas eliminar la materia "${confirmDelete.nombre}"?`}
            onConfirm={() => handleDelete(confirmDelete.id)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default GestionMaterias;
