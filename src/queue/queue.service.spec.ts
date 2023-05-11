import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueService],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //tests for addJob
  it('should add a job to the queue', async () => {
    const job = await service.addJob('test', { test: 'test' });
    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.name).toBe('test');
    expect(job.data).toEqual({ test: 'test' });
  });

  //test addRepeatableJob
  it('should add a repeatable job to the queue', async () => {
    const job = await service.addRepeatableJob('test', { test: 'test' }, 1);
    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.name).toBe('test');
    expect(job.data).toEqual({ test: 'test' });
  });

  //test findJob
  it('should find a job in the queue', async () => {
    const job = await service.addJob('test', { test: 'test' });
    const foundJob = await service.getJob(job.id);
    expect(foundJob).toBeDefined();
    expect(foundJob.id).toBe(job.id);
  })
});
