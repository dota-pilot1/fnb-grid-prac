import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { EmployeesModule } from './employees/employees.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [DbModule, EmployeesModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
