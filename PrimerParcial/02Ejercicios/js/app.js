

const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];


function pintarTabla(){
    const tbody = document.querySelector('#tabla-talleres tbody');
    tbody.innerHTML = ''; // Limpiar contenido previo

    talleres.forEach(taller => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${taller.nombre}</td>
            <td>${taller.instructor}</td>
            <td>${taller.cupo}</td>
            <td>${taller.inscritos}</td>
        `;
        tbody.appendChild(fila);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    pintarTabla();
});

const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    const operacion = selectOperacionArreglo.value;

    let resultado;

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;

        case 'map':
        resultado = talleres.map((t) => t.nombre).join(', ');
        break;

        case 'filter':
        resultado = talleres.filter((t) => t.inscritos >= t.cupo)
                            .map((t) => t.nombre)
                            .join(', ');
        break;

        case 'find':
        const encontrado = talleres.find((t) => t.instructor === 'Ing. María López');
        resultado = encontrado ? encontrado.nombre : 'No encontrado';
        break;

        
    }


    resultadoArreglos.textContent = resultado;
});

//segunda parte

const formObjeto = document.getElementById('form-objeto');
const resultadoObjeto = document.getElementById('resultado-objeto');

formObjeto.addEventListener('submit',(evento) => {
    evento.preventDefault();

    //Construimos el objeto de talleres
    const taller = {
      nombre: document.getElementById('obj-nombre').value,
      instructor: document.getElementById('obj-instructor').value,
      cupo: Number(document.getElementById('obj-cupo').value),
      inscritos:  Number(document.getElementById('obj-inscritos').value)
    };

    const operacion = document.getElementById('operacion-objeto').value;

    let resultado;

    switch(operacion){
        case 'keys':
            resultado = JSON.stringify(Object.keys(taller));
          break;
        case 'values':
          break;
        case 'entries':
            resultado = Object.entries(taller).map(([campo, valor]) => `${campo}: ${valor}`).join('\n')
          break;
        case 'stringify':
          break;
        case 'roundtrip' :
            const textoJson = JSON.stringify(taller, null, 2);
            const objetoDeVuelta = JSON.parse(textoJson);

            resultado = [
                '',
                textoJson,
                '',
                `tipo: $(typeof objetoDeVuelta)`,
                objetoDeVuelta.nombre
            ].join('\n');
          break;
    }

    resultadoObjeto.textContent = resultado;
})
