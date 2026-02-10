import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, like, asc, desc, sql, type SQL } from 'drizzle-orm';
import { DB, type DrizzleDB } from '../db/db.module';
import { employees } from '../db/schema';
import type { Employee, NewEmployee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  findAll(): Employee[] {
    return this.db.select().from(employees).all();
  }

  findPaginated(query: {
    page: number;
    size: number;
    sort?: string;
    dir?: 'asc' | 'desc';
    filter?: { field: string; value: string }[];
  }) {
    const { page, size, sort, dir = 'asc', filter } = query;

    // 유효한 컬럼명 맵
    const columnMap = {
      id: employees.id,
      name: employees.name,
      age: employees.age,
      position: employees.position,
    } as const;

    // WHERE 조건 생성
    const conditions: SQL[] = [];
    if (filter) {
      for (const f of filter) {
        const col = columnMap[f.field as keyof typeof columnMap];
        if (col) {
          conditions.push(like(col, `%${f.value}%`));
        }
      }
    }

    const where =
      conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

    // 정렬
    const sortCol = sort
      ? (columnMap[sort as keyof typeof columnMap] ?? employees.id)
      : employees.id;
    const orderBy = dir === 'desc' ? desc(sortCol) : asc(sortCol);

    // 총 건수
    const [{ total }] = this.db
      .select({ total: sql<number>`COUNT(*)` })
      .from(employees)
      .where(where)
      .all();

    // 데이터 조회
    const data = this.db
      .select()
      .from(employees)
      .where(where)
      .orderBy(orderBy)
      .limit(size)
      .offset((page - 1) * size)
      .all();

    return {
      last_page: Math.ceil(total / size),
      data,
    };
  }

  findOne(id: number): Employee {
    const employee = this.db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .get();
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return employee;
  }

  create(data: NewEmployee): Employee {
    return this.db.insert(employees).values(data).returning().get();
  }

  update(id: number, data: Partial<Employee>): Employee {
    const updated = this.db
      .update(employees)
      .set(data)
      .where(eq(employees.id, id))
      .returning()
      .get();
    if (!updated) throw new NotFoundException(`Employee #${id} not found`);
    return updated;
  }

  remove(id: number): void {
    const deleted = this.db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning()
      .get();
    if (!deleted) throw new NotFoundException(`Employee #${id} not found`);
  }

  batch(payload: {
    created: NewEmployee[];
    updated: Employee[];
    deletedIds: number[];
  }) {
    // 1) 삭제
    for (const id of payload.deletedIds) {
      this.db.delete(employees).where(eq(employees.id, id)).run();
    }

    // 2) 수정
    for (const data of payload.updated) {
      this.db
        .update(employees)
        .set(data)
        .where(eq(employees.id, data.id))
        .run();
    }

    // 3) 추가
    const createdRows: Employee[] = [];
    for (const data of payload.created) {
      const row = this.db.insert(employees).values(data).returning().get();
      createdRows.push(row);
    }

    const total = this.db.select().from(employees).all().length;

    return {
      created: createdRows,
      updatedCount: payload.updated.length,
      deletedCount: payload.deletedIds.length,
      total,
    };
  }
}
