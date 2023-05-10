import { Logger, Module } from "@nestjs/common";
import { ClientService } from './client.service';
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ModuleRef } from "@nestjs/core";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    SharedModule,
  ],
  providers: [ClientService]
})
export class ClientModule {
  static eventEmitter: EventEmitter2;
  static moduleRef: ModuleRef;
  protected readonly logger = new Logger(ClientModule.name);

  constructor(
    private m: ModuleRef,
    private eventEmitter: EventEmitter2,
  ) {
    ClientModule.eventEmitter = eventEmitter;
  }

  onModuleInit() {
    ClientModule.moduleRef = this.m;
    this.logger.log('ClientModule initialized');
  }
}
