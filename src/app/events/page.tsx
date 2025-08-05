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
  DatePicker,
  Modal,
  Timeline,
  Descriptions,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Divider,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  RedoOutlined,
  RollbackOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input
const { RangePicker } = DatePicker

interface Event {
  id: number
  type: string
  stockCode: string
  stockName: string
  description: string
  triggerTime: string
  status: string
  timeline: Array<{
    time: string
    action: string
    details: string
    actor: string
    status: string
  }>
  affectedData: {
    tables: Array<{
      name: string
      fields: string[]
      recordsAffected: number
    }>
  }
  impact: {
    severity: string
    recordsAffected: number
    duration: string
  }
}

interface EventData {
  data: Event[]
  total: number
  filters: {
    types: string[]
    statuses: string[]
  }
  summary: {
    total: number
    completed: number
    processing: number
    failed: number
    pending: number
  }
}

export default function EventsPage() {
  const [data, setData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    stockCode: '',
    dateRange: null as any,
  })

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.stockCode) params.append('stockCode', filters.stockCode)
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await axios.get(`/api/events?${params.toString()}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      message.error('获取事件数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryEvent = async (eventId: number) => {
    try {
      await axios.post('/api/events', {
        action: 'retry',
        id: eventId,
      })
      message.success('事件已重新开始处理')
      fetchEvents()
    } catch (error) {
      message.error('重试失败')
    }
  }

  const handleRollback = async (eventId: number) => {
    try {
      await axios.post('/api/events', {
        action: 'rollback',
        id: eventId,
      })
      message.success('回滚操作已完成')
      fetchEvents()
    } catch (error) {
      message.error('回滚失败')
    }
  }

  const showEventDetail = (event: Event) => {
    setSelectedEvent(event)
    setDetailModalVisible(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: any; text: string; icon: React.ReactNode }> = {
      completed: { status: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      processing: { status: 'processing', text: '处理中', icon: <SyncOutlined spin /> },
      failed: { status: 'error', text: '失败', icon: <CloseCircleOutlined /> },
      pending: { status: 'warning', text: '等待中', icon: <ClockCircleOutlined /> },
    }
    const config = statusMap[status] || { status: 'default', text: status, icon: null }
    return <Badge status={config.status} text={config.text} />
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    }
    return colors[severity] || 'default'
  }

  const getTimelineIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      processing: <SyncOutlined spin style={{ color: '#1890ff' }} />,
      failed: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    }
    return icons[status] || <ClockCircleOutlined />
  }

  const columns: ColumnsType<Event> = [
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
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '事件描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '影响程度',
      key: 'impact',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={getSeverityColor(record.impact.severity)}>
            {record.impact.severity === 'high' ? '高' : record.impact.severity === 'medium' ? '中' : '低'}
          </Tag>
          <span style={{ fontSize: 12, color: '#666' }}>
            {record.impact.recordsAffected} 条记录
          </span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 180,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <span>{dayjs(time).format('YYYY-MM-DD')}</span>
          <span style={{ fontSize: 12, color: '#666' }}>
            {dayjs(time).format('HH:mm:ss')}
          </span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.triggerTime).getTime() - new Date(b.triggerTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showEventDetail(record)} />
          </Tooltip>
          {record.status === 'failed' && (
            <Tooltip title="重试处理">
              <Button
                type="text"
                icon={<RedoOutlined />}
                onClick={() => handleRetryEvent(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'completed' && (
            <Tooltip title="数据回滚">
              <Button
                type="text"
                icon={<RollbackOutlined />}
                onClick={() => handleRollback(record.id)}
                danger
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 className="page-header">事件追溯</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="事件总数"
              value={data?.summary.total || 0}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={data?.summary.completed || 0}
              valueStyle={{ color: '#3f8600', fontSize: 20 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={data?.summary.processing || 0}
              valueStyle={{ color: '#1890ff', fontSize: 20 }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card size="small">
            <Statistic
              title="失败"
              value={data?.summary.failed || 0}
              valueStyle={{ color: '#cf1322', fontSize: 20 }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card size="small">
            <Statistic
              title="等待中"
              value={data?.summary.pending || 0}
              valueStyle={{ color: '#faad14', fontSize: 20 }}
              prefix={<ClockCircleOutlined />}
            />
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
            placeholder="事件类型"
          >
            <Option value="all">全部类型</Option>
            {data?.filters.types.map((type) => (
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
            <Option value="completed">已完成</Option>
            <Option value="processing">处理中</Option>
            <Option value="failed">失败</Option>
            <Option value="pending">等待中</Option>
          </Select>

          <RangePicker
            style={{ width: 280 }}
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            placeholder={['开始日期', '结束日期']}
          />

          <Search
            placeholder="搜索股票代码或名称 (如: AAPL, 00700)"
            style={{ width: 200 }}
            value={filters.stockCode}
            onChange={(e) => setFilters({ ...filters, stockCode: e.target.value })}
            onSearch={() => fetchEvents()}
            enterButton={<SearchOutlined />}
          />

          <Button icon={<ReloadOutlined />} onClick={fetchEvents}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />}>导出</Button>
        </Space>
      </Card>

      {/* 事件列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 事件详情弹窗 */}
      <Modal
        title="事件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedEvent?.status === 'failed' && (
            <Button
              key="retry"
              type="primary"
              onClick={() => {
                if (selectedEvent) {
                  handleRetryEvent(selectedEvent.id)
                  setDetailModalVisible(false)
                }
              }}
            >
              重试处理
            </Button>
          ),
          selectedEvent?.status === 'completed' && (
            <Button
              key="rollback"
              danger
              onClick={() => {
                if (selectedEvent) {
                  handleRollback(selectedEvent.id)
                  setDetailModalVisible(false)
                }
              }}
            >
              数据回滚
            </Button>
          ),
        ]}
        width={900}
      >
        {selectedEvent && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="股票代码">
                {selectedEvent.stockCode}
              </Descriptions.Item>
              <Descriptions.Item label="股票名称">
                {selectedEvent.stockName}
              </Descriptions.Item>
              <Descriptions.Item label="事件类型">
                <Tag>{selectedEvent.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                {getStatusBadge(selectedEvent.status)}
              </Descriptions.Item>
              <Descriptions.Item label="影响程度">
                <Tag color={getSeverityColor(selectedEvent.impact.severity)}>
                  {selectedEvent.impact.severity === 'high' ? '高' : selectedEvent.impact.severity === 'medium' ? '中' : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="影响记录数">
                {selectedEvent.impact.recordsAffected} 条
              </Descriptions.Item>
              <Descriptions.Item label="处理时长">
                {selectedEvent.impact.duration}
              </Descriptions.Item>
              <Descriptions.Item label="触发时间">
                {dayjs(selectedEvent.triggerTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="事件描述" span={2}>
                {selectedEvent.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider>处理时间线</Divider>
            <Timeline>
              {selectedEvent.timeline.map((item, index) => (
                <Timeline.Item key={index} dot={getTimelineIcon(item.status)}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.action}</div>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                      {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')} - {item.actor}
                    </div>
                    <div>{item.details}</div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>

            <Divider>影响范围</Divider>
            <Table
              size="small"
              columns={[
                { title: '数据表名', dataIndex: 'name', key: 'name' },
                { 
                  title: '影响字段', 
                  dataIndex: 'fields', 
                  key: 'fields',
                  render: (fields: string[]) => fields.map(field => <Tag key={field}>{field}</Tag>)
                },
                { title: '影响记录数', dataIndex: 'recordsAffected', key: 'recordsAffected' },
              ]}
              dataSource={selectedEvent.affectedData.tables}
              rowKey="name"
              pagination={false}
            />
          </>
        )}
      </Modal>
    </div>
  )
}