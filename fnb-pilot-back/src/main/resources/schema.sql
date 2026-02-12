CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    position VARCHAR(50) NOT NULL,
    team_id BIGINT
);

-- 기존 employees 테이블에 team_id 컬럼이 없으면 추가
DO $$ BEGIN
    ALTER TABLE employees ADD COLUMN team_id BIGINT;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;
