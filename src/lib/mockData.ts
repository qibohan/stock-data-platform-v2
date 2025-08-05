// 股票基础数据 - 港股美股
export const stockData = [
  // 港股
  { code: '00700', name: '腾讯控股', industry: '互联网' },
  { code: '09988', name: '阿里巴巴-SW', industry: '互联网' },
  { code: '03690', name: '美团-W', industry: '互联网' },
  { code: '01024', name: '快手-W', industry: '互联网' },
  { code: '02020', name: '安踏体育', industry: '体育用品' },
  { code: '02318', name: '中国平安', industry: '保险' },
  { code: '00941', name: '中国移动', industry: '电信' },
  { code: '00388', name: '香港交易所', industry: '金融' },
  { code: '01299', name: '友邦保险', industry: '保险' },
  { code: '02202', name: '万科企业', industry: '房地产' },
  // 美股
  { code: 'AAPL', name: 'Apple Inc.', industry: '科技' },
  { code: 'MSFT', name: 'Microsoft Corp.', industry: '科技' },
  { code: 'GOOGL', name: 'Alphabet Inc.', industry: '科技' },
  { code: 'AMZN', name: 'Amazon.com Inc.', industry: '电商' },
  { code: 'TSLA', name: 'Tesla Inc.', industry: '汽车' },
  { code: 'META', name: 'Meta Platforms Inc.', industry: '科技' },
  { code: 'NVDA', name: 'NVIDIA Corp.', industry: '半导体' },
  { code: 'BRK.A', name: 'Berkshire Hathaway', industry: '投资' },
  { code: 'JPM', name: 'JPMorgan Chase', industry: '银行' },
  { code: 'JNJ', name: 'Johnson & Johnson', industry: '医药' },
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
      '股价异常波动超过15%',
      '盘前盘后价格差异过大',
      '盘中价格出现异常跳空',
      'ADR与港股价格差异异常'
    ],
    '数据缺失': [
      '成交量数据缺失',
      '财务数据未及时更新',
      '行情数据传输中断',
      'ESG数据缺失'
    ],
    '财务异常': [
      '市盈率计算异常',
      '净利润数据异常',
      '财务指标超出合理范围',
      'GAAP与IFRS数据差异'
    ],
    '多源差异': [
      '不同数据源价格差异超过阈值',
      '成交量数据不一致',
      '财务数据存在差异',
      'Bloomberg与Reuters数据差异'
    ],
    '规则违反': [
      '连续3日无成交数据',
      '数据更新延迟超过限制',
      '必填字段存在空值',
      'SEC文件披露延迟'
    ]
  }
  
  const typeMessages = messages[type] || ['未知异常']
  return typeMessages[Math.floor(Math.random() * typeMessages.length)]
}

function getExceptionDetails(type: string, stock: any) {
  switch (type) {
    case '价格异常':
      return {
        currentPrice: (Math.random() * 200 + 50).toFixed(2),
        expectedRange: [(Math.random() * 180 + 50).toFixed(2), (Math.random() * 220 + 50).toFixed(2)],
        changePercent: (Math.random() * 30 - 15).toFixed(2) + '%',
        dataSource: ['Bloomberg', 'Reuters', 'Yahoo Finance'][Math.floor(Math.random() * 3)]
      }
    case '数据缺失':
      return {
        missingFields: ['成交量', '成交额', '市值', 'ESG评分'].slice(0, Math.floor(Math.random() * 3) + 1),
        lastValidTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        dataSource: ['Bloomberg', 'Reuters', 'FactSet'][Math.floor(Math.random() * 2)]
      }
    case '多源差异':
      const basePrice = Math.random() * 200 + 50
      return {
        bloombergPrice: basePrice.toFixed(2),
        reutersPrice: (basePrice + Math.random() * 0.5 - 0.25).toFixed(2),
        yahooPrice: (basePrice + Math.random() * 0.3 - 0.15).toFixed(2),
        maxDiff: (Math.random() * 0.5).toFixed(2),
        threshold: '0.15'
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
      { name: 'Bloomberg', status: 'online', lastSync: new Date().toISOString(), reliability: 95 },
      { name: 'Reuters', status: 'online', lastSync: new Date().toISOString(), reliability: 92 },
      { name: 'Yahoo Finance', status: 'online', lastSync: new Date().toISOString(), reliability: 88 },
      { name: 'FactSet', status: 'online', lastSync: new Date().toISOString(), reliability: 94 }
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
      description: '检查股价日涨跌幅是否超过合理范围（美股15%，港股10%）',
      status: 'active',
      config: {
        maxChangePercent: 15,
        minChangePercent: -15,
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
        requiredFields: ['开盘价', '收盘价', '最高价', '最低价', '成交量', '市值'],
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
        dataSources: ['Bloomberg', 'Reuters', 'Yahoo Finance'],
        baseSource: 'Bloomberg'
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
  const eventTypes = ['股票拆分', '财报发布', '分红派息', '股本变更', '重大并购', '停牌复牌', '更名', '行业调整', 'ADR发行', 'ESG评级更新']
  const statuses = ['completed', 'processing', 'failed', 'pending']
  
  const events = []
  for (let i = 1; i <= 25; i++) {
    const stock = stockData[Math.floor(Math.random() * stockData.length)]
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const triggerTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    
    events.push({
      id: i,
      type,
      stockCode: stock.code,
      stockName: stock.name,
      description: getEventDescription(type, stock),
      triggerTime: triggerTime.toISOString(),
      status,
      timeline: generateEventTimeline(type, triggerTime, status),
      affectedData: generateAffectedData(type),
      impact: {
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        recordsAffected: Math.floor(Math.random() * 10000) + 100,
        duration: Math.floor(Math.random() * 48) + 1 + 'h'
      }
    })
  }
  
  return events.sort((a, b) => new Date(b.triggerTime).getTime() - new Date(a.triggerTime).getTime())
}

function getEventDescription(type: string, stock: any) {
  const descriptions: Record<string, string[]> = {
    '股票拆分': ['1拆2股票拆分', '1拆3股票拆分', '1拆10股票拆分'],
    '财报发布': ['年报发布', '季报发布', '半年报发布', '业绩预告'],
    '分红派息': ['现金分红除息', '股票分红除权', '特别股息'],
    '股本变更': ['增发新股', '股份回购', '资本公积转增股本'],
    '重大并购': ['资产收购', '资产出售', '合并重组'],
    '停牌复牌': ['临时停牌', '复牌交易', '长期停牌'],
    '更名': ['公司更名', '证券简称变更'],
    '行业调整': ['行业分类调整', '板块划分变更'],
    'ADR发行': ['ADR首次发行', 'ADR增发', 'ADR转换'],
    'ESG评级更新': ['ESG评级上调', 'ESG评级下调', 'ESG评级维持']
  }
  
  const typeDescriptions = descriptions[type] || ['事件处理']
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)]
}

function generateEventTimeline(type: string, triggerTime: Date, status: string) {
  const timeline = []
  const baseTime = triggerTime.getTime()
  
  timeline.push({
    time: new Date(baseTime).toISOString(),
    action: '事件触发',
    details: `接收到${type}相关信息`,
    actor: '系统',
    status: 'completed'
  })
  
  if (status !== 'failed') {
    timeline.push({
      time: new Date(baseTime + 60000).toISOString(),
      action: '数据验证',
      details: '验证事件信息和相关参数',
      actor: '系统',
      status: 'completed'
    })
    
    timeline.push({
      time: new Date(baseTime + 300000).toISOString(),
      action: '影响分析',
      details: '分析事件对数据的影响范围',
      actor: '系统',
      status: status === 'pending' ? 'pending' : 'completed'
    })
    
    if (status === 'completed') {
      timeline.push({
        time: new Date(baseTime + 600000).toISOString(),
        action: '数据更新',
        details: '更新相关数据表和字段',
        actor: '系统',
        status: 'completed'
      })
      
      timeline.push({
        time: new Date(baseTime + 900000).toISOString(),
        action: '验证完成',
        details: '数据更新验证通过',
        actor: '系统',
        status: 'completed'
      })
    } else if (status === 'processing') {
      timeline.push({
        time: new Date(baseTime + 600000).toISOString(),
        action: '数据更新',
        details: '正在更新相关数据',
        actor: '系统',
        status: 'processing'
      })
    }
  } else {
    timeline.push({
      time: new Date(baseTime + 60000).toISOString(),
      action: '验证失败',
      details: '事件信息验证失败',
      actor: '系统',
      status: 'failed'
    })
  }
  
  return timeline
}

function generateAffectedData(type: string) {
  const affectedTables: Record<string, any[]> = {
    '股票拆分': [
      { name: '股票基础信息表', fields: ['总股本', '流通股本'], recordsAffected: 1 },
      { name: '历史价格表', fields: ['开盘价', '收盘价', '最高价', '最低价'], recordsAffected: Math.floor(Math.random() * 2000) + 500 }
    ],
    '财报发布': [
      { name: '财务数据表', fields: ['营业收入', '净利润', '总资产'], recordsAffected: 1 },
      { name: '财务指标表', fields: ['ROE', 'ROA', '净利润率'], recordsAffected: 1 }
    ],
    '分红派息': [
      { name: '股票基础信息表', fields: ['股本结构'], recordsAffected: 1 },
      { name: '分红派息表', fields: ['分红金额', '除权日'], recordsAffected: 1 },
      { name: '历史价格表', fields: ['复权价格'], recordsAffected: Math.floor(Math.random() * 1500) + 300 }
    ],
    '股本变更': [
      { name: '股票基础信息表', fields: ['总股本', '流通股本'], recordsAffected: 1 },
      { name: '股本变更记录表', fields: ['变更原因', '变更数量'], recordsAffected: 1 }
    ],
    'ADR发行': [
      { name: 'ADR信息表', fields: ['ADR比例', '发行价格'], recordsAffected: 1 },
      { name: '股票基础信息表', fields: ['ADR状态'], recordsAffected: 1 }
    ],
    'ESG评级更新': [
      { name: 'ESG评分表', fields: ['环境评分', '社会评分', '治理评分'], recordsAffected: 1 },
      { name: 'ESG历史表', fields: ['评级历史'], recordsAffected: Math.floor(Math.random() * 50) + 10 }
    ]
  }
  
  return {
    tables: affectedTables[type] || [
      { name: '股票基础信息表', fields: ['基础信息'], recordsAffected: 1 }
    ]
  }
}

// 生成多源对比数据
export function generateCompareData() {
  const dataSources = ['Bloomberg', 'Reuters', 'Yahoo Finance', 'FactSet']
  const compareTypes = ['价格数据', '财务数据', '基础信息', '行情数据', 'ESG数据']
  
  return {
    summary: {
      totalComparisons: 1234,
      inconsistentRecords: 45,
      consistencyRate: 96.4,
      lastUpdateTime: new Date().toISOString()
    },
    dataSources,
    compareTypes,
    recentComparisons: generateRecentComparisons()
  }
}

function generateRecentComparisons() {
  const comparisons = []
  for (let i = 1; i <= 20; i++) {
    const stock = stockData[Math.floor(Math.random() * stockData.length)]
    const hasDiscrepancy = Math.random() > 0.7
    const compareTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    comparisons.push({
      id: i,
      stockCode: stock.code,
      stockName: stock.name,
      compareType: ['价格数据', '财务数据', '基础信息', 'ESG数据'][Math.floor(Math.random() * 4)],
      compareTime: compareTime.toISOString(),
      status: hasDiscrepancy ? 'inconsistent' : 'consistent',
      discrepancies: hasDiscrepancy ? generateDiscrepancies(stock) : [],
      dataSources: ['Bloomberg', 'Reuters', 'Yahoo Finance'].slice(0, Math.floor(Math.random() * 2) + 2)
    })
  }
  
  return comparisons.sort((a, b) => new Date(b.compareTime).getTime() - new Date(a.compareTime).getTime())
}

function generateDiscrepancies(stock: any) {
  const discrepancies = []
  const fieldNames = ['收盘价', '成交量', '市值', '市盈率', '总股本', 'ESG评分']
  const numDiscrepancies = Math.floor(Math.random() * 3) + 1
  
  for (let i = 0; i < numDiscrepancies; i++) {
    const field = fieldNames[Math.floor(Math.random() * fieldNames.length)]
    const baseValue = Math.random() * 200 + 50
    
    discrepancies.push({
      field,
      values: {
        'Bloomberg': baseValue.toFixed(2),
        'Reuters': (baseValue + Math.random() * 2 - 1).toFixed(2),
        'Yahoo Finance': (baseValue + Math.random() * 1.5 - 0.75).toFixed(2)
      },
      maxDifference: (Math.random() * 2).toFixed(2) + '%',
      threshold: '1.5%'
    })
  }
  
  return discrepancies
}

// 生成详细对比数据
export function generateDetailedCompareData(stockCode: string, compareType: string, dataSources: string[]) {
  const stock = stockData.find(s => s.code === stockCode) || stockData[0]
  
  const comparisonData = {
    stockInfo: stock,
    compareType,
    dataSources,
    compareTime: new Date().toISOString(),
    results: generateComparisonResults(compareType, dataSources),
    summary: {
      totalFields: 0,
      consistentFields: 0,
      inconsistentFields: 0,
      consistencyRate: 0
    }
  }
  
  comparisonData.summary.totalFields = comparisonData.results.length
  comparisonData.summary.consistentFields = comparisonData.results.filter(r => r.status === 'consistent').length
  comparisonData.summary.inconsistentFields = comparisonData.summary.totalFields - comparisonData.summary.consistentFields
  comparisonData.summary.consistencyRate = (comparisonData.summary.consistentFields / comparisonData.summary.totalFields * 100)
  
  return comparisonData
}

function generateComparisonResults(compareType: string, dataSources: string[]) {
  const fieldsByType: Record<string, string[]> = {
    '价格数据': ['开盘价', '收盘价', '最高价', '最低价', '成交量', '成交额'],
    '财务数据': ['营业收入', '净利润', '总资产', '净资产', '每股收益', '净资产收益率'],
    '基础信息': ['股票简称', '总股本', '流通股本', '上市日期', '行业分类'],
    '行情数据': ['涨跌幅', '换手率', '市盈率', '市净率', '总市值', '流通市值'],
    'ESG数据': ['环境评分', '社会评分', '治理评分', '综合评分', '评级等级']
  }
  
  const fields = fieldsByType[compareType] || fieldsByType['价格数据']
  const results = []
  
  for (const field of fields) {
    const isConsistent = Math.random() > 0.2
    const baseValue = Math.random() * 1000 + 10
    const values: Record<string, any> = {}
    
    dataSources.forEach(source => {
      if (isConsistent) {
        values[source] = baseValue.toFixed(2)
      } else {
        values[source] = (baseValue + Math.random() * 10 - 5).toFixed(2)
      }
    })
    
    results.push({
      field,
      values,
      status: isConsistent ? 'consistent' : 'inconsistent',
      difference: isConsistent ? '0%' : (Math.random() * 5).toFixed(2) + '%',
      threshold: '2.0%'
    })
  }
  
  return results
}