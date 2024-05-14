// Import libraries
const log4js = require("log4js");
let rp = require("request-promise-native");

// Import config
let SMSServex_URL = require("../config/integrations.config").SMSServex_URL;
let SMSServex_AUTH = require("../config/integrations.config").SMSServex_AUTH;
let SMSServex_APIKEY = require("../config/integrations.config").SMSServex_APIKEY;
let SMSServex_COUNTRY = require("../config/integrations.config").SMSServex_COUNTRY;
let SMSServex_DIAL = require("../config/integrations.config").SMSServex_DIAL;
let SMSServex_TAG = require("../config/integrations.config").SMSServex_TAG;
let SMSServex_TIMEOUT = require("../config/integrations.config").SMSServex_TIMEOUT;
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
            apiKey: SMSServex_APIKEY,
            country: SMSServex_COUNTRY,
            dial: SMSServex_DIAL,
            message: message,
            msisdns: msisdns,
            tag: SMSServex_TAG
        }
        
        // Armo el request
        let url = SMSServex_URL;
        
        let options = {
          url: url,
          method: "POST",
          body: requestSMS,
          json: true,
          strictSSL: false,
          timeout: SMSServex_TIMEOUT,
          headers:{
            "Content-Type": "application/json",
            "Authorization": SMSServex_AUTH
          }
        }

        let responseSMS;
        let sqlResponse;

        // Ejecuto el POST
        await rp(options).then(function (response) {
          responseSMS = response;
        })  
        sqlResponse = await sqlConector.executeStoredProcedure(msisdns.toString(), JSON.stringify(requestSMS), JSON.stringify(responseSMS), SMSServex_URL);

    } catch (err) {
      logger.error("Ocurrio un error al enviar SMS al proveedor, error: ")
      logger.error(err);
      sqlResponse = await sqlConector.executeStoredProcedure(msisdns.toString(), JSON.stringify(requestSMS), err, SMSServex_URL);
    }
  }
}

module.exports = SMSSender;
