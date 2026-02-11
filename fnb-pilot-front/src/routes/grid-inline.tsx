import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useCallback } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:8080/api/employees";

function GridInlinePage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const pendingRef = useRef<Set<number>>(new Set());
  const timerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // 변경된 행을 서버에 저장
  const saveRow = useCallback(
    async (row: { id: number; name: string; age: number; position: string }) => {
      try {
        await fetch(`${API_URL}/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: row.name, age: row.age, position: row.position }),
        });
        pendingRef.current.delete(row.id);
        // 저장 완료 시 행 배경 잠깐 초록으로 표시
        const tabulatorRow = tabulatorRef.current?.getRow(row.id);
        if (tabulatorRow) {
          const el = tabulatorRow.getElement();
          el.style.transition = "background 0.3s";
          el.style.background = "#e8f5e9";
          setTimeout(() => {
            el.style.background = "";
          }, 800);
        }
      } catch (err) {
        console.error("저장 실패:", err);
        // 실패 시 빨간 표시
        const tabulatorRow = tabulatorRef.current?.getRow(row.id);
        if (tabulatorRow) {
          const el = tabulatorRow.getElement();
          el.style.background = "#ffebee";
          setTimeout(() => {
            el.style.background = "";
          }, 1500);
        }
      }
    },
    [],
  );

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
      columns: [
        {
          title: "ID",
          field: "id",
          width: 80,
          hozAlign: "center",
          headerSort: true,
        },
        {
          title: "이름",
          field: "name",
          headerSort: true,
          headerFilter: "input" as const,
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
          headerFilter: "input" as const,
          editor: "input" as const,
        },
        {
          title: "상태",
          field: "_status",
          width: 80,
          hozAlign: "center",
          headerSort: false,
          formatter: (_cell: unknown) => {
            return "";
          },
        },
      ],
    });

    // 셀 편집 완료 시 디바운스 저장
    table.on("cellEdited", (cell) => {
      const data = cell.getRow().getData() as {
        id: number;
        name: string;
        age: number;
        position: string;
      };

      // 변경 표시 (노란 배경)
      const el = cell.getRow().getElement();
      el.style.background = "#fff8e1";
      pendingRef.current.add(data.id);

      // 상태 컬럼에 "수정중" 표시
      const statusCell = cell.getRow().getCell("_status");
      if (statusCell) {
        statusCell.getElement().innerHTML =
          '<span style="color:#ff9800;font-size:12px">수정중</span>';
      }

      // 디바운스: 같은 행은 마지막 편집 후 1초 뒤에 저장
      if (timerRef.current[data.id]) {
        clearTimeout(timerRef.current[data.id]);
      }
      timerRef.current[data.id] = setTimeout(async () => {
        await saveRow(data);
        // 저장 완료 후 상태 표시
        const savedStatusCell = tabulatorRef.current
          ?.getRow(data.id)
          ?.getCell("_status");
        if (savedStatusCell) {
          savedStatusCell.getElement().innerHTML =
            '<span style="color:#4caf50;font-size:12px">저장됨</span>';
          setTimeout(() => {
            const clearedCell = tabulatorRef.current
              ?.getRow(data.id)
              ?.getCell("_status");
            if (clearedCell) {
              clearedCell.getElement().innerHTML = "";
            }
          }, 1500);
        }
        delete timerRef.current[data.id];
      }, 1000);
    });

    tabulatorRef.current = table;

    return () => {
      // 타이머 정리
      Object.values(timerRef.current).forEach(clearTimeout);
      table.destroy();
    };
  }, [saveRow]);

  return (
    <div>
      <h1>셀 편집 + 인라인 저장</h1>
      <p>셀을 클릭하면 바로 편집 → 편집 완료 후 1초 뒤 자동 서버 저장</p>
      <p style={{ fontSize: "13px", color: "#888" }}>
        ID는 읽기 전용 · 이름/나이/직책 셀 클릭하여 수정 · 노란색=수정중 ·
        초록색=저장완료
      </p>
      <div ref={tableRef} />
    </div>
  );
}

export const Route = createFileRoute("/grid-inline")({
  component: GridInlinePage,
});
