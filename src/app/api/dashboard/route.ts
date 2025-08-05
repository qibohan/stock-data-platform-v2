import { NextResponse } from 'next/server'
import { generateDashboardData, generateExceptions } from '@/lib/mockData'

export async function GET() {
  const dashboardData = generateDashboardData()
  const exceptions = generateExceptions()
  
  // 获取最近的异常
  const recentExceptions = exceptions.slice(0, 10)
  
  return NextResponse.json({
    ...dashboardData,
    recentExceptions
  })
}