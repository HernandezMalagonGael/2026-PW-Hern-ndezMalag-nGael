import link from 'next/link';

export default function Menu(){
    return(
        <nav>
            <Link href="/">Inicio</Link>
            <Link href="/practica/1">Pratica 1</Link>
        </nav>
    );
}