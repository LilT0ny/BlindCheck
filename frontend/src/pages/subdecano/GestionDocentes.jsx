import React from 'react';
import { GraduationCap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import GenericCrudPage from '../../components/subdecano/GenericCrudPage';

const GestionDocentes = () => {
  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'nombre' },
    { header: 'Email', field: 'email' },
    { header: 'Carrera', field: 'carrera' },
    {
      header: 'Materias',
      render: (item, secondaryData) => (
        <div className="materias-list">
          {item.materias && item.materias.map(matId => {
            // secondaryData is expected to be list of materias from getSecondary
            // If secondaryData is object or array? Implementation of Generic expects it.
            // We need to check how GenericCrudPage passes it.
            // It passes secondaryData directly.
            // We need to expect secondaryData to be the list of materias.
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
      const current = formData.materias || []; // Ensure array
      if (current.includes(materiaId)) {
        setFormData({ ...formData, materias: current.filter(m => m !== materiaId) });
      } else {
        setFormData({ ...formData, materias: [...current, materiaId] });
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
          <label>Materias Asignadas</label>
          <div className="materias-checkbox-group">
            {Array.isArray(secondaryData) && secondaryData.map(materia => (
              <label key={materia.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.materias || []).includes(materia.id)}
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
      title="Gestión de Docentes"
      icon={GraduationCap}
      endpoints={{
        getAll: '/subdecano/docentes',
        create: '/subdecano/docentes',
        update: (id) => `/subdecano/docentes/${id}`,
        delete: (id) => `/subdecano/docentes/${id}`,
        toggleActive: (id) => `/subdecano/docentes/${id}/desactivar`,
        getSecondary: '/subdecano/materias'
      }}
      columns={columns}
      renderForm={renderForm}
      initialFormState={{
        email: '',
        nombre: '',
        carrera: 'Ingeniería de Software',
        materias: []
      }}
      showPasswordModal={true}
      transformDataBeforeSubmit={(data) => {
        // Validation could act here or inside component? Component calls it.
        if (!data.email.endsWith('@blindcheck.edu')) {
          // We throw error or handle validation? 
          // Ideally validation should be in component, but custom logic is hard.
          // For now, let backend validate or add simple check.
          // We will let backend handle it or user generic logic.
          // The original code had a check.
          // Let's add simple validation alert in GenericCrudPage catch? No.
          // Let's rely on backend for now to keep it clean, OR implementation detail:
          // If we throw, the generic page catches it.
          if (!data.email.endsWith('@blindcheck.edu')) {
            throw { response: { data: { detail: 'El correo debe ser del dominio @blindcheck.edu' } } };
          }
        }
        return data;
      }}
    />
  );
};

export default GestionDocentes;

