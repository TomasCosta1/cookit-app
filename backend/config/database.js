const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cookit_db",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Promisificar para usar async/await
const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log("✅ Conexión a la base de datos establecida correctamente");
        connection.release();
        return true;
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error.message);
        return false;
    }
};

// Función para ejecutar queries
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await promisePool.execute(query, params);
        return results;
    } catch (error) {
        console.error("Error ejecutando query:", error);
        throw error;
    }
};

// Función para cerrar todas las conexiones
const closePool = () => {
    pool.end();
    console.log("Pool de conexiones cerrado");
};

module.exports = {
    pool,
    promisePool,
    testConnection,
    executeQuery,
    closePool,
};
