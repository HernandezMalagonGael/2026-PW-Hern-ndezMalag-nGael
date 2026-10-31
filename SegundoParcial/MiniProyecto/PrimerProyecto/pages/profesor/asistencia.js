import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import estilos from '../../styles/Formulario.module.css';

export default function Asistencia() {
  const [talleres, setTalleres] = useState([]);
  const [tallerId, setTallerId] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [mensaje, setMensaje] = useState(null); 
  const [marcando, setMarcando] = useState(''); 

  useEffect(() => {
    cargarTalleres();
  }, []);

  useEffect(() => {
    if (tallerId) cargarAsistencias(tallerId);
    else setAsistencias([]);
  }, [tallerId]);

  async function cargarTalleres() {
    try {
      const lista = await pedirJSON('/talleres');
      setTalleres(lista);
      if (lista.length > 0) setTallerId(lista[0].id);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  async function cargarAsistencias(id) {
    try {
      setAsistencias(await pedirJSON(`/talleres/${id}/asistencias`));
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  async function marcar(registro) {
    setMensaje(null);
    setMarcando(registro.id);
    try {
      // Ya no enviamos la clave, solo el estado de asistencia
      const actualizado = await pedirJSON(`/asistencias/${registro.id}`, {
        method: 'PUT',
        body: JSON.stringify({ asistio: !registro.asistio }),
      });
      setAsistencias((lista) => lista.map((a) => (a.id === actualizado.id ? actualizado : a)));
      setMensaje({ tipo: 'ok', texto: '¡Asistencia actualizada correctamente!' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setMarcando('');
    }
  }

  const presentes = asistencias.filter((a) => a.asistio).length;

  return (
    <main className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>Marcar asistencia</h1>
        {mensaje && <div className={mensaje.tipo === 'ok' ? estilos.ok : estilos.error}>{mensaje.texto}</div>}

        <div className={estilos.campo}>
          <label htmlFor="taller">Taller</label>
          <select id="taller" value={tallerId} onChange={(e) => { setTallerId(e.target.value); setMensaje(null); }}>
            {talleres.length === 0 && <option value="">No hay talleres</option>}
            {talleres.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({String(t.fecha).slice(0, 10)}) - {t.instructor || 'sin profesor'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={estilos.tarjeta}>
        <h2 className={estilos.titulo}>Inscritos ({asistencias.length}) · Presentes: {presentes}</h2>
        {asistencias.length === 0 ? (
          <p className={estilos.nota}>Todavía no hay alumnos inscritos en este taller.</p>
        ) : (
          <table className={estilos.tabla}>
            <thead>
              <tr><th>Alumno</th><th>Boleta</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {asistencias.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre_alumno}</td>
                  <td>{a.boleta}</td>
                  <td className={a.asistio ? estilos.presente : ''}>{a.asistio ? 'Presente' : 'Pendiente'}</td>
                  <td>
                    <button className={estilos.botonChico} disabled={marcando === a.id} onClick={() => marcar(a)}>
                      {a.asistio ? 'Quitar' : 'Marcar presente'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}