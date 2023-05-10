import { Inject, Logger, Module, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { HttpModule } from "@nestjs/axios";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";
const redisProvider =         {
  provide: 'REDIS',
  useFactory: async () => {
    const connection = await createClient({
      url: process.env.REDIS_URL
    });
    await connection.connect();
    SharedModule.logger.log('Redis Client Connected');
    connection.on('error', err => console.log('Redis Client Error', err));
    return connection;
  }
};

@Module({
  providers: [
    redisProvider,
  ],
  imports: [
    HttpModule,
  ],
  exports: [
    redisProvider,
    HttpModule,
  ],
})
export class SharedModule  implements OnModuleInit {
  static eventEmitter: EventEmitter2;
  static moduleRef: ModuleRef;
  protected readonly logger = new Logger(SharedModule.name);
  public static readonly logger = new Logger(SharedModule.name);
  public static redis: RedisClientType;
  constructor(
    private m: ModuleRef,
    private eventEmitter: EventEmitter2,
    @Inject('REDIS') protected redis: RedisClientType,
  ) {
    SharedModule.eventEmitter = eventEmitter;
    SharedModule.redis = redis;
  }

  onModuleInit(): any {
    SharedModule.moduleRef = this.m;
    this.logger.log('AppModule initialized');
  }

  static getService(service: any) {
    return SharedModule.moduleRef.get(service);
  }
}
