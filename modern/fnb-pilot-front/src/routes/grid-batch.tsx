import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useCallback, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:3000/api/employees";

type Row = { id: number; name: string; age: number; position: string };

let tempIdSeq = -1; // 새 행에 부여할 임시 ID (음수)

function GridBatchPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  // 변경 추적
  const createdRef = useRef<Map<number, Row>>(new Map());
  const updatedRef = useRef<Map<number, Row>>(new Map());
  const deletedRef = useRef<Set<number>>(new Set());

  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = useCallback(() => {
    const changed =
      createdRef.current.size > 0 ||
      updatedRef.current.size > 0 ||
      deletedRef.current.size > 0;
    setHasChanges(changed);
  }, []);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      paginationSizeSelector: [10, 20, 50, 100],
      sortMode: "remote",
      filterMode: "remote",
      ajaxURL: API_URL,
      ajaxRequestFunc: (url, _config, params) => {
        const query = new URLSearchParams();
        query.set("page", String(params.page || 1));
        query.set("size", String(params.size || 20));
        if (params.sorters && params.sorters.length > 0) {
          query.set("sort", params.sorters[0].field);
          query.set("dir", params.sorters[0].dir);
        }
        if (params.filters && params.filters.length > 0) {
          const filters = params.filters.map(
            (f: { field: string; value: string }) => ({
              field: f.field,
              value: f.value,
            }),
          );
          query.set("filter", JSON.stringify(filters));
        }
        return fetch(`${url}?${query.toString()}`).then((res) => res.json());
      },
      index: "id",
      selectableRows: true,
      columns: [
        {
          formatter: "rowSelection",
          titleFormatter: "rowSelection",
          width: 40,
          hozAlign: "center",
          headerSort: false,
          cellClick: (_e, cell) => {
            cell.getRow().toggleSelect();
          },
        },
        {
          title: "ID",
          field: "id",
          width: 80,
          hozAlign: "center",
          headerSort: true,
          formatter: (cell) => {
            const v = cell.getValue();
            return v < 0 ? '<span style="color:#999">NEW</span>' : v;
          },
        },
        {
          title: "이름",
          field: "name",
          headerSort: true,
          editor: "input" as const,
        },
        {
          title: "나이",
          field: "age",
          hozAlign: "center",
          headerSort: true,
          editor: "number" as const,
          editorParams: { min: 1, max: 120 },
        },
        {
          title: "직책",
          field: "position",
          headerSort: true,
          editor: "input" as const,
        },
      ],
    });

    // 셀 편집 시 변경 추적
    table.on("cellEdited", (cell) => {
      const data = cell.getRow().getData() as Row;
      const el = cell.getRow().getElement();

      if (data.id < 0) {
        // 새로 추가된 행 → created에서 갱신
        createdRef.current.set(data.id, data);
        el.style.background = "#e3f2fd"; // 파란 유지
      } else {
        // 기존 행 수정
        updatedRef.current.set(data.id, data);
        el.style.background = "#fff8e1"; // 노란색
      }
      markChanged();
    });

    tabulatorRef.current = table;

    return () => {
      table.destroy();
    };
  }, [markChanged]);

  // 행 추가
  const handleAdd = () => {
    const id = tempIdSeq--;
    const newRow: Row = { id, name: "", age: 20, position: "" };
    createdRef.current.set(id, newRow);
    tabulatorRef.current?.addRow(newRow, true);

    // 새 행 파란 배경
    setTimeout(() => {
      const row = tabulatorRef.current?.getRow(id);
      if (row) {
        row.getElement().style.background = "#e3f2fd";
      }
    }, 50);
    markChanged();
  };

  // 선택 행 삭제
  const handleDelete = () => {
    const selected = tabulatorRef.current?.getSelectedRows() || [];
    if (selected.length === 0) {
      alert("삭제할 행을 선택하세요.");
      return;
    }

    if (!confirm(`${selected.length}건을 삭제하시겠습니까?`)) return;

    for (const row of selected) {
      const data = row.getData() as Row;
      if (data.id < 0) {
        createdRef.current.delete(data.id);
      } else {
        deletedRef.current.add(data.id);
        updatedRef.current.delete(data.id);
      }
      row.delete();
    }
    markChanged();
  };

  // 일괄 저장
  const handleSave = async () => {
    const created = Array.from(createdRef.current.values()).map(
      ({ name, age, position }) => ({ name, age, position }),
    );
    const updated = Array.from(updatedRef.current.values());
    const deletedIds = Array.from(deletedRef.current);

    if (created.length === 0 && updated.length === 0 && deletedIds.length === 0) {
      alert("변경사항이 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ created, updated, deletedIds }),
      });
      const result = await res.json();

      alert(
        `저장 완료!\n추가: ${result.created?.length || 0}건\n수정: ${result.updatedCount || 0}건\n삭제: ${result.deletedCount || 0}건`,
      );

      createdRef.current.clear();
      updatedRef.current.clear();
      deletedRef.current.clear();
      markChanged();

      tabulatorRef.current?.setData(API_URL + "?page=1&size=20");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div>
      <h1>행 추가/삭제 + 일괄 저장</h1>
      <p>행을 추가/수정/삭제한 뒤, "일괄 저장" 버튼으로 한 번에 서버 반영</p>
      <p style={{ fontSize: "13px", color: "#888" }}>
        체크박스로 행 선택 → 삭제 · 셀 클릭하여 편집 · 파란색=새 행 · 노란색=수정됨
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleAdd}>행 추가</button>
        <button onClick={handleDelete}>선택 삭제</button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          style={{
            background: hasChanges ? "#4caf50" : "#ccc",
            color: "#fff",
            border: "none",
            padding: "6px 16px",
            borderRadius: "4px",
            cursor: hasChanges ? "pointer" : "default",
          }}
        >
          일괄 저장
          {hasChanges && (
            <span style={{ marginLeft: "6px", fontSize: "12px" }}>
              ({createdRef.current.size + updatedRef.current.size + deletedRef.current.size}건)
            </span>
          )}
        </button>
      </div>
      <div ref={tableRef} />
    </div>
  );
}

export const Route = createFileRoute("/grid-batch")({
  component: GridBatchPage,
});
