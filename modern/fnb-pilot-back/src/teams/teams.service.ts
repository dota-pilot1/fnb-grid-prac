import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type DrizzleDB } from '../db/db.module';
import { teams, employees } from '../db/schema';

@Injectable()
export class TeamsService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  findAll() {
    return this.db.select().from(teams).all();
  }

  findMembers(teamId: number) {
    return this.db
      .select()
      .from(employees)
      .where(eq(employees.teamId, teamId))
      .all();
  }
}
