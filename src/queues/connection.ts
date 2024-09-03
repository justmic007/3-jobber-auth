// connection.ts
import client, { Channel, Connection } from 'amqplib';
import { winstonLogger } from '@justmic007/9-jobber-shared';
import { config } from '@auth/config';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authQueueConnection', 'debug');

let connection: Connection;
let channel: Channel;

async function createConnection(): Promise<Channel> {
  if (channel) { return channel; } // Return existing channel if available

  try {
    connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    channel = await connection.createChannel();

    log.info('Authentication server connected to queue successfully...');

    // Only close connection on application shutdown
    process.once('SIGINT', async () => {
      await channel.close();
      await connection.close();
    });

    return channel;
  } catch (error) {
    log.log('error', 'AuthService createConnection() method:', error);
    throw error; // Rethrow the error so consumers know something went wrong
  }
}

export { createConnection };
