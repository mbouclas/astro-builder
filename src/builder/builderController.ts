import { Controller, Get, Post } from "@nestjs/common";

@Controller('api/build')
export class BuilderController {
  @Get(`:name`)
  async build() {
    return 'ok';
  }
}
