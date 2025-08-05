import { NextResponse } from 'next/server'
import { generateExceptions } from '@/lib/mockData'

// 存储异常状态（实际项目中应该使用数据库）
let exceptionsData = generateExceptions()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const severity = searchParams.get('severity')
  const status = searchParams.get('status')
  
  let filteredData = [...exceptionsData]
  
  // 应用筛选
  if (type && type !== 'all') {
    filteredData = filteredData.filter(ex => ex.type === type)
  }
  if (severity && severity !== 'all') {
    filteredData = filteredData.filter(ex => ex.severity === severity)
  }
  if (status && status !== 'all') {
    filteredData = filteredData.filter(ex => ex.status === status)
  }
  
  return NextResponse.json({
    data: filteredData,
    total: filteredData.length,
    filters: {
      types: ['价格异常', '数据缺失', '财务异常', '多源差异', '规则违反'],
      severities: ['high', 'medium', 'low'],
      statuses: ['pending', 'processing', 'resolved']
    }
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, id, data } = body
  
  if (action === 'updateStatus') {
    const exception = exceptionsData.find(ex => ex.id === id)
    if (exception) {
      exception.status = data.status
      return NextResponse.json({
        success: true,
        message: `异常 ${id} 状态已更新为 ${data.status}`,
        data: { id, status: data.status, updatedAt: new Date().toISOString() }
      })
    }
  }
  
  if (action === 'batchUpdate') {
    data.ids.forEach((id: number) => {
      const exception = exceptionsData.find(ex => ex.id === id)
      if (exception) {
        exception.status = data.status
      }
    })
    return NextResponse.json({
      success: true,
      message: `已批量处理 ${data.ids.length} 条异常`,
      data: { count: data.ids.length, updatedAt: new Date().toISOString() }
    })
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}