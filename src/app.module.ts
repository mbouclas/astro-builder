import { Logger, MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunnerModule } from "~runner/runner.module";
import { BuilderModule } from '~root/builder/builder.module';
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { SharedModule } from "~shared/shared.module";

import { ClientModule } from "~client/client.module";
import { QueueModule } from "~queue/queue.module";
import { AuthorizeMiddleware } from "~root/middleware/authorize-middleware.middleware";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      verboseMemoryLeak: true,
    }),
    RunnerModule,
    BuilderModule,
    SharedModule,
    QueueModule,
    ClientModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private eventEmitter: EventEmitter2) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizeMiddleware)
      .forRoutes({path: 'api*', method: RequestMethod.ALL});
  }

  async onApplicationBootstrap() {
    this.eventEmitter.emit('app.loaded', { success: true });
  }

  async onModuleInit() {
    this.logger.log('AppModule initialized');
  }
}
