import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:3000/api/employees";

function GridValidatePage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

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
      validationMode: "highlight",
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
          editor: "input" as const,
          validator: [
            { type: "required" as const, parameters: undefined },
            { type: "minLength" as const, parameters: 2 },
            { type: "maxLength" as const, parameters: 20 },
          ],
        },
        {
          title: "나이",
          field: "age",
          hozAlign: "center",
          headerSort: true,
          editor: "number" as const,
          editorParams: { min: 1, max: 120 },
          validator: [
            { type: "required" as const, parameters: undefined },
            { type: "min" as const, parameters: 1 },
            { type: "max" as const, parameters: 120 },
            { type: "integer" as const, parameters: undefined },
          ],
        },
        {
          title: "직책",
          field: "position",
          headerSort: true,
          editor: "list" as const,
          editorParams: {
            values: ["사원", "대리", "과장", "차장", "부장", "이사", "상무", "전무", "부사장", "사장"],
            autocomplete: true,
            listOnEmpty: true,
          },
          validator: [
            { type: "required" as const, parameters: undefined },
          ],
        },
        {
          title: "상태",
          field: "_valid",
          width: 80,
          hozAlign: "center",
          headerSort: false,
          formatter: () => "",
        },
      ],
    });

    // 유효성 통과 → 서버 저장
    table.on("cellEdited", async (cell) => {
      const row = cell.getRow();
      const data = row.getData() as {
        id: number;
        name: string;
        age: number;
        position: string;
      };

      const valid = row.validate();
      const statusCell = row.getCell("_valid");

      if (valid === true) {
        statusCell.getElement().innerHTML =
          '<span style="color:#ff9800;font-size:12px">저장중</span>';

        try {
          await fetch(`${API_URL}/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              age: data.age,
              position: data.position,
            }),
          });
          const el = row.getElement();
          el.style.transition = "background 0.3s";
          el.style.background = "#e8f5e9";
          statusCell.getElement().innerHTML =
            '<span style="color:#4caf50;font-size:12px">저장됨</span>';
          setTimeout(() => {
            el.style.background = "";
            const cleared = tabulatorRef.current
              ?.getRow(data.id)
              ?.getCell("_valid");
            if (cleared) cleared.getElement().innerHTML = "";
          }, 1200);
        } catch {
          statusCell.getElement().innerHTML =
            '<span style="color:#f44336;font-size:12px">실패</span>';
        }
      } else {
        statusCell.getElement().innerHTML =
          '<span style="color:#f44336;font-size:12px">오류</span>';
      }
    });

    tabulatorRef.current = table;

    return () => {
      table.destroy();
    };
  }, []);

  return (
    <div>
      <h1>셀 유효성 검사</h1>
      <p>셀 편집 시 유효성 검사 → 통과하면 저장, 실패하면 빨간 테두리</p>
      <div
        style={{
          fontSize: "13px",
          color: "#888",
          marginBottom: "12px",
          lineHeight: "1.6",
        }}
      >
        <div>
          <b>이름</b>: 필수, 2~20자
        </div>
        <div>
          <b>나이</b>: 필수, 정수, 1~120
        </div>
        <div>
          <b>직책</b>: 필수, 목록에서 선택 (사원/대리/과장/차장/부장/이사/상무/전무/부사장/사장)
        </div>
      </div>
      <div ref={tableRef} />
      <style>{`
        .tabulator-row .tabulator-validation-fail {
          background: #ffebee !important;
          border: 2px solid #f44336 !important;
        }
        .tabulator-row .tabulator-validation-fail input {
          color: #f44336;
        }
      `}</style>
    </div>
  );
}

export const Route = createFileRoute("/grid-validate")({
  component: GridValidatePage,
});
