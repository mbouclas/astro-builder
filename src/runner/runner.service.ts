import { Injectable } from '@nestjs/common';
import { Job, UnrecoverableError } from "bullmq";
import { QueueService } from "../queue/queue.service";
import { ClientService, IClientModel } from "~client/client.service";
import { SharedModule } from "~shared/shared.module";
const spawn = require('cross-spawn');

@Injectable()
export class RunnerService {
  constructor(

  ) {
  }
  async onModuleInit() {
    QueueService.addWorker(this.worker, QueueService.queueName);

/*      setTimeout(() => {
         QueueService.queue.add('test', { name: 'test' }, {
          removeOnComplete: true,
        }).then((job) => {
          console.log(job)
        });

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

  /**
   * @param job
   */
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
      // console.error(`Error executing job ${job.id} with error ${e.message}`);
      throw new UnrecoverableError('Unrecoverable');
    }

  }

  async execute(job: Job, client: IClientModel, verbose = false) {
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

        SharedModule.logger.error(data.toString());
        reject(data.toString());
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

  async runOnce(name: string) {
    const queue = new QueueService();


    const clientService = new ClientService(SharedModule.redis);
    const client = await clientService.findOne({ name: name });

    if (!client) {
      throw new Error(`Client ${name} not found`);
    }

    // Push for immediate execution
    try {
      const res = await queue.addJob(`${QueueService.immediateExecutionJobName}:${name}`, client, false);
      return {success: true, job: res};
    }
    catch (e) {
      throw new Error(`Error adding job with error ${e.message}`);
    }


  }

  async getStatus(id: string) {
    const queue = new QueueService();

    return await queue.getJobStatus(id);
  }

  async getHistory(name: string) {
    const queue = new QueueService();

    const results = await queue.getJobs(['completed', 'failed']);
    return results.filter((job) => {
      return job.name === `${QueueService.immediateExecutionJobName}:${name}`;
    });
  }
}
