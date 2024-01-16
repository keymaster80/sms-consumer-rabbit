// Import libraries
const log4js = require("log4js");
let rp = require("request-promise-native");

// Import config
let SMSAMOVIL_URL = require("../config/integrations.config").SMSAMOVIL_URL;
let SMSAMOVIL_AUTH = require("../config/integrations.config").SMSAMOVIL_AUTH;
let SMSAMOVIL_APIKEY = require("../config/integrations.config").SMSAMOVIL_APIKEY;
let SMSAMOVIL_COUNTRY = require("../config/integrations.config").SMSAMOVIL_COUNTRY;
let SMSAMOVIL_DIAL = require("../config/integrations.config").SMSAMOVIL_DIAL;
let SMSAMOVIL_TAG = require("../config/integrations.config").SMSAMOVIL_TAG;
let SMSAMOVIL_TIMEOUT = require("../config/integrations.config").SMSAMOVIL_TIMEOUT;
// Obtengo logger
let logger = log4js.getLogger('ServerScripts');

// Importo clase SQLConector
const SQLConector = require('./sql.shared.js');
const sqlConector = new SQLConector();

// Function to consume queue
class SMSSender{
  
  constructor(){}

  async sendSMS(request){
    let message = request.message;
    let id = request.id;
    let msisdns = request.addresses;

    try {
    
        // Formo el body del request del proveedor
        let requestSMS = {
            apiKey: SMSAMOVIL_APIKEY,
            country: SMSAMOVIL_COUNTRY,
            dial: SMSAMOVIL_DIAL,
            message: message,
            msisdns: msisdns,
            tag: SMSAMOVIL_TAG
        }
        
        // Armo el request
        let url = SMSAMOVIL_URL;
        
        let options = {
          url: url,
          method: "POST",
          body: requestSMS,
          json: true,
          strictSSL: false,
          timeout: SMSAMOVIL_TIMEOUT,
          headers:{
            "Content-Type": "application/json",
            "Authorization": SMSAMOVIL_AUTH
          }
        }

        let responseSMS;
        let sqlResponse;

        // Ejecuto el POST
        await rp(options).then(function (response) {
          responseSMS = response;
        })  
        sqlResponse = await sqlConector.executeStoredProcedure(msisdns.toString(), JSON.stringify(requestSMS), JSON.stringify(responseSMS), SMSAMOVIL_URL);

    } catch (err) {
      logger.error("Ocurrio un error al enviar SMS al proveedor, error: ")
      logger.error(err);
      sqlResponse = await sqlConector.executeStoredProcedure(msisdns.toString(), JSON.stringify(requestSMS), err, SMSAMOVIL_URL);
    }
  }
}

module.exports = SMSSender;
