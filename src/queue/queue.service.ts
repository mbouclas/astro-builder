import { Injectable, Logger } from "@nestjs/common";
import { Processor, Queue, Worker } from "bullmq";
import { redisConnectionInfo } from "../helpers/redis";

@Injectable()
export class QueueService {
  private static readonly logger = new Logger(QueueService.name);
  public static jobEventName = "process:incoming";
  public static queueName = 'processQueue';
  public static queue: Queue;
  protected static workers: Worker[] = [];
  protected static redisConnection = redisConnectionInfo();

  async onModuleInit() {
    QueueService.queue = new Queue(QueueService.queueName, {
      connection: QueueService.redisConnection
    });



    QueueService.queue.on('waiting', (job) => QueueService.logger.log(`${QueueService.queueName}: ${job.id}  now waiting`));
  }

  public static addWorker(worker: Processor, queueName) {

    const w = new Worker(queueName, worker, {
      connection: QueueService.redisConnection,
      concurrency: 3
    });

    QueueService.workers.push(w);

    return this;
  }
}
