import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const LogsSistema = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarLogs();
    }, []);

    const cargarLogs = async () => {
        try {
            const response = await api.get('/subdecano/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error al cargar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Logs del Sistema">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Registro de Actividades</h2>
                </div>

                {loading ? (
                    <div className="text-center p-4">
                        <span className="loading"></span>
                        <p>Cargando registros...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-compact w-full">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Rol</th>
                                    <th>Usuario ID</th>
                                    <th>Acción</th>
                                    <th>Detalle</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No hay registros</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const fechaObj = new Date(log.fecha);
                                        return (
                                            <tr key={log.id}>
                                                <td>{fechaObj.toLocaleDateString()}</td>
                                                <td>{fechaObj.toLocaleTimeString()}</td>
                                                <td>
                                                    <span className={`badge ${log.rol === 'subdecano' ? 'badge-subdecano' :
                                                        log.rol === 'docente' ? 'badge-docente' :
                                                            'badge-estudiante'
                                                        }`}>
                                                        {log.rol}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: stringToColor(log.usuario_id)
                                                            }}
                                                            title={`Color ID: ${log.usuario_id}`}
                                                        ></div>
                                                        <span className="font-mono text-xs text-secondary">
                                                            {log.usuario_id.substring(0, 8)}...
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="font-bold text-sm">{log.accion}</td>
                                                <td className="text-sm text-gray-600">{log.detalle}</td>
                                                <td className="font-mono text-xs text-gray-500">{log.ip || '-'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LogsSistema;
