import { Inject, Injectable } from "@nestjs/common";
import { EntityData, Repository, Schema } from "redis-om";
import {RedisClientType} from "redis";
import { SharedModule } from "../shared/shared.module";
import { IGenericObject } from "../models/general";
import { extractSingleFilterFromObject } from "../helpers/models";

export interface IClientModel extends EntityData {
  name: string;
  slug: string;
  url: string;
  path: string;
  command: string;
  createdAt: Date;
}

@Injectable()
export class ClientService {
  public schema: Schema;

  constructor(
    @Inject('REDIS') protected redis: RedisClientType,
  ) {
    this.schema = new Schema('client', {
      name: { type: 'string' },
      slug: { type: 'text' },
      url: { type: 'text' },
      path: { type: 'text' },
      command: { type: 'text' },
      createdAt: { type: 'date' }
    });
  }
  async onModuleInit() {
    const s = new ClientService(SharedModule.redis);


    await s.add({
      "name": "test",
      "slug": "test",
      "url": "test",
      "path": "I:\\Work\\BusinessLink\\sites\\eshop-front-test",
      "command": "npm run build:local",
      "createdAt": new Date()
    });
  }

  getSchema() {
    return this.schema;
  }

  async setModel() {

    const repo = new Repository(this.schema, this.redis);
    await repo.createIndex();
    return repo;
  }

  async add(client: IClientModel) {
    const repo = await this.setModel();
    const found = await this.findOne({ name: client.name });

    if (found) {
      console.log(`Client ${client.name} already exists`, found.name);
      return ;
    }

    try {
      const res = await repo.save(client);

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
}
