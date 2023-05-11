import { Controller, Get, Param, Query } from "@nestjs/common";
import { RunnerService } from "~runner/runner.service";

@Controller('api/run')
export class RunController {
  constructor(
    private service: RunnerService,
  ) {
  }
  @Get(':name')
  async run(@Param('name') name: string) {
    try {
      return await this.service.runOnce(name);
    }
    catch (e) {
      console.log(e)
      return {success: false, error: e.message};
    }
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string, @Query('type') type: string = 'immediate'){
    try {
      return {status: await this.service.getStatus(id)};
    }
    catch (e) {
      console.log(e)
      return {success: false, error: e.message};
    }
  }
}
