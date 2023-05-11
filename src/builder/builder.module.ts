import { Logger, Module } from "@nestjs/common";
import { BuilderController } from './builderController';
import { SharedModule } from "~shared/shared.module";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";

@Module({
  imports: [
    SharedModule,
  ],
  controllers: [BuilderController]
})
export class BuilderModule {
  static eventEmitter: EventEmitter2;
  static moduleRef: ModuleRef;
  protected readonly logger = new Logger(BuilderModule.name);

  constructor(
    private m: ModuleRef,
    private eventEmitter: EventEmitter2,
  ) {
    BuilderModule.eventEmitter = eventEmitter;
  }

  onModuleInit() {
    BuilderModule.moduleRef = this.m;
    this.logger.log('BuilderModule initialized');
  }
}
