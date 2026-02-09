import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import type { Employee } from './employee.entity';

@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(): Employee[] {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Employee {
    return this.employeesService.findOne(id);
  }

  @Post()
  create(@Body() data: Omit<Employee, 'id'>): Employee {
    return this.employeesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Employee>,
  ): Employee {
    return this.employeesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): void {
    return this.employeesService.remove(id);
  }

  @Post('batch')
  batch(
    @Body()
    payload: {
      created: Omit<Employee, 'id'>[];
      updated: Employee[];
      deletedIds: number[];
    },
  ) {
    return this.employeesService.batch(payload);
  }
}
