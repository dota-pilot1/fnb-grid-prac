import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: "180px",
          padding: "20px 16px",
          borderRight: "1px solid #e0e0e0",
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <strong
          style={{ fontSize: "14px", marginBottom: "8px", color: "#333" }}
        >
          Tabulator 연습
        </strong>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/grid" style={linkStyle}>
          Grid 기본
        </Link>
        <Link to="/grid-update" style={linkStyle}>
          셀 편집
        </Link>
        <Link to="/grid-add-delete" style={linkStyle}>
          추가/삭제
        </Link>
        <Link to="/grid-save" style={linkStyle}>
          저장
        </Link>
        <Link to="/grid-api" style={linkStyle}>
          API 연동
        </Link>
        <Link to="/grid-server" style={linkStyle}>
          서버사이드
        </Link>
        <Link to="/grid-inline" style={linkStyle}>
          인라인 편집
        </Link>
        <Link to="/grid-batch" style={linkStyle}>
          일괄 저장
        </Link>
        <Link to="/grid-validate" style={linkStyle}>
          유효성 검사
        </Link>
      </nav>
      <main style={{ flex: 1, padding: "24px 32px", overflow: "auto" }}>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});

const linkStyle: React.CSSProperties = {
  fontSize: "13px",
  padding: "6px 10px",
  borderRadius: "4px",
  color: "#444",
};
