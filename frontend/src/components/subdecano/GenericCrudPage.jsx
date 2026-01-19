import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, PauseCircle, CheckCircle, XCircle, AlertTriangle, KeyRound, ClipboardCopy } from 'lucide-react';
import Layout from '../Layout';
import AlertModal from '../AlertModal';
import ConfirmModal from '../ConfirmModal';
import api from '../../services/api';
import '../../pages/subdecano/GestionDocentes.css';

const GenericCrudPage = ({
    title,
    icon: Icon,
    endpoints = {
        getAll: '',
        create: '',
        update: (id) => `${endpoints.create}/${id}`,
        delete: (id) => `${endpoints.create}/${id}`,
        toggleActive: (id) => `${endpoints.create}/${id}/desactivar`
    },
    columns = [],
    renderForm,
    initialFormState,
    transformDataBeforeSubmit,
    showPasswordModal = false
}) => {
    // State
    const [data, setData] = useState([]);
    const [secondaryData, setSecondaryData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [passwordTemporal, setPasswordTemporal] = useState('');
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState(initialFormState);

    // UI State
    const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', action: null, type: 'danger' });

    // Initial Load
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await api.get(endpoints.getAll);
            setData(res.data);

            // Load secondary data if needed (e.g. materias for selection)
            if (endpoints.getSecondary) {
                const secRes = await api.get(endpoints.getSecondary);
                setSecondaryData(secRes.data);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setAlert({ show: true, type: 'error', title: 'Error', message: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = transformDataBeforeSubmit ? transformDataBeforeSubmit(formData) : formData;

            if (editando) {
                await api.put(endpoints.update(editando), dataToSend);
                setAlert({ show: true, type: 'success', title: 'Éxito', message: 'Registro actualizado exitosamente' });
                setShowModal(false);
            } else {
                const res = await api.post(endpoints.create, dataToSend);
                if (showPasswordModal && res.data.password_temporal) {
                    setPasswordTemporal(res.data.password_temporal);
                    setShowPwdModal(true);
                } else {
                    setAlert({ show: true, type: 'success', title: 'Éxito', message: 'Registro creado exitosamente' });
                }
                setShowModal(false);
            }
            resetForm();
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
            setAlert({ show: true, type: 'error', title: 'Error', message: error.response?.data?.detail || 'Error al guardar' });
        }
    };

    const handleEdit = (item) => {
        setEditando(item.id);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id, type = 'baja') => { // type: 'baja' | 'permanente'
        const isPermanent = type === 'permanente';
        setConfirm({
            show: true,
            title: isPermanent ? 'ELIMINAR PERMANENTEMENTE' : 'Desactivar Registro',
            message: isPermanent
                ? '¡CUIDADO! Esta acción es irreversible. ¿Está seguro?'
                : '¿Está seguro de que desea desactivar este registro?',
            type: 'danger',
            action: async () => {
                try {
                    if (isPermanent) {
                        await api.delete(endpoints.delete(id));
                        setAlert({ show: true, type: 'success', title: 'Éxito', message: 'Eliminado permanentemente' });
                    } else {
                        await api.put(endpoints.toggleActive(id));
                        setAlert({ show: true, type: 'success', title: 'Éxito', message: 'Desactivado exitosamente' });
                    }
                    cargarDatos();
                } catch (error) {
                    setAlert({ show: true, type: 'error', title: 'Error', message: error.response?.data?.detail || 'Error al eliminar' });
                }
            }
        });
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditando(null);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(passwordTemporal);
        setAlert({ show: true, type: 'info', title: 'Copiado', message: 'Contraseña copiada al portapapeles' });
    };

    if (loading) {
        return (
            <Layout title={title}>
                <div className="text-center mt-4"><span className="loading"></span></div>
            </Layout>
        );
    }

    return (
        <Layout title={title}>
            <AlertModal
                show={alert.show}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
            />

            <div className="gestion-container">
                <div className="gestion-header">
                    <h2><Icon className="inline-block mr-2" size={24} /> {title}</h2>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary gap-2">
                        <Plus size={20} /> Nuevo
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                {columns.map((col, idx) => <th key={idx} style={col.style}>{col.header}</th>)}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={columns.length + 1} className="text-center p-4">No hay registros</td></tr>
                            ) : (
                                data.map(item => (
                                    <tr key={item.id}>
                                        {columns.map((col, idx) => (
                                            <td key={idx}>{col.render ? col.render(item, secondaryData) : item[col.field]}</td>
                                        ))}
                                        <td>
                                            <div className="acciones-btn-group">
                                                <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary" title="Editar"><Pencil size={16} /></button>
                                                {endpoints.toggleActive && (
                                                    <button onClick={() => handleDelete(item.id, 'baja')} className="btn btn-sm btn-warning" title="Desactivar"><PauseCircle size={16} /></button>
                                                )}
                                                <button onClick={() => handleDelete(item.id, 'permanente')} className="btn btn-sm btn-error" title="Eliminar"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Main Form */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                            <div className="modal-header">
                                <h3>{editando ? <><Pencil className="inline mr-2" size={20} /> Editar</> : <><Plus className="inline mr-2" size={20} /> Nuevo</>}</h3>
                                <button className="btn-close" onClick={() => setShowModal(false)}>✖</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {renderForm({ formData, setFormData, secondaryData, editando })}

                                <div className="form-actions">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Password */}
                {showPwdModal && (
                    <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
                        <div className="modal-content password-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3><KeyRound className="inline mr-2" size={24} /> Credenciales</h3>
                                <button className="btn-close" onClick={() => setShowPwdModal(false)}>✖</button>
                            </div>
                            <div className="password-info">
                                <p className="warning-text flex items-center justify-center gap-2">
                                    <AlertTriangle size={18} /> <strong>IMPORTANTE:</strong> Copia estas credenciales.
                                </p>
                                <div className="credential-box">
                                    <label>Email:</label>
                                    <div className="credential-value">{formData.email}</div>
                                </div>
                                <div className="credential-box/password-value">
                                    <label>Contraseña:</label>
                                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                                        <code className="text-lg font-bold">{passwordTemporal}</code>
                                        <button type="button" onClick={copyToClipboard} className="btn btn-sm btn-link"><ClipboardCopy size={16} /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={() => setShowPwdModal(false)}>Entendido</button>
                            </div>
                        </div>
                    </div>
                )}

                {confirm.show && (
                    <ConfirmModal
                        show={confirm.show}
                        type={confirm.type}
                        title={confirm.title}
                        message={confirm.message}
                        onConfirm={() => { confirm.action(); setConfirm({ ...confirm, show: false }); }}
                        onCancel={() => setConfirm({ ...confirm, show: false })}
                    />
                )}
            </div>
        </Layout>
    );
};

export default GenericCrudPage;
