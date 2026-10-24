const mysql = require('mysql2/promise');

/*La base de datos local la usaremos para verificar pruebas intrernas, se buscara que dene de crear una cunta en supabdase- com y generaremos un apli para conectarnos a un servicio en bd en la nube, para ello debemos configurar un archivo .env */

const pool = mysql.createPool({
    host:'localhost',
    port:3306,
    user:'root',
    password:'n0m3l0',
    database: 'cecyt9_local',
    dateStrings: true,
});

module.exports = pool;