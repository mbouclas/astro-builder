import { Injectable } from '@nestjs/common';
import { Job } from "bullmq";
import { QueueService } from "../queue/queue.service";
import { ClientService, IClientModel } from "../client/client.service";
import { SharedModule } from "../shared/shared.module";
const spawn = require('cross-spawn');

@Injectable()
export class RunnerService {
  constructor(

  ) {
  }
  async onModuleInit() {
    QueueService.addWorker(this.worker, QueueService.queueName);

/*      setTimeout(() => {
        QueueService.queue.add(QueueService.jobEventName, { name: 'test' }, {
          removeOnComplete: true,
        })
      }, 500)*/
/*    setTimeout(() => {
      QueueService.queue.add(QueueService.jobEventName, { test: 'test' }, {
        removeOnComplete: true,
        repeat: {
          every: 1000
        }
      });
    }, 500);*/

  }

  async worker(job: Job) {
    const clientService = new ClientService(SharedModule.redis);

    const client = await clientService.findOne({ name: job.data.name });

    if (!client) {
      throw new Error(`Client ${job.data.name} not found`);
    }

    try {
      await (new RunnerService).execute(job, client, true);
    }
    catch (e) {
      console.error(`Error executing job ${job.id} with error ${e.message}`);
    }

    // run the command
    // console.log('job', job.id, job.data, client);
  }

  async execute(job: Job, client: IClientModel, verbose = false) {
    console.log(client)
    const parts = client.command.split(" ");
    const options = parts.slice(1);
    const command = parts[0];
    process.chdir(client.path);
    const build = spawn(command, options);

    return new Promise((resolve, reject) => {
      build.stdout.on("data", data => {

        if (verbose) {
          console.log(data.toString());
        }
      });

      build.stderr.on("data", data => {

        if (verbose) {
          console.log(data.toString());
        }
      });

      build.on("close", code => {
        //emit on end event
        if (code !== 0) {
          reject(code);
        }
/*        if (job) {
          this.eventEmitter.emit(AstroBuilderService.onExecutionSuccessEvent, job);
        }*/

        SharedModule.logger.log(`${job && `Job ${job.id}`} Build Complete`);
        resolve(code);
      });

    });

  }
}
