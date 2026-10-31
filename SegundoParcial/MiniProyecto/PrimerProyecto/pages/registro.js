import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import estilos from '../styles/Talleres.module.css';

export default function CrearUsuario() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [boleta, setBoleta] = useState('');
  
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarRegistro(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const correoLimpio = correo.trim();
    const contrasenaLimpia = contrasena.trim();
    const boletaLimpia = boleta.trim();

    setEnviando(true);
    try {
      await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify({ 
          nombre: nombreLimpio, 
          correo: correoLimpio, 
          contrasena: contrasenaLimpia,
          boleta: boletaLimpia 
        }),
      });

      setExito('¡Usuario creado correctamente!');
      setNombre('');
      setCorreo('');
      setContrasena('');
      setBoleta('');
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
      <h1>Registrar Nuevo Usuario</h1>

      <section className={estilos.panel}>
        <form onSubmit={manejarRegistro} className="formulario">
          <input 
            type="text"
            placeholder="Nombre completo" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            required 
          />
          <input 
            type="text"
            placeholder="Boleta (10 dígitos)" 
            value={boleta} 
            onChange={(e) => setBoleta(e.target.value)} 
            required 
          />
          <input 
            type="email"
            placeholder="Correo electrónico" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)} 
            required 
          />
          <input 
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)" 
            value={contrasena} 
            onChange={(e) => setContrasena(e.target.value)} 
            required 
          />
          <button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Crear Usuario'}
          </button>
        </form>

        {errorForm && <p className="error">{errorForm}</p>}
        {exito && <p className={estilos.exito}>{exito}</p>}
      </section>
    </main>
  );
}