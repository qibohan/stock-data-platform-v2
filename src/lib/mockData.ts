// 股票基础数据
export const stockData = [
  { code: '000001', name: '平安银行', industry: '银行' },
  { code: '000002', name: '万科A', industry: '房地产' },
  { code: '000858', name: '五粮液', industry: '白酒' },
  { code: '002415', name: '海康威视', industry: '安防' },
  { code: '600036', name: '招商银行', industry: '银行' },
  { code: '600519', name: '贵州茅台', industry: '白酒' },
  { code: '000333', name: '美的集团', industry: '家电' },
  { code: '002594', name: '比亚迪', industry: '汽车' },
  { code: '300750', name: '宁德时代', industry: '新能源' },
  { code: '603259', name: '药明康德', industry: '医药' },
]

// 生成异常数据
export function generateExceptions() {
  const types = ['价格异常', '数据缺失', '财务异常', '多源差异', '规则违反']
  const severities = ['high', 'medium', 'low']
  const statuses = ['pending', 'processing', 'resolved']
  
  const exceptions = []
  for (let i = 1; i <= 30; i++) {
    const stock = stockData[Math.floor(Math.random() * stockData.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    exceptions.push({
      id: i,
      stockCode: stock.code,
      stockName: stock.name,
      type,
      severity,
      status,
      message: getExceptionMessage(type),
      time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: getExceptionDetails(type, stock)
    })
  }
  
  return exceptions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

function getExceptionMessage(type: string) {
  const messages: Record<string, string[]> = {
    '价格异常': [
      '收盘价异常波动超过10%',
      '开盘价与昨收价差异过大',
      '盘中价格出现异常跳空'
    ],
    '数据缺失': [
      '成交量数据缺失',
      '财务数据未及时更新',
      '行情数据传输中断'
    ],
    '财务异常': [
      '市盈率计算异常',
      '净利润数据异常',
      '财务指标超出合理范围'
    ],
    '多源差异': [
      '不同数据源价格差异超过阈值',
      '成交量数据不一致',
      '财务数据存在差异'
    ],
    '规则违反': [
      '连续3日无成交数据',
      '数据更新延迟超过限制',
      '必填字段存在空值'
    ]
  }
  
  const typeMessages = messages[type] || ['未知异常']
  return typeMessages[Math.floor(Math.random() * typeMessages.length)]
}

function getExceptionDetails(type: string, stock: any) {
  switch (type) {
    case '价格异常':
      return {
        currentPrice: (Math.random() * 100 + 10).toFixed(2),
        expectedRange: [(Math.random() * 90 + 10).toFixed(2), (Math.random() * 110 + 10).toFixed(2)],
        changePercent: (Math.random() * 20 - 10).toFixed(2) + '%',
        dataSource: ['Wind', 'Bloomberg', '交易所'][Math.floor(Math.random() * 3)]
      }
    case '数据缺失':
      return {
        missingFields: ['成交量', '成交额', '换手率'].slice(0, Math.floor(Math.random() * 3) + 1),
        lastValidTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        dataSource: ['Wind', 'Bloomberg'][Math.floor(Math.random() * 2)]
      }
    case '多源差异':
      const basePrice = Math.random() * 100 + 10
      return {
        windPrice: basePrice.toFixed(2),
        bloombergPrice: (basePrice + Math.random() * 0.5 - 0.25).toFixed(2),
        exchangePrice: (basePrice + Math.random() * 0.3 - 0.15).toFixed(2),
        maxDiff: (Math.random() * 0.5).toFixed(2),
        threshold: '0.10'
      }
    default:
      return {
        description: '详细信息',
        suggestion: '请检查数据源'
      }
  }
}

// 生成仪表盘数据
export function generateDashboardData() {
  const now = new Date()
  const trend = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20 + 5)
    })
  }
  
  return {
    summary: {
      totalStocks: stockData.length * 100,
      totalRecords: Math.floor(Math.random() * 1000000 + 1000000),
      lastUpdateTime: new Date().toISOString(),
      systemStatus: 'normal'
    },
    exceptionTrend: trend,
    dataSourceStatus: [
      { name: 'Wind', status: 'online', lastSync: new Date().toISOString(), reliability: 95 },
      { name: 'Bloomberg', status: 'online', lastSync: new Date().toISOString(), reliability: 92 },
      { name: '交易所', status: 'online', lastSync: new Date().toISOString(), reliability: 98 }
    ]
  }
}

// 生成规则数据
export function generateRules() {
  return [
    {
      id: 1,
      name: '价格波动检查',
      type: '价格异常',
      description: '检查股价日涨跌幅是否超过合理范围',
      status: 'active',
      config: {
        maxChangePercent: 10,
        minChangePercent: -10,
        checkFrequency: 'realtime'
      },
      statistics: {
        totalExecutions: 15234,
        triggeredCount: 127,
        accuracyRate: 92.5,
        lastExecution: new Date().toISOString()
      }
    },
    {
      id: 2,
      name: '数据完整性检查',
      type: '数据缺失',
      description: '检查必要字段是否存在空值',
      status: 'active',
      config: {
        requiredFields: ['开盘价', '收盘价', '最高价', '最低价', '成交量'],
        tolerance: 0
      },
      statistics: {
        totalExecutions: 8934,
        triggeredCount: 45,
        accuracyRate: 88.9,
        lastExecution: new Date().toISOString()
      }
    },
    {
      id: 3,
      name: '市盈率合理性检查',
      type: '财务异常',
      description: '检查市盈率是否在合理范围内',
      status: 'paused',
      config: {
        minPE: -100,
        maxPE: 200,
        excludeNegativeEarnings: false
      },
      statistics: {
        totalExecutions: 4567,
        triggeredCount: 89,
        accuracyRate: 76.4,
        lastExecution: new Date().toISOString()
      }
    },
    {
      id: 4,
      name: '多源价格一致性检查',
      type: '多源差异',
      description: '检查不同数据源的价格差异是否超过阈值',
      status: 'active',
      config: {
        maxDiffPercent: 0.1,
        dataSources: ['Wind', 'Bloomberg', '交易所'],
        baseSource: '交易所'
      },
      statistics: {
        totalExecutions: 2341,
        triggeredCount: 23,
        accuracyRate: 94.2,
        lastExecution: new Date().toISOString()
      }
    }
  ]
}

// 生成事件数据
export function generateEvents() {
  return [
    {
      id: 1,
      type: '拆股事件',
      stockCode: '000001',
      stockName: '平安银行',
      description: '1拆2股票拆分',
      triggerTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      timeline: [
        {
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          action: '事件触发',
          details: '接收到拆股公告文件',
          actor: '系统',
          status: 'completed'
        },
        {
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
          action: '数据验证',
          details: '验证拆股比例和生效日期',
          actor: '系统',
          status: 'completed'
        }
      ],
      affectedData: {
        tables: [
          { name: '股票基础信息表', fields: ['总股本', '流通股本'], recordsAffected: 1 },
          { name: '历史价格表', fields: ['开盘价', '收盘价'], recordsAffected: 1247 }
        ]
      }
    },
    {
      id: 2,
      type: '财报发布',
      stockCode: '600519',
      stockName: '贵州茅台',
      description: '2023年年报发布',
      triggerTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ]
}