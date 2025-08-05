import { NextResponse } from 'next/server'
import { generateCompareData, generateDetailedCompareData } from '@/lib/mockData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'detail') {
    const stockCode = searchParams.get('stockCode') || '000001'
    const compareType = searchParams.get('compareType') || '价格数据'
    const dataSources = searchParams.get('dataSources')?.split(',') || ['Wind', 'Bloomberg', '交易所']
    
    const detailData = generateDetailedCompareData(stockCode, compareType, dataSources)
    return NextResponse.json(detailData)
  }
  
  const compareData = generateCompareData()
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const stockCode = searchParams.get('stockCode')
  
  let filteredComparisons = [...compareData.recentComparisons]
  
  if (type && type !== 'all') {
    filteredComparisons = filteredComparisons.filter(comp => comp.compareType === type)
  }
  
  if (status && status !== 'all') {
    filteredComparisons = filteredComparisons.filter(comp => comp.status === status)
  }
  
  if (stockCode) {
    filteredComparisons = filteredComparisons.filter(comp => 
      comp.stockCode.includes(stockCode) || 
      comp.stockName.includes(stockCode)
    )
  }
  
  return NextResponse.json({
    ...compareData,
    recentComparisons: filteredComparisons,
    total: filteredComparisons.length
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, data } = body
  
  if (action === 'startCompare') {
    const { stockCodes, compareType, dataSources } = data
    
    return NextResponse.json({
      success: true,
      message: '对比任务已启动',
      data: {
        taskId: Date.now(),
        stockCodes,
        compareType,
        dataSources,
        status: 'running',
        startTime: new Date().toISOString(),
        estimatedDuration: '2-5分钟'
      }
    })
  }
  
  if (action === 'acceptDifference') {
    const { comparisonId, field } = data
    
    return NextResponse.json({
      success: true,
      message: '差异已标记为可接受',
      data: {
        comparisonId,
        field,
        status: 'accepted',
        updatedAt: new Date().toISOString()
      }
    })
  }
  
  if (action === 'createException') {
    const { comparisonId, field, description } = data
    
    return NextResponse.json({
      success: true,
      message: '异常记录已创建',
      data: {
        exceptionId: Date.now(),
        comparisonId,
        field,
        description,
        createdAt: new Date().toISOString()
      }
    })
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}