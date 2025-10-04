const mysql = require("mysql2");
const { Sequelize } = require("sequelize");
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

// Crear pool de conexiones para queries directos
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Instancia de Sequelize para modelos ORM
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: "mysql",
        logging: false,
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos establecida correctamente (Sequelize)");
        return true;
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos (Sequelize):", error.message);
        return false;
    }
};

// Función para ejecutar queries directos
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await promisePool.execute(query, params);
        return results;
    } catch (error) {
        console.error("Error ejecutando query:", error);
        throw error;
    }
};

const closePool = () => {
    pool.end();
    console.log("Pool de conexiones cerrado");
};

module.exports = {
    pool,
    promisePool,
    sequelize,
    testConnection,
    executeQuery,
    closePool,
};
