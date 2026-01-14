import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import './GestionDocentes.css';

const GestionDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    cedula: '',
    departamento: '',
    materias_asignadas: [],
    grupos_asignados: []
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [docentesRes, materiasRes] = await Promise.all([
        api.get('/subdecano/docentes'),
        api.get('/subdecano/materias')
      ]);
      setDocentes(docentesRes.data);
      setMaterias(materiasRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/subdecano/docentes/${editando}`, formData);
        alert('✅ Docente actualizado');
      } else {
        await api.post('/subdecano/docentes', formData);
        alert('✅ Docente creado');
      }
      setShowModal(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar docente');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este docente?')) return;
    try {
      await api.delete(`/subdecano/docentes/${id}`);
      alert('✅ Docente eliminado');
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      cedula: '',
      departamento: '',
      materias_asignadas: [],
      grupos_asignados: []
    });
    setEditando(null);
  };

  if (loading) {
    return (
      <Layout title="Gestión de Docentes">
        <div className="text-center mt-4"><span className="loading"></span></div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Docentes">
      <div className="gestion-container">
        <div className="gestion-header">
          <h2>👨‍🏫 Gestión de Docentes</h2>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
            ➕ Nuevo Docente
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Cédula</th>
                <th>Departamento</th>
                <th>Materias</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.nombre} {doc.apellido}</td>
                  <td>{doc.email}</td>
                  <td>{doc.cedula}</td>
                  <td>{doc.departamento}</td>
                  <td>{doc.materias_asignadas?.length || 0}</td>
                  <td>
                    <div className="acciones-btn-group">
                      <button onClick={() => { setEditando(doc.id); setFormData(doc); setShowModal(true); }} className="btn btn-sm btn-secondary">✏️</button>
                      <button onClick={() => eliminar(doc.id)} className="btn btn-sm btn-error">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editando ? 'Editar' : 'Nuevo'} Docente</h3>
                <button onClick={() => setShowModal(false)} className="btn-close">✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <input type="text" placeholder="Nombre *" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                  <input type="text" placeholder="Apellido *" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} required />
                  <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  <input type="text" placeholder="Cédula *" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required />
                  {!editando && <input type="password" placeholder="Contraseña *" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  <input type="text" placeholder="Departamento" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionDocentes;
