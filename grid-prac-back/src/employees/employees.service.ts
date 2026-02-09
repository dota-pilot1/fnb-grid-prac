import { Injectable, NotFoundException } from '@nestjs/common';
import type { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  private employees: Employee[] = [
    { id: 1, name: '홍길동', age: 30, position: '개발자' },
    { id: 2, name: '김철수', age: 25, position: '디자이너' },
    { id: 3, name: '이영희', age: 28, position: '기획자' },
    { id: 4, name: '박민수', age: 35, position: '매니저' },
    { id: 5, name: '최지은', age: 27, position: '개발자' },
  ];

  private nextId = 6;

  findAll(): Employee[] {
    return this.employees;
  }

  findOne(id: number): Employee {
    const employee = this.employees.find((e) => e.id === id);
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  create(data: Omit<Employee, 'id'>): Employee {
    const employee: Employee = { id: this.nextId++, ...data };
    this.employees.push(employee);
    return employee;
  }

  update(id: number, data: Partial<Employee>): Employee {
    const employee = this.findOne(id);
    Object.assign(employee, data);
    return employee;
  }

  remove(id: number): void {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundException(`Employee #${id} not found`);
    this.employees.splice(index, 1);
  }

  batch(payload: {
    created: Omit<Employee, 'id'>[];
    updated: Employee[];
    deletedIds: number[];
  }) {
    // 1) 삭제
    for (const id of payload.deletedIds) {
      const index = this.employees.findIndex((e) => e.id === id);
      if (index !== -1) this.employees.splice(index, 1);
    }

    // 2) 수정
    for (const data of payload.updated) {
      const employee = this.employees.find((e) => e.id === data.id);
      if (employee) Object.assign(employee, data);
    }

    // 3) 추가 (서버에서 ID 채번)
    const createdRows: Employee[] = [];
    for (const data of payload.created) {
      const employee: Employee = { id: this.nextId++, ...data };
      this.employees.push(employee);
      createdRows.push(employee);
    }

    return {
      created: createdRows,
      updatedCount: payload.updated.length,
      deletedCount: payload.deletedIds.length,
      total: this.employees.length,
    };
  }
}
