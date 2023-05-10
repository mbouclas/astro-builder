import { Logger, Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";
import { QueueService } from './queue.service';

@Module({
  imports: [
    SharedModule
  ],
  providers: [
    QueueService
  ],
})
export class QueueModule {
  static eventEmitter: EventEmitter2;
  static moduleRef: ModuleRef;
  protected readonly logger = new Logger(QueueModule.name);

  constructor(
    private m: ModuleRef,
    private eventEmitter: EventEmitter2,
  ) {
    QueueModule.eventEmitter = eventEmitter;
  }

  onModuleInit() {
    QueueModule.moduleRef = this.m;
    this.logger.log('QueueModule initialized');
  }
}
