/* Las validaciones para este formulario se realizaran mediante el uso de expreciones regulares, las cuales las vamos a dividir en 3, la primera en tipo texto para nombre, la segunda tipo numerico para la boleta y tercero debe tener un patron para la fecha  

Las expresiones regulares son patrones que nos ayudan a validar cadenas bajo ciertas condiciones.
*/

const patrones = {
    nombre : /^[A-Za-zÁÉÍÓÚÑáéíóúñÜü\s]{2,60}$/,
    boletq : /^\d{10}$/,
    fecha : /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
};

const mensajes = {
    nombre : "Solo letras y espacios, entre 2 y 60 caracteres.",
    boleta : "Debe tener exactamente 10 dígitos numéricos.",
    fecha : "La fecha debe tener el formato DD/MM/AAAA."
};

function validarCampo(campo, valor){
    return patrones[campo].test(valor.trim())
}

//Para validar el formulario debemos ocupar los principios de obtencion y manipulacion de los elementos del DOM

if (typeof document !== 'undefined') {
    const formulario = document.getElementById('form-registro');
    formulario.addEventListener('submit', (evento)
    => {
        evento.preventDefault(); //Evita que el formulario se envie automaticamente

        let formularioValido = true;

        for(const campo of Object.keys(patrones)){
            const input = document.getElementById(campo);
            const errorSpan = document.getElementById('error-${campo}');
            const esValido = validarCampo(campo, input.value);
            input.classList.toggle('invalido' , !esValido);
            sapnError.textContent = esValido ? '' : mensajes[campo];
            if (!esValido) formularioValido = false;
        }

        const mensajeExito = document.getElementById('mensaje-exito');
        mensajeExito.textContent = formularioValido ? 'Registro exitoso!' : '';
    });
}