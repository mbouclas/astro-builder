import { Injectable, Logger } from "@nestjs/common";
import { Job, JobType, Processor, Queue, QueueEvents, Worker } from "bullmq";
import { redisConnectionInfo } from "~helpers/redis";


@Injectable()
export class QueueService {
  private static readonly logger = new Logger(QueueService.name);
  public static jobEventName = "process:";
  public static immediateExecutionJobName = 'execute:';
  public static queueName = process.env.ENV === 'production' ? 'processQueue' : 'processQueueDev';
  public static queue: Queue;
  public static queueEvents: QueueEvents;
  protected static workers: Worker[] = [];
  protected static redisConnection = redisConnectionInfo();

  async onModuleInit() {
    QueueService.queue = new Queue(QueueService.queueName, {
      connection: QueueService.redisConnection
    });

    QueueService.queueEvents = new QueueEvents(QueueService.queueName, {
      connection: QueueService.redisConnection
    });
    QueueService.queueEvents.on('completed', (jobId) => QueueService.logger.log(`${QueueService.queueName}: ${jobId}  completed`));
    QueueService.queueEvents.on('failed', (jobId) => QueueService.onFailedJob);
    QueueService.queueEvents.on('error', (error) => QueueService.logger.error(error));
    QueueService.queue.on('waiting', (job) => QueueService.logger.log(`${QueueService.queueName}: ${job.id}  now waiting`));
  }


  public static onFailedJob(job: Job) {
    console.log('Job failed', job.id, job.name, job.data);
  }

  public static addWorker(worker: Processor, queueName) {

    const w = new Worker(queueName, worker, {
      connection: QueueService.redisConnection,
      concurrency: 3,
      autorun: true,
    });

    w.on('completed', (job) => {
      QueueService.logger.log(`Job ${job.id} has been completed`);
      console.log(`From AddWorker Event: Job ${job.id} has been completed`);
    });

    w.on('failed', (job, err) => {
      QueueService.logger.error(`Job ${job.id} has failed with error ${err}`);
      console.log(`From AddWorker Event: Job ${job.id} has failed with error`, err);
    });

    w.on('error', err => {
      // log the error
      console.error(`From AddWorker Event: Error: ${err.message} `, err)
    });


    QueueService.workers.push(w);

    return this;
  }

  public async getJobs(statuses: JobType[] = ['active', 'waiting', 'delayed', 'completed', 'failed']) {
    return await QueueService.queue.getJobs(statuses);
  }

  async removeAllJobs() {
    const jobs = await QueueService.queue.getRepeatableJobs();
    try {
      for (const job of jobs) {
        await QueueService.queue.removeRepeatableByKey(job.key);
      }

      return {success: true};
    }
    catch (e) {
      return {success: false, error: e.message};
    }

  }

  public async getJob(jobName: string, statuses?: JobType[]) {
    const jobs = await this.getJobs(statuses);
    return jobs.find(j => j.name === jobName);
  }

  public async addJob(name: string, payload: any, removeOnCompleted = true) {
    const job = await this.getJob(name, ['active', 'waiting', 'delayed']);
    if (job) {
      throw new Error(`Job ${name} already exists`);
    }

    const removeOnComplete = (removeOnCompleted) ? {count: 20} : false;
    return await QueueService.queue.add(name, payload, {
      removeOnComplete,
      attempts: 2,

    })
  }

  public async addRepeatableJob(jobName: string, payload: any, repeatEveryHours: number|string) {
    const job = await this.findRepeatableJob(jobName);
    if (job) {
      throw new Error(`Job ${jobName} already exists`);
    }

    const repeat = {};
    if (typeof repeatEveryHours === 'number') {
      repeat['every'] = repeatEveryHours*60*60*1000;
    }

    if (typeof repeatEveryHours === 'string') {
      repeat['pattern'] = repeatEveryHours;
    }

    return await QueueService.queue.add(jobName, payload, {
      removeOnComplete: true,
      repeat
    });
  }

  public async getRepeatableJobs() {
    return await QueueService.queue.getRepeatableJobs();
  }

  public async findRepeatableJob(jobName: string) {
    const parts = jobName.split(":");
    const name = parts[0];
    const id = parts[1];
    const jobs = await this.getRepeatableJobs();

    return jobs.find(j => j.name === name && j.id === id);
  }

  public async removeRepeatable(jobName: string) {
    const job = await this.findRepeatableJob(jobName);

    return  await QueueService.queue.removeRepeatableByKey(job.key);
  }
  async getJobStatus(id: string) {
    const job = await QueueService.queue.getJob(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    return await job.getState();
  }
}
