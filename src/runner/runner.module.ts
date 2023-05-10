import { Logger, Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";
import { QueueModule } from "../queue/queue.module";
import { RunnerService } from './runner.service';

@Module({
  imports: [
    SharedModule,
    QueueModule,
  ],
  providers: [RunnerService],
})
export class RunnerModule {
  static eventEmitter: EventEmitter2;
  static moduleRef: ModuleRef;
  protected readonly logger = new Logger(RunnerModule.name);

  constructor(
    private m: ModuleRef,
    private eventEmitter: EventEmitter2,
  ) {
    RunnerModule.eventEmitter = eventEmitter;
  }

  onModuleInit() {
    RunnerModule.moduleRef = this.m;
    this.logger.log('RunnerModule initialized');
  }
}
