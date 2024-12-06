// --- sample ----
// import { createClient } from 'redis';
// import { injectable } from 'tsyringe';
// import { LoggerService } from './logger';

// @injectable()
// export class RedisClient {
//     private client;
//     private logger: LoggerService;

//     constructor(logger: LoggerService) {
//         this.logger = logger;
//         this.client = createClient({
//             url: process.env.REDIS_URL || 'redis://localhost:6379',
//         });

//         this.client.on('error', (err) => this.logger.error('Redis Client Error', { err }));

//         this.client.connect()
//             .then(() => this.logger.info('Connected to Redis'))
//             .catch((err) => this.logger.error('Failed to connect to Redis', { err }));
//     }

//     async get(key: string): Promise<string | null> {
//         try {
//             return await this.client.get(key);
//         } catch (error) {
//             this.logger.error(`Redis GET failed for key: ${key}`, { error });
//             return null;
//         }
//     }

//     async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
//         try {
//             if (expirationSeconds) {
//                 await this.client.setEx(key, expirationSeconds, value);
//             } else {
//                 await this.client.set(key, value);
//             }
//         } catch (error) {
//             this.logger.error(`Redis SET failed for key: ${key}`, { error });
//         }
//     }

//     async del(key: string): Promise<void> {
//         try {
//             await this.client.del(key);
//         } catch (error) {
//             this.logger.error(`Redis DEL failed for key: ${key}`, { error });
//         }
//     }
// }
