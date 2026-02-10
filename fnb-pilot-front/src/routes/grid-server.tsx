import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:8080/api/employees";

function GridServerPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = new Tabulator(tableRef.current, {
      layout: "fitColumns",

      // 페이지네이션 활성화
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      paginationSizeSelector: [10, 20, 50, 100],

      // 서버사이드 정렬/필터
      sortMode: "remote",
      filterMode: "remote",

      // 커스텀 ajax 요청
      ajaxURL: API_URL,
      ajaxRequestFunc: (url, _config, params) => {
        const query = new URLSearchParams();
        query.set("page", String(params.page || 1));
        query.set("size", String(params.size || 20));

        // 정렬 (Tabulator는 sorters 배열로 전달)
        if (params.sorters && params.sorters.length > 0) {
          query.set("sort", params.sorters[0].field);
          query.set("dir", params.sorters[0].dir);
        }

        // 필터
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
        },
        {
          title: "나이",
          field: "age",
          hozAlign: "center",
          headerSort: true,
        },
        {
          title: "직책",
          field: "position",
          headerSort: true,
          headerFilter: "input" as const,
        },
      ],
    });

    tabulatorRef.current = table;

    return () => {
      table.destroy();
    };
  }, []);

  return (
    <div>
      <h1>서버사이드 페이지네이션</h1>
      <p>1,000건 데이터 — 페이지네이션/정렬/필터 모두 서버에서 처리</p>
      <p style={{ fontSize: "13px", color: "#888" }}>
        컬럼 헤더 클릭으로 정렬, 헤더 아래 입력란으로 필터링
      </p>
      <div ref={tableRef} />
    </div>
  );
}

export const Route = createFileRoute("/grid-server")({
  component: GridServerPage,
});
