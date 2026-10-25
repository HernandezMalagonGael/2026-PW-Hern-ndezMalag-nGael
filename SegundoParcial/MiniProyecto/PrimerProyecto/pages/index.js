import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Ejemplo de MiniProyecto con Next</h1>
      <p>
        <Link href="/practica/1">Ir a /practica/1</Link>
      </p>

      {/* PASO 7.3: Enlaces a /talleres y /perfil */}
      <p>
        <Link href="/talleres">Ver Talleres →</Link>
      </p>
      <p>
        <Link href="/perfil">Ver Mi Perfil →</Link>
      </p>
    </main>
  );
}