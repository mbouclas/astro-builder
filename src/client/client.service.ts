import { Inject, Injectable } from "@nestjs/common";
import { EntityData, Repository, Schema } from "redis-om";
import {RedisClientType} from "redis";
import { SharedModule } from "../shared/shared.module";
import { IGenericObject } from "../models/general";
import { extractSingleFilterFromObject } from "../helpers/models";
import { IsNotEmpty } from "class-validator";
import { QueueService } from "~root/queue/queue.service";
import { AppStateActions } from "~root/state";
import { RunnerService } from "~runner/runner.service";
const slugify = require('slug');
export interface IClientModel extends EntityData {
  name: string;
  slug?: string;
  url: string;
  path: string;
  command: string;
  authKey: string;
  repeat?: number|string;
  createdAt?: Date;
}

export class clientDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  command: string;

  @IsNotEmpty()
  authKey: string;

  repeat: number;
  pattern: string;// cron pattern

}

@Injectable()
export class ClientService {
  public schema: Schema;

  constructor(
    @Inject('REDIS') protected redis: RedisClientType,
  ) {
    this.schema = new Schema('client', {
      name: { type: 'string' },//searchable
      slug: { type: 'string' },//searchable
      authKey: { type: 'string' },//searchable
      url: { type: 'text' },//NOT searchable
      path: { type: 'text' },
      command: { type: 'text' },
      repeat: { type: 'number' },
      pattern: { type: 'text' },// cron pattern
      createdAt: { type: 'date' }
    });
  }
  async onModuleInit() {
    const s = new ClientService(SharedModule.redis);
    AppStateActions.setClients(await s.all());

/*    await s.add({
      "name": "test",
      "slug": "test",
      "url": "test",
      "path": "I:\\Work\\BusinessLink\\sites\\eshop-front-test",
      "command": "npm run build:local",
      "createdAt": new Date()
    });*/
  }

  getSchema() {
    return this.schema;
  }

  async setModel() {

    const repo = new Repository(this.schema, this.redis);
    await repo.createIndex();
    return repo;
  }

  async all() {
    const repo = await this.setModel();
    return await repo.search().return.all() as unknown as IClientModel[];
  }

  async add(client: clientDto) {
    const repo = await this.setModel();
    const found = await this.findOne({ name: client.name });

    if (found) {
      console.log(`Client ${client.name} already exists`, found.name);
      return ;
    }

    const toAdd: IClientModel = {
      ...client,
      ...{
        slug: slugify(client.name, { lower: true }),
        createdAt: new Date()
      }
    };


    try {
      const res = await repo.save(toAdd);

      console.log(`Client ${client.name} added with id ${res.id}`);

      return res;
    }
    catch (e) {
      console.log(`Error adding client ${client.name} with error ${e.message}`);
    }
  }

  async findOne(filter: IGenericObject): Promise<IClientModel> {
    const {key, value} = extractSingleFilterFromObject(filter);
    const repo = await this.setModel();
    return await repo
      .search()
      .where(key)
      .equals(value)
      .return
      .first() as unknown as IClientModel;
  }

  async find(filter: IGenericObject) : Promise<IClientModel[]> {
    const {key, value} = extractSingleFilterFromObject(filter);
    const repo = await this.setModel();
    return await repo
      .search()
      .where(key)
      .equals(value)
      .return
      .all() as unknown as IClientModel[];
  }

  async activate(name: string) {
    const slug = slugify(name, { lower: true });
    const client = await this.findOne({ slug });

    if (!client) {
      throw new Error(`Client ${name} not found`);
    }

    const queue = new QueueService();
    return await queue.addRepeatableJob(`${QueueService.jobEventName}${slug}`, {client}, client.repeat);
  }

  async deactivate(name: string) {
    const slug = slugify(name, { lower: true });
    const client = await this.findOne({ slug });

    if (!client) {
      throw new Error(`Client ${name} not found`);
    }

    const queue = new QueueService();

    return await queue.removeRepeatable(`${QueueService.jobEventName}${slug}`);
  }
}
