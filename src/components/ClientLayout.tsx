'use client'

import React, { useState, ReactNode } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  SearchOutlined,
  SwapOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const { Header, Sider, Content } = Layout

interface ClientLayoutProps {
  children: ReactNode
}

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: <Link href="/">数据仪表盘</Link>,
  },
  {
    key: '/exceptions',
    icon: <ExclamationCircleOutlined />,
    label: <Link href="/exceptions">异常处理</Link>,
  },
  {
    key: '/rules',
    icon: <SettingOutlined />,
    label: <Link href="/rules">质检规则</Link>,
  },
  {
    key: '/events',
    icon: <SearchOutlined />,
    label: <Link href="/events">事件追溯</Link>,
  },
  {
    key: '/compare',
    icon: <SwapOutlined />,
    label: <Link href="/compare">多源对比</Link>,
  },
]

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          transition: 'all 0.2s',
        }}>
          {collapsed ? 'SDP' : '股票数据中台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{
          padding: 0,
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: {
              fontSize: '18px',
              padding: '0 24px',
              cursor: 'pointer',
              transition: 'color 0.3s',
            },
          })}
          <div style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 500 }}>
            股票数据质量管理平台
          </div>
        </Header>
        
        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}