import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div>
      <h1>Tabulator Grid 연습</h1>
      <p>왼쪽 네비게이션에서 Grid 연습 페이지로 이동하세요.</p>
    </div>
  ),
})
