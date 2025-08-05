import { NextResponse } from 'next/server'
import { generateRules } from '@/lib/mockData'

let rulesData = generateRules()

export async function GET() {
  return NextResponse.json({
    data: rulesData,
    total: rulesData.length
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, data } = body
  
  if (action === 'create') {
    const newRule = {
      id: Date.now(),
      ...data,
      status: 'draft',
      statistics: {
        totalExecutions: 0,
        triggeredCount: 0,
        accuracyRate: 0,
        lastExecution: null
      }
    }
    rulesData.push(newRule)
    
    return NextResponse.json({
      success: true,
      message: '规则创建成功',
      data: newRule
    })
  }
  
  if (action === 'update') {
    const index = rulesData.findIndex(r => r.id === data.id)
    if (index !== -1) {
      rulesData[index] = { ...rulesData[index], ...data }
      return NextResponse.json({
        success: true,
        message: '规则更新成功',
        data: rulesData[index]
      })
    }
  }
  
  if (action === 'toggle') {
    const rule = rulesData.find(r => r.id === data.id)
    if (rule) {
      rule.status = rule.status === 'active' ? 'paused' : 'active'
      return NextResponse.json({
        success: true,
        message: `规则已${rule.status === 'active' ? '启用' : '暂停'}`,
        data: { id: rule.id, status: rule.status }
      })
    }
  }
  
  if (action === 'test') {
    return NextResponse.json({
      success: true,
      message: '规则测试运行完成',
      data: {
        id: data.id,
        testResult: {
          executionTime: '2.3s',
          recordsProcessed: 1234,
          exceptionsFound: 5,
          sampleExceptions: [
            { stockCode: '000001', message: '价格波动超过阈值' },
            { stockCode: '600519', message: '成交量数据缺失' }
          ]
        }
      }
    })
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}