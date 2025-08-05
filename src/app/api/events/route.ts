import { NextResponse } from 'next/server'
import { generateEvents } from '@/lib/mockData'

let eventsData = generateEvents()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const stockCode = searchParams.get('stockCode')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  
  let filteredData = [...eventsData]
  
  if (type && type !== 'all') {
    filteredData = filteredData.filter(event => event.type === type)
  }
  
  if (status && status !== 'all') {
    filteredData = filteredData.filter(event => event.status === status)
  }
  
  if (stockCode) {
    filteredData = filteredData.filter(event => 
      event.stockCode.includes(stockCode) || 
      event.stockName.includes(stockCode)
    )
  }
  
  if (startDate) {
    filteredData = filteredData.filter(event => 
      new Date(event.triggerTime) >= new Date(startDate)
    )
  }
  
  if (endDate) {
    filteredData = filteredData.filter(event => 
      new Date(event.triggerTime) <= new Date(endDate)
    )
  }
  
  return NextResponse.json({
    data: filteredData,
    total: filteredData.length,
    filters: {
      types: ['拆股事件', '财报发布', '除权除息', '股本变更', '重大资产重组', '停牌复牌', '更名', '行业调整'],
      statuses: ['completed', 'processing', 'failed', 'pending']
    },
    summary: {
      total: eventsData.length,
      completed: eventsData.filter(e => e.status === 'completed').length,
      processing: eventsData.filter(e => e.status === 'processing').length,
      failed: eventsData.filter(e => e.status === 'failed').length,
      pending: eventsData.filter(e => e.status === 'pending').length
    }
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, id, data } = body
  
  if (action === 'retry') {
    const event = eventsData.find(e => e.id === id)
    if (event && event.status === 'failed') {
      event.status = 'processing'
      event.timeline.push({
        time: new Date().toISOString(),
        action: '重新处理',
        details: '手动触发重新处理',
        actor: '用户',
        status: 'processing'
      })
      
      return NextResponse.json({
        success: true,
        message: '事件已重新开始处理',
        data: { id, status: 'processing', updatedAt: new Date().toISOString() }
      })
    }
  }
  
  if (action === 'rollback') {
    const event = eventsData.find(e => e.id === id)
    if (event && event.status === 'completed') {
      event.timeline.push({
        time: new Date().toISOString(),
        action: '数据回滚',
        details: '回滚数据变更',
        actor: '用户',
        status: 'completed'
      })
      
      return NextResponse.json({
        success: true,
        message: '数据回滚操作已完成',
        data: { id, action: 'rollback', updatedAt: new Date().toISOString() }
      })
    }
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}