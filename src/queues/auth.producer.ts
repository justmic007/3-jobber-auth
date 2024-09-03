// This Producer sends messages ONLY to UUsers and Notification service. See diagram in `README`

import { config } from '@auth/config';
import { winstonLogger } from '@justmic007/9-jobber-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@auth/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');

export async function publishDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void>{
  try {
    if(!channel) {
      channel = await createConnection() as Channel
    }
    await channel.assertExchange(exchangeName, 'direct')
    channel.publish(exchangeName, routingKey, Buffer.from(message))
    log.info(logMessage)
  } catch (error) {
    log.log('error', 'AuthService Producer publishDrirectMessages() method error:', error)
  }
}
