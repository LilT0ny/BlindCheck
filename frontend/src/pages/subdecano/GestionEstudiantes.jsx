import React from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import GenericCrudPage from '../../components/subdecano/GenericCrudPage';

const GestionEstudiantes = () => {
  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'nombre' },
    { header: 'Email', field: 'email' },
    { header: 'Carrera', field: 'carrera' },
    {
      header: 'Materias',
      render: (item, secondaryData) => (
        <div className="materias-list">
          {item.materias_cursando && item.materias_cursando.map(matId => {
            const mat = Array.isArray(secondaryData) ? secondaryData.find(m => m.id === matId) : null;
            return mat ? <span key={matId} className="materia-tag">{mat.codigo}</span> : null;
          })}
        </div>
      )
    },
    {
      header: 'Estado',
      render: (item) => (
        <span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>
          {item.activo ? <><CheckCircle size={14} className="inline mr-1" /> Activo</> : <><XCircle size={14} className="inline mr-1" /> Inactivo</>}
        </span>
      )
    },
    {
      header: 'Primer Login',
      render: (item) => (
        item.primer_login ?
          <span className="badge badge-warning"><AlertTriangle size={14} className="inline mr-1" /> Pendiente</span> :
          <span className="badge badge-success"><CheckCircle size={14} className="inline mr-1" /> Completado</span>
      )
    }
  ];

  const renderForm = ({ formData, setFormData, secondaryData, editando }) => {
    // Helper to toggle materias
    const toggleMateria = (materiaId) => {
      const current = formData.materias_cursando || []; // Ensure array
      if (current.includes(materiaId)) {
        setFormData({ ...formData, materias_cursando: current.filter(m => m !== materiaId) });
      } else {
        setFormData({ ...formData, materias_cursando: [...current, materiaId] });
      }
    };

    return (
      <>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre Completo *</label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            value={formData.nombre || ''}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="carrera">Carrera *</label>
          <input
            type="text"
            id="carrera"
            className="form-control"
            value={formData.carrera || ''}
            onChange={e => setFormData({ ...formData, carrera: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Materias Cursando</label>
          <div className="materias-checkbox-group">
            {Array.isArray(secondaryData) && secondaryData.map(materia => (
              <label key={materia.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.materias_cursando || []).includes(materia.id)}
                  onChange={() => toggleMateria(materia.id)}
                />
                <span>{materia.codigo} - {materia.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <GenericCrudPage
      title="Gestión de Estudiantes"
      icon={Users}
      endpoints={{
        getAll: '/subdecano/estudiantes',
        create: '/subdecano/estudiantes',
        update: (id) => `/subdecano/estudiantes/${id}`,
        delete: (id) => `/subdecano/estudiantes/${id}`,
        toggleActive: (id) => `/subdecano/estudiantes/${id}/desactivar`,
        getSecondary: '/subdecano/materias'
      }}
      columns={columns}
      renderForm={renderForm}
      initialFormState={{
        email: '',
        nombre: '',
        carrera: 'Ingeniería de Software',
        materias_cursando: []
      }}
      showPasswordModal={true}
      transformDataBeforeSubmit={(data) => {
        if (!data.email.endsWith('@blindcheck.edu')) {
          throw { response: { data: { detail: 'El correo debe ser del dominio @blindcheck.edu' } } };
        }
        return data;
      }}
    />
  );
};

export default GestionEstudiantes;

