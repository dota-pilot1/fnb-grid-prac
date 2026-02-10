import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

const sampleData = [
  { id: 1, name: '홍길동', age: 30, position: '개발자' },
  { id: 2, name: '김철수', age: 25, position: '디자이너' },
  { id: 3, name: '이영희', age: 28, position: '기획자' },
]

let nextId = 4

function GridAddDeletePage() {
  const tableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

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
        {
          title: '삭제',
          formatter: 'buttonCross',
          width: 80,
          hozAlign: 'center',
          headerSort: false,
          cellClick: (_e: Event, cell: Tabulator.CellComponent) => {
            cell.getRow().delete()
          },
        },
      ],
    })

    tabulatorRef.current = table

    return () => {
      table.destroy()
    }
  }, [])

  const handleAddRow = () => {
    tabulatorRef.current?.addRow(
      { id: nextId++, name: '', age: 0, position: '개발자' },
      false, // false = 맨 아래에 추가, true = 맨 위에 추가
    )
  }

  const handleDeleteSelected = () => {
    // 현재 데이터 전체 가져오기
    const allData = tabulatorRef.current?.getData()
    console.log('현재 전체 데이터:', allData)
  }

  return (
    <div>
      <h1>행 추가 / 삭제</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={handleAddRow}>행 추가</button>
        <button onClick={handleDeleteSelected}>전체 데이터 콘솔 출력</button>
      </div>
      <div ref={tableRef} />
    </div>
  )
}

export const Route = createFileRoute('/grid-add-delete')({
  component: GridAddDeletePage,
})
