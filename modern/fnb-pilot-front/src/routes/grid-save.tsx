import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

const sampleData = [
  { id: 1, name: '홍길동', age: 30, position: '개발자' },
  { id: 2, name: '김철수', age: 25, position: '디자이너' },
  { id: 3, name: '이영희', age: 28, position: '기획자' },
]

let nextId = 4

function GridSavePage() {
  const tableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)
  const [savedJson, setSavedJson] = useState('')

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

  // getData() → 현재 테이블의 전체 데이터를 배열로 반환
  const handleSave = () => {
    const data = tabulatorRef.current?.getData()
    if (!data) return

    // 실제로는 여기서 API 호출
    // await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) })
    setSavedJson(JSON.stringify(data, null, 2))
    console.log('저장할 데이터:', data)
  }

  const handleAddRow = () => {
    tabulatorRef.current?.addRow(
      { id: nextId++, name: '', age: 0, position: '개발자' },
      false,
    )
  }

  return (
    <div>
      <h1>데이터 저장 (Save)</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={handleAddRow}>행 추가</button>
        <button onClick={handleSave}>저장 (getData)</button>
      </div>
      <div ref={tableRef} />
      {savedJson && (
        <div style={{ marginTop: '20px' }}>
          <h3>getData() 결과:</h3>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
            {savedJson}
          </pre>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/grid-save')({
  component: GridSavePage,
})
