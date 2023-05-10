import { Logger, Module } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RunnerModule } from './runner/runner.module';
import { ReceiverModule } from './receiver/receiver.module';
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { SharedModule } from './shared/shared.module';
import { QueueModule } from './queue/queue.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      verboseMemoryLeak: true,
    }),
    RunnerModule,
    ReceiverModule,
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

  async onApplicationBootstrap() {
    this.eventEmitter.emit('app.loaded', { success: true });
  }

  async onModuleInit() {
    this.logger.log('AppModule initialized');
  }
}
