import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:8080/api/employees";

// 직책별 뱃지 색상
const positionColor: Record<string, { bg: string; text: string }> = {
  사원: { bg: "#e3f2fd", text: "#1565c0" },
  대리: { bg: "#e8f5e9", text: "#2e7d32" },
  과장: { bg: "#fff3e0", text: "#e65100" },
  차장: { bg: "#fce4ec", text: "#c62828" },
  부장: { bg: "#f3e5f5", text: "#6a1b9a" },
  이사: { bg: "#e0f2f1", text: "#00695c" },
  상무: { bg: "#fff8e1", text: "#f57f17" },
  전무: { bg: "#efebe9", text: "#4e342e" },
  부사장: { bg: "#e8eaf6", text: "#283593" },
  사장: { bg: "#fbe9e7", text: "#bf360c" },
};

function GridFormatterPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("");

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
      rowFormatter: (row) => {
        const data = row.getData() as { age: number };
        if (data.age >= 50) {
          row.getElement().style.fontWeight = "600";
        }
      },
      columns: [
        {
          title: "ID",
          field: "id",
          width: 70,
          hozAlign: "center",
          headerSort: true,
          formatter: (cell) => {
            const v = cell.getValue();
            return `<span style="color:#999;font-size:12px">#${v}</span>`;
          },
        },
        {
          title: "이름",
          field: "name",
          headerSort: true,
          formatter: (cell) => {
            const name = cell.getValue() as string;
            const initial = name ? name.charAt(0) : "?";
            return `<div style="display:flex;align-items:center;gap:8px">
              <div style="width:28px;height:28px;border-radius:50%;background:#7c4dff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;flex-shrink:0">${initial}</div>
              <span>${name}</span>
            </div>`;
          },
        },
        {
          title: "나이",
          field: "age",
          width: 150,
          hozAlign: "center",
          headerSort: true,
          formatter: (cell) => {
            const age = cell.getValue() as number;
            const pct = Math.min((age / 60) * 100, 100);
            const color =
              age >= 50 ? "#f44336" : age >= 35 ? "#ff9800" : "#4caf50";
            return `<div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${color};border-radius:4px"></div>
              </div>
              <span style="font-size:12px;min-width:28px;text-align:right">${age}</span>
            </div>`;
          },
        },
        {
          title: "직책",
          field: "position",
          width: 120,
          hozAlign: "center",
          headerSort: true,
          formatter: (cell) => {
            const pos = cell.getValue() as string;
            const c = positionColor[pos] || { bg: "#eee", text: "#333" };
            return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${c.bg};color:${c.text};font-size:12px;font-weight:600">${pos}</span>`;
          },
        },
        {
          title: "등급",
          field: "age",
          width: 100,
          hozAlign: "center",
          headerSort: false,
          formatter: (cell) => {
            const age = cell.getValue() as number;
            if (age >= 50)
              return '<span style="color:#f44336;font-size:16px">★★★</span>';
            if (age >= 35)
              return '<span style="color:#ff9800;font-size:16px">★★</span>';
            return '<span style="color:#4caf50;font-size:16px">★</span>';
          },
        },
      ],
    });

    tabulatorRef.current = table;

    return () => {
      table.destroy();
    };
  }, []);

  const handleSearch = async () => {
    const filters: { field: string; value: string }[] = [];
    if (searchName.trim()) {
      filters.push({ field: "name", value: searchName.trim() });
    }
    if (searchPosition.trim()) {
      filters.push({ field: "position", value: searchPosition.trim() });
    }
    const query = new URLSearchParams();
    query.set("page", "1");
    query.set("size", "20");
    if (filters.length > 0) {
      query.set("filter", JSON.stringify(filters));
    }
    const res = await fetch(`${API_URL}?${query.toString()}`);
    const json = await res.json();
    tabulatorRef.current?.setData(json.data);
  };

  const handleClear = async () => {
    setSearchName("");
    setSearchPosition("");
    const res = await fetch(`${API_URL}?page=1&size=20`);
    const json = await res.json();
    tabulatorRef.current?.setData(json.data);
  };

  return (
    <div>
      <h1>커스텀 포매터</h1>
      <p>셀 안에 뱃지, 프로그레스바, 아바타, 별점 등 HTML 렌더링</p>
      <div
        style={{
          fontSize: "13px",
          color: "#888",
          marginBottom: "12px",
          lineHeight: "1.6",
        }}
      >
        <div>
          <b>ID</b>: #접두사 + 회색 텍스트
        </div>
        <div>
          <b>이름</b>: 이니셜 아바타 + 이름
        </div>
        <div>
          <b>나이</b>: 프로그레스바 (초록/주황/빨강)
        </div>
        <div>
          <b>직책</b>: 색상 뱃지
        </div>
        <div>
          <b>등급</b>: 나이 기반 별점 (★~★★★)
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="이름 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "140px",
          }}
        />
        <input
          type="text"
          placeholder="직책 검색"
          value={searchPosition}
          onChange={(e) => setSearchPosition(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "140px",
          }}
        />
        <button onClick={handleSearch}>검색</button>
        <button onClick={handleClear}>초기화</button>
      </div>
      <div ref={tableRef} />
    </div>
  );
}

export const Route = createFileRoute("/grid-formatter")({
  component: GridFormatterPage,
});
