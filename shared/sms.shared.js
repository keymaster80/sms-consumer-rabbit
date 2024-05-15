// Import libraries
const log4js = require("log4js");
let rp = require("request-promise-native");


// Import config
let SMSServex_URL = require("../config/integrations.config").SMSServex_URL;
let SMSServex_URL_AUTH = require("../config/integrations.config").SMSServex_URL_AUTH;
let SMSServex_APIKEY = require("../config/integrations.config").SMSServex_APIKEY;
let SMSServex_COUNTRY = require("../config/integrations.config").SMSServex_COUNTRY;
let SMSServex_DIAL = require("../config/integrations.config").SMSServex_DIAL;
let SMSServex_TAG = require("../config/integrations.config").SMSServex_TAG;
let SMSServex_TIMEOUT_AUTH = require("../config/integrations.config").SMSServex_TIMEOUT_AUTH;
let SMSServex_TIMEOUT_Request = require("../config/integrations.config").SMSServex_TIMEOUT_Request;

let SMSUserName = require("../config/integrations.config").SMSUserName;
let SMSpassword = require("../config/integrations.config").SMSpassword;

let SMSOrigen = require("../config/integrations.config").SMSOrigen;

// Obtengo logger
let logger = log4js.getLogger('ServerScripts');

// Importo clase SQLConector
const SQLConector = require('./sql.shared.js');
const sqlConector = new SQLConector();

// Function to consume queue
class SMSSender{
  
  constructor(){}

  async validateTokenServex(){
    let token;
    let sqlResponseValidateToken;
    try{
      sqlResponseValidateToken = await sqlConector.executeStoredProcedureValidateToken();
      console.log("el token devuelto es ",sqlResponseValidateToken);
      if(sqlResponseValidateToken=='noValidToken'){
        token = await generateToken();
      }else{
        token = sqlResponseValidateToken
      }
    }catch(e){
      logger.error("Ocurrió un error al solicitar el token al proveedor:", e);
      throw e;
    }
    return token;
  }

  async generateToken(){

    try{
      let requestNewToken ={
        username: SMSUserName,
        password: SMSpassword
      }
      let urlAuth = SMSServex_URL_AUTH;

      let optionsAuth={
        method: 'POST',
        url: urlAuth,
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestNewToken,
        json: true,
        strictSSL: false,
        timeout: SMSServex_TIMEOUT_AUTH
      }
      let responseAUTH;
      let sqlResponse;
      await rp(optionsAuth).then(function (response) {
          responseAUTH = response;
          token = responseAUTH.token;
      })
      sqlResponse = await sqlConector.insertNewToken(token,responseAUTH.expires,''); 
      logger.info('Resultado de la insercion del token ',sqlResponse);
    }
    
    catch(e){
      logger.error("Ocurrio un error al solicitar token al proveedor, error: ")
      logger.error(e);
    }
    return token;
  }

  async sendSMS(request){
    let tokenRecibido = validateTokenServex()

    if(!tokenRecibido) {
      logger.error("No se recibio un token");

    }else{

      let message = request.message;
      let id = request.id;
      let telefonos = request.addresses;
  
      try {

        let messages = [];

        for(let telefono of telefonos){
          messages.push(
            {
                mensaje: message,
                telefono: telefono,
                identificador: id
            })
        }
      
          // Formo el body del request del proveedor
          let requestSMS = {
              origen: SMSOrigen,
              mensajes: messages
          }
          
          // Armo el request
          let url = SMSServex_URL;
          
          let options = {
            url: url,
            method: "POST",
            body: requestSMS,
            json: true,
            strictSSL: false,
            timeout: SMSServex_TIMEOUT_Request,
            headers:{
              "Content-Type": "application/json",
              "Authorization": "Bearer " +tokenRecibido
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



 
}

module.exports = SMSSender;
