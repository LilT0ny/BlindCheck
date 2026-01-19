import React from 'react';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import GenericCrudPage from '../../components/subdecano/GenericCrudPage';

const GestionMaterias = () => {
  const columns = [
    { header: 'Código', field: 'codigo', style: { width: '150px' } },
    { header: 'Nombre', field: 'nombre' },
    { header: 'Descripción', field: 'descripcion', render: (item) => item.descripcion || 'Sin descripción' }
  ];

  const renderForm = ({ formData, setFormData, editando }) => {
    return (
      <>
        <div className="form-group">
          <label htmlFor="codigo">Código de Materia *</label>
          <input
            type="text"
            id="codigo"
            className="form-control"
            value={formData.codigo || ''}
            onChange={e => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="ej: CS-301"
            disabled={!!editando}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            value={formData.nombre || ''}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="ej: Estructuras de Datos"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            className="form-control"
            value={formData.descripcion || ''}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripción de la materia..."
            rows="4"
          />
        </div>
      </>
    );
  };

  return (
    <GenericCrudPage
      title="Gestión de Materias"
      icon={BookOpen}
      endpoints={{
        getAll: '/subdecano/materias',
        create: '/subdecano/materias',
        update: (id) => `/subdecano/materias/${id}`,
        delete: (id) => `/subdecano/materias/${id}`,
        // No toggleActive for materias based on original code, but GenericCrud handles undefined gracefully
      }}
      columns={columns}
      renderForm={renderForm}
      initialFormState={{
        nombre: '',
        codigo: '',
        descripcion: ''
      }}
      showPasswordModal={false}
    />
  );
};

export default GestionMaterias;

