'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Descriptions,
  Progress,
  Switch,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

interface Rule {
  id: number
  name: string
  type: string
  description: string
  status: string
  config: any
  statistics: {
    totalExecutions: number
    triggeredCount: number
    accuracyRate: number
    lastExecution: string | null
  }
}

interface RuleData {
  data: Rule[]
  total: number
}

export default function RulesPage() {
  const [data, setData] = useState<RuleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/rules')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch rules:', error)
      message.error('获取规则数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRule = async (rule: Rule) => {
    try {
      await axios.post('/api/rules', {
        action: 'toggle',
        data: { id: rule.id, status: rule.status },
      })
      message.success(`规则已${rule.status === 'active' ? '暂停' : '启用'}`)
      fetchRules()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleTestRule = async (rule: Rule) => {
    try {
      message.loading('正在运行测试...', 0)
      const response = await axios.post('/api/rules', {
        action: 'test',
        data: { id: rule.id },
      })
      message.destroy()
      setTestResult(response.data.data.testResult)
      setTestModalVisible(true)
      message.success('测试运行完成')
    } catch (error) {
      message.destroy()
      message.error('测试运行失败')
    }
  }

  const handleSaveRule = async (values: any) => {
    try {
      const action = editingRule ? 'update' : 'create'
      const payload = {
        action,
        data: editingRule ? { ...editingRule, ...values } : values,
      }

      await axios.post('/api/rules', payload)
      message.success(editingRule ? '规则更新成功' : '规则创建成功')
      setModalVisible(false)
      setEditingRule(null)
      form.resetFields()
      fetchRules()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const showEditModal = (rule?: Rule) => {
    setEditingRule(rule || null)
    if (rule) {
      form.setFieldsValue({
        ...rule,
        ...rule.config,
      })
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      active: { color: 'green', icon: <CheckCircleOutlined />, text: '运行中' },
      paused: { color: 'orange', icon: <PauseCircleOutlined />, text: '已暂停' },
      draft: { color: 'blue', icon: <EditOutlined />, text: '草稿' },
    }
    const config = statusMap[status] || { color: 'default', icon: null, text: status }
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  const columns: ColumnsType<Rule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Rule) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          <span style={{ fontSize: 12, color: '#666' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '执行统计',
      key: 'statistics',
      width: 200,
      render: (_, record: Rule) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>
            执行: {record.statistics.totalExecutions} 次
          </span>
          <span style={{ fontSize: 12 }}>
            触发: {record.statistics.triggeredCount} 次
          </span>
        </Space>
      ),
    },
    {
      title: '准确率',
      key: 'accuracyRate',
      width: 150,
      render: (_, record: Rule) => (
        <Tooltip title={`准确率: ${record.statistics.accuracyRate}%`}>
          <Progress
            percent={record.statistics.accuracyRate}
            size="small"
            status={
              record.statistics.accuracyRate > 90
                ? 'success'
                : record.statistics.accuracyRate > 70
                ? 'normal'
                : 'exception'
            }
          />
        </Tooltip>
      ),
    },
    {
      title: '最后执行',
      key: 'lastExecution',
      width: 180,
      render: (_, record: Rule) => (
        <span style={{ fontSize: 12, color: '#666' }}>
          {record.statistics.lastExecution
            ? new Date(record.statistics.lastExecution).toLocaleString('zh-CN')
            : '未执行'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: Rule) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '暂停' : '启用'}>
            <Button
              type="text"
              icon={
                record.status === 'active' ? (
                  <PauseCircleOutlined />
                ) : (
                  <PlayCircleOutlined />
                )
              }
              onClick={() => handleToggleRule(record)}
            />
          </Tooltip>
          <Tooltip title="测试运行">
            <Button
              type="text"
              icon={<ExperimentOutlined />}
              onClick={() => handleTestRule(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个规则吗？"
            onConfirm={() => message.info('删除功能暂未实现')}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 统计信息
  const statistics = {
    total: data?.data.length || 0,
    active: data?.data.filter((r) => r.status === 'active').length || 0,
    paused: data?.data.filter((r) => r.status === 'paused').length || 0,
    avgAccuracy:
      data?.data.reduce((sum, r) => sum + r.statistics.accuracyRate, 0) /
        (data?.data.length || 1) || 0,
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 className="page-header">质检规则配置</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showEditModal()}>
          新建规则
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic title="规则总数" value={statistics.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="运行中"
              value={statistics.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="已暂停"
              value={statistics.paused}
              valueStyle={{ color: '#faad14' }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="平均准确率"
              value={statistics.avgAccuracy}
              precision={1}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={loading}
          pagination={{
            total: data?.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 规则编辑弹窗 */}
      <Modal
        title={editingRule ? '编辑规则' : '新建规则'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingRule(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveRule}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="规则名称"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="请输入规则名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="规则类型"
                rules={[{ required: true, message: '请选择规则类型' }]}
              >
                <Select placeholder="请选择规则类型">
                  <Option value="价格异常">价格异常</Option>
                  <Option value="数据缺失">数据缺失</Option>
                  <Option value="财务异常">财务异常</Option>
                  <Option value="多源差异">多源差异</Option>
                  <Option value="规则违反">规则违反</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="规则描述"
            rules={[{ required: true, message: '请输入规则描述' }]}
          >
            <TextArea rows={2} placeholder="请描述该规则的用途和检查逻辑" />
          </Form.Item>

          {/* 根据规则类型显示不同的配置项 */}
          <Form.Item
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const ruleType = getFieldValue('type')

              if (ruleType === '价格异常') {
                return (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="maxChangePercent"
                        label="最大涨幅(%)"
                        rules={[{ required: true, message: '请输入最大涨幅' }]}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          placeholder="10"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="minChangePercent"
                        label="最大跌幅(%)"
                        rules={[{ required: true, message: '请输入最大跌幅' }]}
                      >
                        <InputNumber
                          min={-100}
                          max={0}
                          placeholder="-10"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )
              }

              if (ruleType === '数据缺失') {
                return (
                  <Form.Item
                    name="requiredFields"
                    label="必填字段"
                    rules={[{ required: true, message: '请选择必填字段' }]}
                  >
                    <Select mode="multiple" placeholder="请选择必填字段">
                      <Option value="开盘价">开盘价</Option>
                      <Option value="收盘价">收盘价</Option>
                      <Option value="最高价">最高价</Option>
                      <Option value="最低价">最低价</Option>
                      <Option value="成交量">成交量</Option>
                      <Option value="成交额">成交额</Option>
                    </Select>
                  </Form.Item>
                )
              }

              if (ruleType === '财务异常') {
                return (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="minPE"
                        label="最小市盈率"
                        rules={[{ required: true, message: '请输入最小市盈率' }]}
                      >
                        <InputNumber placeholder="-100" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="maxPE"
                        label="最大市盈率"
                        rules={[{ required: true, message: '请输入最大市盈率' }]}
                      >
                        <InputNumber placeholder="200" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                )
              }

              return null
            }}
          </Form.Item>

          <Form.Item name="checkFrequency" label="检查频率" initialValue="realtime">
            <Select>
              <Option value="realtime">实时</Option>
              <Option value="hourly">每小时</Option>
              <Option value="daily">每日</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试结果弹窗 */}
      <Modal
        title="规则测试结果"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {testResult && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="执行时间">{testResult.executionTime}</Descriptions.Item>
            <Descriptions.Item label="处理记录数">
              {testResult.recordsProcessed}
            </Descriptions.Item>
            <Descriptions.Item label="发现异常数">
              {testResult.exceptionsFound}
            </Descriptions.Item>
            <Descriptions.Item label="样例异常">
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {testResult.sampleExceptions?.map((exception: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #f0f0f0',
                      background: index % 2 === 0 ? '#fafafa' : '#fff',
                    }}
                  >
                    <strong>{exception.stockCode}</strong>: {exception.message}
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}