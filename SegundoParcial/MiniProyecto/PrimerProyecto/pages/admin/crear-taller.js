import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import estilos from '../../styles/Formulario.module.css';

const FORM_INICIAL = { nombre: '', fecha: '', cupo: 30, instructor: '', boleta: '' };

export default function CrearTaller() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [talleres, setTalleres] = useState([]);
  const [mensaje, setMensaje] = useState(null); 
  const [enviando, setEnviando] = useState(false);

  // Obtener la fecha actual en formato AAAA-MM-DD para bloquear fechas pasadas
  const fechaHoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    cargarTalleres();
  }, []);

  async function cargarTalleres() {
    try {
      setTalleres(await pedirJSON('/talleres'));
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  function cambiar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setMensaje(null);

    if (!form.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del taller es obligatorio' });
      return;
    }
    if (!form.fecha) {
      setMensaje({ tipo: 'error', texto: 'La fecha es obligatoria' });
      return;
    }
    if (form.fecha < fechaHoy) {
      setMensaje({ tipo: 'error', texto: 'No puedes crear un taller con una fecha pasada' });
      return;
    }
    if (!form.instructor.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del instructor es obligatorio' });
      return;
    }
    if (form.boleta !== '0000000000') {
      setMensaje({ tipo: 'error', texto: 'Boleta de administrador incorrecta' });
      return;
    }

    setEnviando(true);
    try {
      await pedirJSON('/talleres', {
        method: 'POST',
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          fecha: form.fecha,
          cupo: Number(form.cupo),
          instructor: form.instructor.trim(),
          boleta: form.boleta,
        }),
      });
      setMensaje({
        tipo: 'ok',
        texto: '¡Taller creado correctamente!',
      });
      setForm(FORM_INICIAL); 
      await cargarTalleres();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={estilos.contenedor}>
      <form className={estilos.tarjeta} onSubmit={enviar} autoComplete="off">
        <h1 className={estilos.titulo}>Crear taller</h1>
        {mensaje && <div className={mensaje.tipo === 'ok' ? estilos.ok : estilos.error}>{mensaje.texto}</div>}

        <div className={estilos.campo}>
          <label htmlFor="nombre">Nombre del taller</label>
          <input id="nombre" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
        </div>
        
        <div className={estilos.campo}>
          <label htmlFor="fecha">Fecha</label>
          <input 
            id="fecha" 
            type="date" 
            value={form.fecha} 
            min={fechaHoy}
            onChange={(e) => cambiar('fecha', e.target.value)} 
          />
        </div>

        <div className={estilos.campo}>
          <label htmlFor="cupo">Cupo</label>
          <input id="cupo" type="number" value={form.cupo} onChange={(e) => cambiar('cupo', e.target.value)} />
        </div>
        
        <div className={estilos.campo}>
          <label htmlFor="instructor">Nombre del profesor</label>
          <input id="instructor" value={form.instructor} onChange={(e) => cambiar('instructor', e.target.value)} />
        </div>

        <h2 className={estilos.subtitulo}>Confirma que eres administrador</h2>
        <div className={estilos.campo}>
          <label htmlFor="boleta">Boleta de administrador</label>
          <input 
            id="boleta" 
            type="text"
            value={form.boleta} 
            onChange={(e) => cambiar('boleta', e.target.value)} 
            autoComplete="off"
            name="no-autocompletar-admin"
          />
        </div>

        <button className={estilos.boton} disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear taller'}
        </button>
      </form>

      <div className={estilos.tarjeta}>
        <h2 className={estilos.titulo}>Talleres existentes</h2>
        {talleres.length === 0 ? (
          <p className={estilos.nota}>Todavía no hay talleres.</p>
        ) : (
          <table className={estilos.tabla}>
            <thead>
              <tr><th>Taller</th><th>Fecha</th><th>Profesor</th><th>Cupo</th></tr>
            </thead>
            <tbody>
              {talleres.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{String(t.fecha).slice(0, 10)}</td>
                  <td>{t.instructor || '—'}</td>
                  <td>{t.cupo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}