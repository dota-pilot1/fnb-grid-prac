import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

  // 전체 데이터 엑셀 다운로드 (exceljs)
  const handleDownloadAll = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("직원목록");

    // 컬럼 정의 (헤더 + 너비)
    ws.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "이름", key: "name", width: 15 },
      { header: "나이", key: "age", width: 8 },
      { header: "직책", key: "position", width: 15 },
    ];

    // 데이터 추가
    data.forEach(
      (row: { id: number; name: string; age: number; position: string }) => {
        ws.addRow(row);
      },
    );

    // 헤더 스타일
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4CAF50" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.height = 24;

    // 데이터 행 스타일
    for (let i = 2; i <= data.length + 1; i++) {
      const row = ws.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
      // 짝수 행 배경색
      if (i % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F5F5" },
          };
        });
      }
    }

    // 다운로드
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "employees.xlsx");
  };

  return (
    <div>
      <h1>서버사이드 페이지네이션</h1>
      <p>1,000건 데이터 — 페이지네이션/정렬/필터 모두 서버에서 처리</p>
      <p style={{ fontSize: "13px", color: "#888" }}>
        컬럼 헤더 클릭으로 정렬, 헤더 아래 입력란으로 필터링
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleDownloadAll}>엑셀 다운로드</button>
      </div>
      <div ref={tableRef} />
    </div>
  );
}

export const Route = createFileRoute("/grid-server")({
  component: GridServerPage,
});
