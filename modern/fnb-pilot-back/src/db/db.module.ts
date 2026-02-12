import { Module, Global, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { employees, teams } from './schema';

export const DB = Symbol('DB');

const sqlite = new Database('data.db');
sqlite.pragma('journal_mode = WAL');

// 테이블 생성 (없으면)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    position TEXT NOT NULL,
    team_id INTEGER
  )
`);

// employees 테이블에 team_id 컬럼이 없으면 추가 (기존 DB 마이그레이션)
try {
  sqlite.exec(`ALTER TABLE employees ADD COLUMN team_id INTEGER`);
  Logger.log('employees 테이블에 team_id 컬럼 추가', 'DbModule');
} catch {
  // 이미 존재하면 무시
}

const db = drizzle(sqlite, { schema });

// 시드 데이터: 테이블이 비어있을 때만 1,000건 삽입
const count = db.select().from(employees).all().length;
if (count === 0) {
  const lastNames = [
    '김',
    '이',
    '박',
    '최',
    '정',
    '강',
    '조',
    '윤',
    '장',
    '임',
  ];
  const firstNames = [
    '민수',
    '지은',
    '서연',
    '도윤',
    '하준',
    '수빈',
    '예준',
    '지호',
    '채원',
    '현우',
  ];
  const positions = [
    '개발자',
    '디자이너',
    '기획자',
    '매니저',
    '마케터',
    '영업',
    'QA',
    '데이터분석가',
    'DevOps',
    '인턴',
  ];

  const seedData = Array.from({ length: 1000 }, (_, i) => ({
    name:
      lastNames[i % lastNames.length] +
      firstNames[Math.floor(i / lastNames.length) % firstNames.length],
    age: 22 + (i % 30),
    position: positions[i % positions.length],
  }));

  // SQLite 한 번에 너무 많이 insert 하면 변수 제한에 걸리므로 100건씩 나눠서 삽입
  for (let i = 0; i < seedData.length; i += 100) {
    db.insert(employees)
      .values(seedData.slice(i, i + 100))
      .run();
  }
  Logger.log(`시드 데이터 ${seedData.length}건 삽입 완료`, 'DbModule');
}

// 팀 시드 데이터
const teamCount = db.select().from(teams).all().length;
if (teamCount === 0) {
  const teamData = [
    { name: '개발팀', description: '서비스 개발 및 유지보수' },
    { name: '디자인팀', description: 'UI/UX 디자인' },
    { name: '기획팀', description: '서비스 기획 및 요구사항 분석' },
    { name: '영업팀', description: '고객 영업 및 계약 관리' },
    { name: 'QA팀', description: '품질 보증 및 테스트' },
  ];
  db.insert(teams).values(teamData).run();
  Logger.log(`팀 시드 데이터 ${teamData.length}건 삽입 완료`, 'DbModule');

  // 기존 employees에 팀 배정 (position 기준으로 매핑)
  const teamMap: Record<string, number> = {
    개발자: 1,
    DevOps: 1,
    디자이너: 2,
    기획자: 3,
    데이터분석가: 3,
    매니저: 4,
    마케터: 4,
    영업: 4,
    QA: 5,
    인턴: 5,
  };
  for (const [position, teamId] of Object.entries(teamMap)) {
    sqlite.exec(
      `UPDATE employees SET team_id = ${teamId} WHERE position = '${position}' AND team_id IS NULL`,
    );
  }
  Logger.log('employees에 팀 배정 완료', 'DbModule');
}

export type DrizzleDB = typeof db;

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useValue: db,
    },
  ],
  exports: [DB],
})
export class DbModule {}
