import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'

const sampleData = [
  { id: 1, name: '홍길동', age: 30, position: '개발자' },
  { id: 2, name: '김철수', age: 25, position: '디자이너' },
  { id: 3, name: '이영희', age: 28, position: '기획자' },
  { id: 4, name: '박민수', age: 35, position: '매니저' },
  { id: 5, name: '최지은', age: 27, position: '개발자' },
]

function GridPage() {
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

    return () => {
      table.destroy()
    }
  }, [])

  return (
    <div>
      <h1>Tabulator Grid</h1>
      <p>셀을 클릭하면 편집할 수 있습니다.</p>
      <div ref={tableRef} />
    </div>
  )
}

export const Route = createFileRoute('/grid')({
  component: GridPage,
})
