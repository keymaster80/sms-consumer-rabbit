// Import libraries
const amqp = require("amqplib");
const log4js = require("log4js");

// Import config
let RABBITMQ_QUEUE = require("../config/integrations.config.js").RABBITMQ_QUEUE;
let RABBITMQ_SERVER = require("../config/integrations.config.js").RABBITMQ_SERVER;
let RABBIT_SETTINGS_DURABLE = require("../config/integrations.config.js").RABBIT_SETTINGS_DURABLE;

// Obtengo logger
let logger = log4js.getLogger('ServerScripts');

// Importo clase SMSSender
const SMSSender = require('../shared/sms.shared.js');
const smsSender = new SMSSender();

// Function to consume queue
class RabitConsumer{
  
  constructor(){}

  async getRequestQueue(){
    try {
      const connection = await amqp.connect(RABBITMQ_SERVER);
      const channel = await connection.createChannel();
  
      process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
      });
  
      await channel.assertQueue(RABBITMQ_QUEUE, { durable: RABBIT_SETTINGS_DURABLE });
      await channel.consume(
        RABBITMQ_QUEUE,
        async (message) =>  {
          if (message) {
            let requestSMS = JSON.parse(message.content.toString());
            console.log(requestSMS);
            await smsSender.sendSMS(requestSMS); //comentar esta linea para testing
          }
        },
        { noAck: true }
      );
  
      logger.info("APP started. Waiting for messages ...");
    } catch (err) {
      logger.error("Ocurrio un error en el consumidor Rabbit, error: ")
      logger.error(err);
    }
  }
}

module.exports = RabitConsumer;
