'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Spin } from 'antd'
import {
  DatabaseOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'

interface DashboardData {
  summary: {
    totalStocks: number
    totalRecords: number
    lastUpdateTime: string
    systemStatus: string
  }
  exceptionTrend: Array<{
    date: string
    count: number
  }>
  recentExceptions: Array<{
    id: number
    stockCode: string
    stockName: string
    type: string
    severity: string
    message: string
    time: string
    status: string
  }>
  dataSourceStatus: Array<{
    name: string
    status: string
    lastSync: string
    reliability: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'blue',
    }
    return colors[severity] || 'default'
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'red', text: '待处理' },
      processing: { color: 'orange', text: '处理中' },
      resolved: { color: 'green', text: '已解决' },
    }
    const config = statusMap[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns: ColumnsType<any> = [
    {
      title: '股票信息',
      key: 'stock',
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
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity === 'high' ? '高' : severity === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '发现时间',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Link href={`/exceptions?id=${record.id}`} style={{ color: '#1890ff' }}>
          查看详情
        </Link>
      ),
    },
  ]

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data?.exceptionTrend.map(item => {
        const date = new Date(item.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: '异常数量',
    },
    series: [
      {
        name: '异常数量',
        type: 'line',
        smooth: true,
        data: data?.exceptionTrend.map(item => item.count),
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' },
            ],
          },
        },
      },
    ],
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!data) {
    return <div>加载失败</div>
  }

  return (
    <div>
      <h1 className="page-header">数据仪表盘</h1>

      {/* 概览统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="股票总数"
              value={data.summary.totalStocks}
              prefix={<DatabaseOutlined />}
              suffix="只"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="数据记录总数"
              value={data.summary.totalRecords}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="最后更新时间"
              value={new Date(data.summary.lastUpdateTime).toLocaleTimeString('zh-CN')}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="系统状态"
              value={data.summary.systemStatus === 'normal' ? '正常运行' : '异常'}
              prefix={
                data.summary.systemStatus === 'normal' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                )
              }
              valueStyle={{
                color: data.summary.systemStatus === 'normal' ? '#52c41a' : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和数据源状态 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="异常趋势" className="dashboard-card">
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="数据源状态" className="dashboard-card" styles={{ body: { height: 300 } }}>
            {data.dataSourceStatus.map((source, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: index < data.dataSourceStatus.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <Space>
                  <Tag color={source.status === 'online' ? 'green' : 'red'}>
                    {source.name}
                  </Tag>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    可靠性: {source.reliability}%
                  </span>
                </Space>
                <Space direction="vertical" align="end" size={0}>
                  <span style={{ fontSize: 12, color: source.status === 'online' ? '#52c41a' : '#ff4d4f' }}>
                    {source.status === 'online' ? '在线' : '离线'}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {new Date(source.lastSync).toLocaleTimeString('zh-CN')}
                  </span>
                </Space>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 最近异常 */}
      <Card 
        title="最近异常" 
        style={{ marginTop: 16 }}
        extra={<Link href="/exceptions">查看全部 →</Link>}
      >
        <Table
          columns={columns}
          dataSource={data.recentExceptions}
          rowKey="id"
          pagination={false}
          size="middle"
          className="exception-table"
          rowClassName={(record) => `severity-${record.severity}`}
        />
      </Card>
    </div>
  )
}