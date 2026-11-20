function crearModeloTokens(pool){
    //necesitamos una fucnion que se encargue poder insertar dentro de la bd los tokens que se estaran revocados para que no se vuelvan a utilizar
    async function revocar(jti, ususario, exp){
        await pool.query(
            'INSERT INTO tokens_revocados (jti, usuario, exp) VALUES (?, ?, FROM_UNIXTIME(?))',
            [jti, ususario, exp]
        );
    }

    //una funcino para verificar si el token esta revcado
    async function estaRevocado(jti){
        const [filas] = await pool.query(
            'SELECT 1 FROM tokens_revocados WHERE jti = ?', [String(jti || '')]
        );
        return filas.length > 0;
    }

    //una funcion para poder consultar todos los tokens evocados 

    async function listar() {
        const [filas] = await pool.query(
            'SELECT jti, usuario, expira, revocado_en FROM tokens_revocados OIRDER BY revocado_en DESC, jti'
        );
        return filas;
    };

    return { revocar, estaRevocado, listar };
        
}

module.exports = { crearModeloTokens };