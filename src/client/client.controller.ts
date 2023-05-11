import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { clientDto, ClientService } from "./client.service";




@Controller('api/client')
export class ClientController {
  constructor(
    private service: ClientService,
  ) {
  }
  @Get()
  async find() {

  }

  @Get(':name')
  async findOne(@Param('name') id: string) {

  }

  @Post()
  async store(@Body() data: clientDto) {
    return await this.service.add(data);
  }

  @Post(':name/activate')
  async activate(@Param('name') name: string) {

    try {
      return await this.service.activate(name);
    }
    catch (e) {
      return {success: false, error: e.message};
    }
  }

  @Delete(':name/deactivate')
  async deactivate(@Param('name') name: string) {
    try {
      return await this.service.deactivate(name);
    }
    catch (e) {
      return {success: false, error: e.message};
    }

  }

  @Put(':name')
  async update() {

  }

  @Delete(':name')
  async delete() {

  }
}
