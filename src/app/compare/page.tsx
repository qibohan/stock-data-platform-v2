'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Modal,
  Form,
  Checkbox,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Descriptions,
  Divider,
  Alert,
  Tooltip,
  Tabs,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input
const { TabPane } = Tabs

interface Comparison {
  id: number
  stockCode: string
  stockName: string
  compareType: string
  compareTime: string
  status: string
  discrepancies: Array<{
    field: string
    values: Record<string, string>
    maxDifference: string
    threshold: string
  }>
  dataSources: string[]
}

interface CompareData {
  summary: {
    totalComparisons: number
    inconsistentRecords: number
    consistencyRate: number
    lastUpdateTime: string
  }
  dataSources: string[]
  compareTypes: string[]
  recentComparisons: Comparison[]
  total: number
}

interface DetailedCompareData {
  stockInfo: any
  compareType: string
  dataSources: string[]
  compareTime: string
  results: Array<{
    field: string
    values: Record<string, any>
    status: string
    difference: string
    threshold: string
  }>
  summary: {
    totalFields: number
    consistentFields: number
    inconsistentFields: number
    consistencyRate: number
  }
}

export default function ComparePage() {
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [compareModalVisible, setCompareModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailData, setDetailData] = useState<DetailedCompareData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    stockCode: '',
  })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCompareData()
  }, [filters])

  const fetchCompareData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.stockCode) params.append('stockCode', filters.stockCode)

      const response = await axios.get(`/api/compare?${params.toString()}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch compare data:', error)
      message.error('获取对比数据失败')
    } finally {
      setLoading(false)
    }
  }

  const startNewCompare = async (values: any) => {
    try {
      await axios.post('/api/compare', {
        action: 'startCompare',
        data: values,
      })
      message.success('对比任务已启动')
      setCompareModalVisible(false)
      form.resetFields()
      fetchCompareData()
    } catch (error) {
      message.error('启动对比失败')
    }
  }

  const showDetail = async (comparison: Comparison) => {
    setDetailLoading(true)
    setDetailModalVisible(true)
    try {
      const response = await axios.get('/api/compare', {
        params: {
          action: 'detail',
          stockCode: comparison.stockCode,
          compareType: comparison.compareType,
          dataSources: comparison.dataSources.join(','),
        },
      })
      setDetailData(response.data)
    } catch (error) {
      message.error('获取详细数据失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleAcceptDifference = async (field: string) => {
    try {
      await axios.post('/api/compare', {
        action: 'acceptDifference',
        data: { comparisonId: detailData?.stockInfo.code, field },
      })
      message.success('差异已标记为可接受')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCreateException = async (field: string) => {
    try {
      await axios.post('/api/compare', {
        action: 'createException',
        data: { 
          comparisonId: detailData?.stockInfo.code, 
          field,
          description: `字段 ${field} 存在数据源差异`
        },
      })
      message.success('异常记录已创建')
    } catch (error) {
      message.error('创建异常记录失败')
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'consistent' ? (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        一致
      </Tag>
    ) : (
      <Tag color="red" icon={<ExclamationCircleOutlined />}>
        差异
      </Tag>
    )
  }

  const getConsistencyColor = (rate: number) => {
    if (rate >= 95) return '#52c41a'
    if (rate >= 90) return '#faad14'
    return '#f5222d'
  }

  const columns: ColumnsType<Comparison> = [
    {
      title: '股票信息',
      key: 'stock',
      fixed: 'left',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{record.stockCode}</span>
          <span style={{ fontSize: 12, color: '#666' }}>{record.stockName}</span>
        </Space>
      ),
    },
    {
      title: '对比类型',
      dataIndex: 'compareType',
      key: 'compareType',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '数据源',
      dataIndex: 'dataSources',
      key: 'dataSources',
      width: 200,
      render: (sources: string[]) => (
        <Space wrap>
          {sources.map(source => <Tag key={source}>{source}</Tag>)}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '差异字段',
      key: 'discrepancies',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: record.discrepancies.length > 0 ? '#f5222d' : '#52c41a' }}>
            {record.discrepancies.length} 个差异
          </span>
          {record.discrepancies.length > 0 && (
            <span style={{ fontSize: 12, color: '#666' }}>
              最大差异: {record.discrepancies[0]?.maxDifference || '0%'}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '对比时间',
      dataIndex: 'compareTime',
      key: 'compareTime',
      width: 180,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(time).format('YYYY-MM-DD')}</span>
          <span style={{ fontSize: 12, color: '#666' }}>
            {dayjs(time).format('HH:mm:ss')}
          </span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.compareTime).getTime() - new Date(b.compareTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const consistencyTrendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
      name: '一致性率(%)',
      min: 90,
      max: 100,
    },
    series: [
      {
        name: '一致性率',
        type: 'line',
        smooth: true,
        data: [96.2, 97.1, 95.8, 98.3, 96.7, 97.5, 96.4],
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' },
            ],
          },
        },
      },
    ],
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-header">多源对比</h1>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setCompareModalVisible(true)}>
          发起新对比
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="对比总数"
              value={data?.summary.totalComparisons || 0}
              valueStyle={{ fontSize: 20 }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="不一致记录"
              value={data?.summary.inconsistentRecords || 0}
              valueStyle={{ color: '#cf1322', fontSize: 20 }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, color: '#00000073' }}>一致性率</div>
                <div style={{ fontSize: 20, color: getConsistencyColor(data?.summary.consistencyRate || 0) }}>
                  {(data?.summary.consistencyRate || 0).toFixed(1)}%
                </div>
              </div>
              <Progress
                type="circle"
                percent={data?.summary.consistencyRate || 0}
                width={40}
                strokeColor={getConsistencyColor(data?.summary.consistencyRate || 0)}
                format={() => ''}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="最后更新"
              value={data?.summary.lastUpdateTime ? dayjs(data.summary.lastUpdateTime).format('HH:mm') : '--'}
              valueStyle={{ fontSize: 16 }}
              suffix={data?.summary.lastUpdateTime ? dayjs(data.summary.lastUpdateTime).format('MM-DD') : ''}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和筛选 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="一致性趋势" className="dashboard-card">
            <ReactECharts option={consistencyTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="数据源状态" className="dashboard-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              {data?.dataSources.map((source, index) => (
                <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Tag color="blue">{source}</Tag>
                  <Space>
                    <span style={{ fontSize: 12, color: '#52c41a' }}>在线</span>
                    <Progress
                      percent={95 + Math.random() * 5}
                      size="small"
                      style={{ width: 60 }}
                      format={(percent) => `${percent?.toFixed(0)}%`}
                    />
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            style={{ width: 140 }}
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            placeholder="对比类型"
          >
            <Option value="all">全部类型</Option>
            {data?.compareTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>

          <Select
            style={{ width: 140 }}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            placeholder="状态"
          >
            <Option value="all">全部状态</Option>
            <Option value="consistent">一致</Option>
            <Option value="inconsistent">差异</Option>
          </Select>

          <Search
            placeholder="搜索股票代码或名称 (如: AAPL, 00700)"
            style={{ width: 200 }}
            value={filters.stockCode}
            onChange={(e) => setFilters({ ...filters, stockCode: e.target.value })}
            onSearch={() => fetchCompareData()}
            enterButton={<SearchOutlined />}
          />

          <Button icon={<ReloadOutlined />} onClick={fetchCompareData}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />}>导出</Button>
        </Space>
      </Card>

      {/* 对比结果列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.recentComparisons}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 发起新对比弹窗 */}
      <Modal
        title="发起新对比"
        open={compareModalVisible}
        onCancel={() => {
          setCompareModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={startNewCompare}>
          <Form.Item
            name="stockCodes"
            label="股票代码"
            rules={[{ required: true, message: '请输入股票代码' }]}
          >
                          <Select mode="tags" placeholder="输入股票代码，支持多选 (如: AAPL, 00700)">
              <Option value="000001">000001</Option>
              <Option value="000002">000002</Option>
              <Option value="600519">600519</Option>
              <Option value="000858">000858</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="compareType"
            label="对比类型"
            rules={[{ required: true, message: '请选择对比类型' }]}
          >
            <Select placeholder="选择对比类型">
              <Option value="价格数据">价格数据</Option>
              <Option value="财务数据">财务数据</Option>
              <Option value="基础信息">基础信息</Option>
              <Option value="行情数据">行情数据</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dataSources"
            label="数据源"
            rules={[{ required: true, message: '请选择至少两个数据源' }]}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="Wind">Wind</Checkbox>
                <Checkbox value="Bloomberg">Bloomberg</Checkbox>
                <Checkbox value="交易所">交易所</Checkbox>
                <Checkbox value="Choice">Choice</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 对比详情弹窗 */}
      <Modal
        title="对比详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {detailData && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="对比结果" key="1">
              <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="股票代码">
                  {detailData.stockInfo.code}
                </Descriptions.Item>
                <Descriptions.Item label="股票名称">
                  {detailData.stockInfo.name}
                </Descriptions.Item>
                <Descriptions.Item label="对比类型">
                  <Tag>{detailData.compareType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="数据源">
                  <Space>
                    {detailData.dataSources.map(source => <Tag key={source}>{source}</Tag>)}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="总字段数">
                  {detailData.summary.totalFields}
                </Descriptions.Item>
                <Descriptions.Item label="一致字段数">
                  <span style={{ color: '#52c41a' }}>{detailData.summary.consistentFields}</span>
                </Descriptions.Item>
                <Descriptions.Item label="不一致字段数">
                  <span style={{ color: '#f5222d' }}>{detailData.summary.inconsistentFields}</span>
                </Descriptions.Item>
                <Descriptions.Item label="一致性率">
                  <Progress
                    percent={detailData.summary.consistencyRate}
                    strokeColor={getConsistencyColor(detailData.summary.consistencyRate)}
                    style={{ width: '100px' }}
                  />
                </Descriptions.Item>
              </Descriptions>

              <Table
                size="small"
                loading={detailLoading}
                columns={[
                  { title: '字段名', dataIndex: 'field', key: 'field', width: 120 },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status', 
                    width: 80,
                    render: (status: string) => getStatusBadge(status)
                  },
                  { 
                    title: '数据源值', 
                    dataIndex: 'values', 
                    key: 'values',
                    render: (values: Record<string, any>) => (
                      <Space direction="vertical" size={0}>
                        {Object.entries(values).map(([source, value]) => (
                          <div key={source}>
                            <Tag>{source}</Tag>: {value}
                          </div>
                        ))}
                      </Space>
                    )
                  },
                  { title: '差异程度', dataIndex: 'difference', key: 'difference', width: 80 },
                  { title: '阈值', dataIndex: 'threshold', key: 'threshold', width: 80 },
                  {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    render: (_, record) => record.status === 'inconsistent' && (
                      <Space>
                        <Button 
                          size="small" 
                          onClick={() => handleAcceptDifference(record.field)}
                        >
                          接受差异
                        </Button>
                        <Button 
                          size="small" 
                          danger 
                          onClick={() => handleCreateException(record.field)}
                        >
                          创建异常
                        </Button>
                      </Space>
                    )
                  },
                ]}
                dataSource={detailData.results}
                rowKey="field"
                pagination={false}
                rowClassName={(record) => record.status === 'inconsistent' ? 'exception-table' : ''}
              />
            </TabPane>
            <TabPane tab="统计分析" key="2">
              <Alert
                message="对比分析"
                description={`共检查 ${detailData.summary.totalFields} 个字段，发现 ${detailData.summary.inconsistentFields} 个不一致项，一致性率为 ${detailData.summary.consistencyRate.toFixed(1)}%`}
                type="info"
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="字段一致性分布">
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={detailData.summary.consistencyRate}
                        strokeColor={getConsistencyColor(detailData.summary.consistencyRate)}
                        width={120}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="数据源对比">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {detailData.dataSources.map(source => (
                        <div key={source} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag>{source}</Tag>
                          <span style={{ color: '#52c41a' }}>可用</span>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  )
}