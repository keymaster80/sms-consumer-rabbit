// Import libraries
const log4js = require("log4js");
const sql = require("mssql");

// Import config
let MSSQL_HOST = require("../config/sql.config.js").MSSQL_HOST;
let MSSQL_PORT = require("../config/sql.config.js").MSSQL_PORT;
let MSSQL_USER = require("../config/sql.config.js").MSSQL_USER;
let MSSQL_PASSWORD = require("../config/sql.config.js").MSSQL_PASSWORD;
let MSSQL_DATABASE = require("../config/sql.config.js").MSSQL_DATABASE;
let MSSQL_CONN_TIMEOUT = require("../config/sql.config.js").MSSQL_CONN_TIMEOUT;
let MSSQL_REQ_TIMEOUT = require("../config/sql.config.js").MSSQL_REQ_TIMEOUT;
let MSSQL_POOL_MIN = require("../config/sql.config.js").MSSQL_POOL_MIN;
let MSSQL_POOL_MAX = require("../config/sql.config.js").MSSQL_POOL_MAX;
let MSSQL_POOL_IDLE_TIMEOUT = require("../config/sql.config.js").MSSQL_POOL_IDLE_TIMEOUT;
let MSSQL_ENCRYPT = require("../config/sql.config.js").MSSQL_ENCRYPT;
let MSSQL_USE_UTC = require("../config/sql.config.js").MSSQL_USE_UTC;

// Obtengo logger
let logger = log4js.getLogger('ServerScripts');

// Function to consume queue

class SQLConector{
  
  constructor(){}

  async executeStoredProcedureValidateToken(){

    let MSSQL_CONFIG = {
        user: MSSQL_USER,
        password: MSSQL_PASSWORD,
        server: MSSQL_HOST,
        database: MSSQL_DATABASE,
        port: MSSQL_PORT,
        pool: {
            max: MSSQL_POOL_MAX,
            min: MSSQL_POOL_MIN,
            idleTimeoutMillis: MSSQL_POOL_IDLE_TIMEOUT
        },
        options: {
            encrypt: MSSQL_ENCRYPT,
            useUTC: MSSQL_USE_UTC,
            connectionTimeout: MSSQL_CONN_TIMEOUT,
            requestTimeout: MSSQL_REQ_TIMEOUT,
        }
    };
    
    try {
        // Create conection to database
        const pool = await sql.connect(MSSQL_CONFIG);
        // Execute store procedure
        const result = await pool.request().execute(`validateTokenServex`);
        // Close conection to database
        await pool.close();

        return result;

    } catch (err) {
        logger.error("Ocurrio un error al ejecutar Store procedure executeStoredProcedureValidateToken, error: ")
        logger.error(err);

        return false;

    }
  }

  async insertNewToken(token,fechaExpiracion,outPut){
    let MSSQL_CONFIG = {
        user: MSSQL_USER,
        password: MSSQL_PASSWORD,
        server: MSSQL_HOST,
        database: MSSQL_DATABASE,
        port: MSSQL_PORT,
        pool: {
            max: MSSQL_POOL_MAX,
            min: MSSQL_POOL_MIN,
            idleTimeoutMillis: MSSQL_POOL_IDLE_TIMEOUT
        },
        options: {
            encrypt: MSSQL_ENCRYPT,
            useUTC: MSSQL_USE_UTC,
            connectionTimeout: MSSQL_CONN_TIMEOUT,
            requestTimeout: MSSQL_REQ_TIMEOUT,
        }
    };
    try {
        // Create conection to database
        const pool = await sql.connect(MSSQL_CONFIG);
        // Execute store procedure
        const result = await pool.request()
            .input('token', token)
            .input('fechaExpiracion', fechaExpiracion)
            .input('insertExitoso', outPut)
            .execute(`insertValidTokenServex`);
        // Close conection to database
        await pool.close();

        return true;

    } catch (err) {
        logger.error("Ocurrio un error al ejecutar Store procedure, error: ")
        logger.error(err);

        return false;

    }

  }


  async executeStoredProcedure(address, request, response, url){

    let MSSQL_CONFIG = {
        user: MSSQL_USER,
        password: MSSQL_PASSWORD,
        server: MSSQL_HOST,
        database: MSSQL_DATABASE,
        port: MSSQL_PORT,
        pool: {
            max: MSSQL_POOL_MAX,
            min: MSSQL_POOL_MIN,
            idleTimeoutMillis: MSSQL_POOL_IDLE_TIMEOUT
        },
        options: {
            encrypt: MSSQL_ENCRYPT,
            useUTC: MSSQL_USE_UTC,
            connectionTimeout: MSSQL_CONN_TIMEOUT,
            requestTimeout: MSSQL_REQ_TIMEOUT,
        }
    };
    
    try {
        // Create conection to database
        const pool = await sql.connect(MSSQL_CONFIG);
        // Execute store procedure
        const result = await pool.request()
            .input('Address', address)
            .input('Body', request)
            .input('Response', response)
            .input('Url', url)
            .execute(`InsertarLogSMS`);
        // Close conection to database
        await pool.close();

        return true;

    } catch (err) {
        logger.error("Ocurrio un error al ejecutar Store procedure, error: ")
        logger.error(err);

        return false;

    }
  }
}

module.exports = SQLConector;
