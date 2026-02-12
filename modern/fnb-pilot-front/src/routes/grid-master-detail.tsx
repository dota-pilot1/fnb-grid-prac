import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

const API_URL = "http://localhost:3000/api/teams";

function GridMasterDetailPage() {
  const masterRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const masterTable = useRef<Tabulator | null>(null);
  const detailTable = useRef<Tabulator | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // 마스터 그리드 (팀 목록)
  useEffect(() => {
    if (!masterRef.current) return;

    masterTable.current = new Tabulator(masterRef.current, {
      layout: "fitColumns",
      selectable: 1,
      columns: [
        { title: "ID", field: "id", width: 60 },
        { title: "팀명", field: "name", width: 120 },
        { title: "설명", field: "description" },
      ],
    });

    // 팀 데이터 로드
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => masterTable.current?.setData(data));

    // 행 클릭 → 디테일 로드
    masterTable.current.on("rowClick", (_e: Event, row: any) => {
      const team = row.getData();
      setSelectedTeam(team.name);

      fetch(`${API_URL}/${team.id}/members`)
        .then((res) => res.json())
        .then((members) => detailTable.current?.setData(members));
    });

    return () => masterTable.current?.destroy();
  }, []);

  // 디테일 그리드 (팀원 목록)
  useEffect(() => {
    if (!detailRef.current) return;

    detailTable.current = new Tabulator(detailRef.current, {
      layout: "fitColumns",
      placeholder: "왼쪽에서 팀을 선택하세요",
      columns: [
        { title: "ID", field: "id", width: 60 },
        { title: "이름", field: "name", width: 100 },
        { title: "나이", field: "age", width: 70 },
        { title: "직책", field: "position", width: 120 },
      ],
    });

    return () => detailTable.current?.destroy();
  }, []);

  return (
    <div>
      <h2>마스터-디테일 (팀 → 팀원)</h2>
      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        <div style={{ width: "350px" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#666" }}>
            팀 목록
          </h3>
          <div ref={masterRef} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#666" }}>
            {selectedTeam ? `${selectedTeam} 팀원` : "팀원 목록"}
          </h3>
          <div ref={detailRef} />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/grid-master-detail")({
  component: GridMasterDetailPage,
});
