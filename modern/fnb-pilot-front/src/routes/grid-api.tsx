import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:3000/api/employees";

interface Employee {
  id: number;
  name: string;
  age: number;
  position: string;
}

let tempId = -1;

function GridApiPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // 변경분 추적
  const addedRows = useRef<Set<number>>(new Set()); // 신규 행 (임시 ID)
  const modifiedRows = useRef<Map<number, Employee>>(new Map()); // 수정된 행
  const deletedIds = useRef<Set<number>>(new Set()); // 삭제된 행 (서버 ID)

  const addLog = (msg: string) => {
    setLog((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20),
    );
  };

  useEffect(() => {
    if (!tableRef.current) return;

    const table = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      columns: [
        { title: "ID", field: "id", width: 80, hozAlign: "center" },
        { title: "이름", field: "name", editor: "input" },
        { title: "나이", field: "age", editor: "number", hozAlign: "center" },
        {
          title: "직책",
          field: "position",
          editor: "list",
          editorParams: { values: ["개발자", "디자이너", "기획자", "매니저"] },
        },
        {
          title: "삭제",
          formatter: "buttonCross",
          width: 80,
          hozAlign: "center",
          headerSort: false,
          cellClick: (_e: Event, cell: Tabulator.CellComponent) => {
            const id = cell.getRow().getData().id;

            if (addedRows.current.has(id)) {
              // 신규 행 삭제 → 추적에서 제거만 하면 됨
              addedRows.current.delete(id);
            } else {
              // 기존 행 삭제 → 삭제 목록에 추가
              deletedIds.current.add(id);
              modifiedRows.current.delete(id);
            }

            cell.getRow().delete();
            addLog(`행 삭제 id:${id}`);
          },
        },
      ],
    });

    // 셀 편집 완료 → 변경 추적
    table.on("cellEdited", (cell) => {
      const rowData = cell.getRow().getData() as Employee;
      const id = rowData.id;

      if (addedRows.current.has(id)) {
        // 신규 행 편집 → 이미 추적 중이므로 별도 처리 불필요
      } else {
        // 기존 행 편집 → 수정 목록에 추가
        modifiedRows.current.set(id, rowData);
      }

      addLog(
        `편집 id:${id} ${cell.getField()}: ${cell.getOldValue()} → ${cell.getValue()}`,
      );
    });

    tabulatorRef.current = table;

    // 초기 데이터 로드
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        table.setData(data);
        addLog(`GET → ${data.length}건 로드`);
      });

    return () => {
      table.destroy();
    };
  }, []);

  // 행 추가 (프론트에서만)
  const handleAdd = () => {
    const id = tempId--;
    tabulatorRef.current?.addRow(
      { id, name: "", age: 0, position: "개발자" },
      false,
    );
    addedRows.current.add(id);
    addLog(`행 추가 (임시 id:${id})`);
  };

  // 저장: 변경분을 모아서 한 번에 서버 전송 (batch)
  const handleSave = async () => {
    // 1) 신규 행 데이터 수집 (임시 ID 제거)
    const created: Omit<Employee, "id">[] = [];

    // 추가된 행에 해당하는것들만 모아서 created 배열에 추가
    for (const id of addedRows.current) {
      const row = tabulatorRef.current
        ?.getRows()
        .find((r) => r.getData().id === id);
      if (!row) continue;
      const { id: _tempId, ...data } = row.getData();
      created.push(data);
    }

    // 2) 수정된 행 데이터 수집
    // 수정된 행의 벨류만 가져와서 다시 배열로
    const updated = Array.from(modifiedRows.current.values());

    // 3) 삭제된 행 ID 수집
    // 삭제된 행의 아이디들을 배열로
    const deletedIdList = Array.from(deletedIds.current);

    // 변경사항 없으면 리턴
    if (
      created.length === 0 &&
      updated.length === 0 &&
      deletedIdList.length === 0
    ) {
      addLog("변경사항 없음");
      return;
    }

    // 4) 한 번에 전송
    const res = await fetch(`${API_URL}/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        created,
        updated,
        deletedIds: deletedIdList,
      }),
    });
    const result = await res.json();

    // 5) 서버 응답 후 테이블 새로고침 (정식 ID 반영)
    const reloadRes = await fetch(API_URL);
    const freshData = await reloadRes.json();
    tabulatorRef.current?.setData(freshData);

    // 6) 추적 초기화
    addedRows.current.clear();
    modifiedRows.current.clear();
    deletedIds.current.clear();

    addLog(
      `저장 완료 → 추가:${result.created.length}건, 수정:${result.updatedCount}건, 삭제:${result.deletedCount}건`,
    );
  };

  // 새로고침: 서버 데이터로 리셋
  const handleReload = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    tabulatorRef.current?.setData(data);
    addedRows.current.clear();
    modifiedRows.current.clear();
    deletedIds.current.clear();
    addLog(`GET → ${data.length}건 새로고침 (편집 내용 초기화)`);
  };

  return (
    <div>
      <h1>API 연동 (CRUD)</h1>
      <p>추가/편집/삭제 → [저장]으로 변경분만 서버 반영 (POST/PUT/DELETE)</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleAdd}>행 추가</button>
        <button
          onClick={handleSave}
          style={{ background: "#4CAF50", color: "#fff", border: "none" }}
        >
          저장
        </button>
        <button onClick={handleReload}>새로고침</button>
      </div>
      <div ref={tableRef} />
      {log.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>로그</h3>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "13px",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            {log.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/grid-api")({
  component: GridApiPage,
});
