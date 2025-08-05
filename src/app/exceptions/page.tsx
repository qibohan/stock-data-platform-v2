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
  Descriptions,
  Alert,
  message,
  Row,
  Col,
  Badge,
  Divider,
} from 'antd'
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FilterOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input

interface Exception {
  id: number
  stockCode: string
  stockName: string
  type: string
  severity: string
  message: string
  time: string
  status: string
  details?: any
}

interface ExceptionData {
  data: Exception[]
  total: number
  filters: {
    types: string[]
    severities: string[]
    statuses: string[]
  }
}

export default function ExceptionsPage() {
  const [data, setData] = useState<ExceptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedException, setSelectedException] = useState<Exception | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all',
    search: '',
  })

  useEffect(() => {
    fetchExceptions()
  }, [filters])

  const fetchExceptions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.severity !== 'all') params.append('severity', filters.severity)
      if (filters.status !== 'all') params.append('status', filters.status)

      const response = await axios.get(`/api/exceptions?${params.toString()}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch exceptions:', error)
      message.error('获取异常数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axios.post('/api/exceptions', {
        action: 'updateStatus',
        id,
        data: { status },
      })
      message.success('状态更新成功')
      fetchExceptions()
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const handleBatchUpdate = async (status: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要处理的异常')
      return
    }

    try {
      await axios.post('/api/exceptions', {
        action: 'batchUpdate',
        data: { ids: selectedRowKeys, status },
      })
      message.success(`已批量处理 ${selectedRowKeys.length} 条异常`)
      setSelectedRowKeys([])
      fetchExceptions()
    } catch (error) {
      message.error('批量处理失败')
    }
  }

  const showExceptionDetail = (record: Exception) => {
    setSelectedException(record)
    setDetailModalVisible(true)
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    }
    return colors[severity] || 'default'
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { status: any; text: string }> = {
      pending: { status: 'error', text: '待处理' },
      processing: { status: 'processing', text: '处理中' },
      resolved: { status: 'success', text: '已解决' },
    }
    const config = statusMap[status] || { status: 'default', text: status }
    return <Badge status={config.status} text={config.text} />
  }

  const columns: ColumnsType<Exception> = [
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
      title: '异常类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity === 'high' ? '高' : severity === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '异常描述',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '发现时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
      sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => showExceptionDetail(record)}>
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'processing')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'resolved')}
            >
              标记解决
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys)
    },
  }

  // 统计信息
  const statistics = {
    total: data?.total || 0,
    pending: data?.data.filter((item) => item.status === 'pending').length || 0,
    processing: data?.data.filter((item) => item.status === 'processing').length || 0,
    resolved: data?.data.filter((item) => item.status === 'resolved').length || 0,
  }

  return (
    <div>
      <h1 className="page-header">异常处理</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="总异常数"
              value={statistics.total}
              valueStyle={{ fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={statistics.pending}
              valueStyle={{ color: '#cf1322', fontSize: 24 }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={statistics.processing}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="已解决"
              value={statistics.resolved}
              valueStyle={{ color: '#3f8600', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
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
            placeholder="异常类型"
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
            value={filters.severity}
            onChange={(value) => setFilters({ ...filters, severity: value })}
            placeholder="严重程度"
          >
            <Option value="all">全部严重程度</Option>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="low">低</Option>
          </Select>

          <Select
            style={{ width: 140 }}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            placeholder="状态"
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="resolved">已解决</Option>
          </Select>

          <Search
            placeholder="搜索股票代码或名称"
            style={{ width: 240 }}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            enterButton={<SearchOutlined />}
          />

          <Button icon={<SyncOutlined />} onClick={fetchExceptions}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />}>导出</Button>
        </Space>
      </Card>

      {/* 批量操作 */}
      {selectedRowKeys.length > 0 && (
        <Alert
          message={
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Button size="small" onClick={() => handleBatchUpdate('processing')}>
                批量开始处理
              </Button>
              <Button size="small" onClick={() => handleBatchUpdate('resolved')}>
                批量标记解决
              </Button>
              <Button size="small" danger onClick={() => setSelectedRowKeys([])}>
                取消选择
              </Button>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 异常列表 */}
      <Card>
        <Table
          rowSelection={rowSelection}
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
          className="exception-table"
          rowClassName={(record) => `severity-${record.severity}`}
        />
      </Card>

      {/* 异常详情弹窗 */}
      <Modal
        title="异常详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          selectedException?.status === 'pending' && (
            <Button
              key="process"
              type="primary"
              onClick={() => {
                if (selectedException) {
                  handleStatusUpdate(selectedException.id, 'processing')
                  setDetailModalVisible(false)
                }
              }}
            >
              开始处理
            </Button>
          ),
          selectedException?.status === 'processing' && (
            <Button
              key="resolve"
              type="primary"
              onClick={() => {
                if (selectedException) {
                  handleStatusUpdate(selectedException.id, 'resolved')
                  setDetailModalVisible(false)
                }
              }}
            >
              标记解决
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedException && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="股票代码">
                {selectedException.stockCode}
              </Descriptions.Item>
              <Descriptions.Item label="股票名称">
                {selectedException.stockName}
              </Descriptions.Item>
              <Descriptions.Item label="异常类型">
                <Tag>{selectedException.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="严重程度">
                <Tag color={getSeverityColor(selectedException.severity)}>
                  {selectedException.severity === 'high'
                    ? '高'
                    : selectedException.severity === 'medium'
                    ? '中'
                    : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                {getStatusBadge(selectedException.status)}
              </Descriptions.Item>
              <Descriptions.Item label="发现时间">
                {new Date(selectedException.time).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="异常描述" span={2}>
                {selectedException.message}
              </Descriptions.Item>
            </Descriptions>

            {selectedException.details && (
              <>
                <Divider />
                <h4>详细信息</h4>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {JSON.stringify(selectedException.details, null, 2)}
                </pre>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}