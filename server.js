// Importo librerías
var log4js = require("log4js");
var path = require('path');
var fs = require('fs');
// Este es un comentario para probar sincronizacion ok2
// Importo configuraciones
var LOGGER_CONFIG = require("./config/logger.config").LOGGER_CONFIG;

// Importo clase RabitConsumer
const RabitConsumer = require('./app/consumer.rabbit.js');
const rabbitConsumer = new RabitConsumer();


// Funcion para iniciar el consumidor
async function InitApp(){
    // Obtengo la ruta para la carpeta de logs
    var logsPath = path.resolve(__dirname, 'logs');

    // Obtengo la ruta para la carpeta de logs
    var logsPath = path.resolve(__dirname, 'logs');

    // Si no existe la creo
    if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath);

    // Incremento la cantidad de listeners para evitar que el logger tire warning al inicializar
    global.process.setMaxListeners(20);

    // Inicializo los logs
    log4js.configure(LOGGER_CONFIG);

    // Obtengo logger
    var logger = log4js.getLogger('ServerScripts');

    // Anuncio servicio inicializandose
    logger.info('********************************************************');
    logger.info('* Inicializando servicio                               *');
    logger.info('********************************************************');

    // Logica del APP

    await rabbitConsumer.getRequestQueue();

}

InitApp();