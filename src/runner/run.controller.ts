import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { RunnerService } from "~runner/runner.service";

@Controller("api/run")
export class RunController {
  constructor(
    private service: RunnerService
  ) {
  }

  @Get('jobs')
  async getJobs(@Param('client') client: string) {
    return await this.service.getJobs(client);
  }

  @Delete('jobs')
  async removeJobs() {
    return await this.service.removeAllJobs();
  }

  @Delete('jobs/:client')
  async removeJob(@Param('client') client: string) {
    return await this.service.removeJob(client);
  }

  @Get(":name")
  async run(@Param("name") name: string) {
    try {
      return await this.service.runOnce(name);
    } catch (e) {
      console.log(e);
      return { success: false, error: e.message };
    }
  }

  @Get(":id/status")
  async getStatus(@Param("id") id: string, @Query("type") type: string = "immediate") {
    try {
      return { status: await this.service.getStatus(id) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  @Get(":name/history")
  async getHistory(@Param("name") name: string) {
    try {
      const results = await this.service.getHistory(name);

      return results.map((job) => ({
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
      })).sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
    } catch (e) {
      console.log(e)
      return { success: false, error: e.message };
    }
  }


}
