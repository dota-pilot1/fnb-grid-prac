import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import type { Employee } from './employee.entity';

@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('sort') sort?: string,
    @Query('dir') dir?: 'asc' | 'desc',
    @Query('name') name?: string,
    @Query('position') position?: string,
  ) {
    if (page) {
      const filter: { field: string; value: string }[] = [];
      if (name) filter.push({ field: 'name', value: name });
      if (position) filter.push({ field: 'position', value: position });
      return this.employeesService.findPaginated({
        page: parseInt(page, 10),
        size: parseInt(size || '20', 10),
        sort,
        dir,
        filter: filter.length > 0 ? filter : undefined,
      });
    }
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
