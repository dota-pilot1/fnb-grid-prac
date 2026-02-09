import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

const sampleData = [
  { id: 1, name: '홍길동', age: 30, position: '개발자' },
  { id: 2, name: '김철수', age: 25, position: '디자이너' },
  { id: 3, name: '이영희', age: 28, position: '기획자' },
]

function GridUpdatePage() {
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tableRef.current) return

    const table = new Tabulator(tableRef.current, {
      data: sampleData,
      layout: 'fitColumns',
      columns: [
        { title: 'ID', field: 'id', width: 80, hozAlign: 'center' },
        { title: '이름', field: 'name', editor: 'input' },
        { title: '나이', field: 'age', editor: 'number', hozAlign: 'center' },
        { title: '직책', field: 'position', editor: 'list', editorParams: { values: ['개발자', '디자이너', '기획자', '매니저'] } },
      ],
    })

    // 셀 편집 완료 시 이벤트
    table.on('cellEdited', (cell) => {
      console.log('=== cellEdited ===')
      console.log('변경된 필드:', cell.getField())
      console.log('이전 값:', cell.getOldValue())
      console.log('새 값:', cell.getValue())
      console.log('해당 행 전체 데이터:', cell.getRow().getData())
    })

    // 셀 편집 시작 시 이벤트
    table.on('cellEditCancelled', (cell) => {
      console.log('편집 취소됨:', cell.getField(), '값:', cell.getValue())
    })

    return () => {
      table.destroy()
    }
  }, [])

  return (
    <div>
      <h1>셀 편집 (Update)</h1>
      <p>더블클릭으로 셀 편집 → 콘솔에서 이벤트 확인</p>
      <div ref={tableRef} />
    </div>
  )
}

export const Route = createFileRoute('/grid-update')({
  component: GridUpdatePage,
})
