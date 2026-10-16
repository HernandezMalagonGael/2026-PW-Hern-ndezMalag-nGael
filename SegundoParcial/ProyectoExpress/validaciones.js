//vamos a dejarles dos de las tres funciones para validar 

function validarCorreo(){
//tarea
}

function validarBoleta(){
//tarea
}

function validarContrasena(){
    if(typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}


module.exports = {validarBoleta, validarContrasena, validarCorreo}