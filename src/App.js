import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate} from 'react-router-dom';
import {Row, Col, Button, Layout, Space, Dropdown} from 'antd';
import {UserOutlined, OrderedListOutlined, SettingOutlined, LogoutOutlined} from '@ant-design/icons';
import AuthModal from './components/AuthModal';
import { useAuth } from './auth/AuthContext';
import ProjectsPage from './pages/ProjectsPage';
import OrdersPage from './pages/OrdersPage';

import './App.css';
import OrderDetailsPage from "./pages/OrderDetailsPage";

const { Header, Content } = Layout;

const Navigation = () => {
    const { isAuthenticated, user, signOut, openAuthModal  } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const userMenuItems = [
        {
            key: 'orders',
            icon: <OrderedListOutlined />,
            label: 'Мои заказы',
            onClick: () => navigate('/orders')
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Настройки',
            onClick: () => navigate('/settings')
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: signOut,
        },
    ];


    return (
        <>
            <Header
                style={{
                    position: 'fixed',
                    zIndex: 1000,
                    width: '100%',
                    padding: '0 24px',
                    background: '#fff',
                    boxShadow: '0 2px 8px #f0f1f2'
                }}
            >
                <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                    <Col>
                        <Space align="center" size="middle">
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>
                                <Link to="/projects" style={{ color: 'inherit' }}>
                                    СтройКонтроль
                                </Link>
                            </div>

                            <div style={{ marginLeft: '20px' }}>
                                <Link to="/projects" style={{
                                    color: location.pathname === '/projects' ? 'var(--forest-green)' : 'rgba(0, 0, 0, 0.85)',
                                    fontWeight: location.pathname === '/projects' ? '500' : 'normal'
                                }}>
                                    Проекты
                                </Link>
                            </div>
                        </Space>
                    </Col>

                    <Col>
                        <Space align="center">
                            {!isAuthenticated ? (
                                <Button
                                    type="primary"
                                    icon={<UserOutlined />}
                                    onClick={() => openAuthModal('login')}
                                >
                                    Войти
                                </Button>
                            ) : (
                                <Dropdown
                                    menu={{ items: userMenuItems }}
                                    placement="bottomRight"
                                    trigger={['click']}
                                >
                                    <Button
                                        type="text"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            height: '40px',
                                            padding: '0 12px'
                                        }}
                                    >
                                        <UserOutlined />
                                        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                                            {user?.fullName || user?.login}
                                        </span>
                                    </Button>
                                </Dropdown>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Header>

        </>
    );
};

const AppContent = () => {

  return (
      <Layout style={{ minHeight: '100vh' }}>
          <Navigation />
          <Content style={{
              marginTop: 64,
              padding: '24px',
              background: '#f0f2f5'
          }}>
              <Routes>
                  <Route path="/" element={<ProjectsPage/>} />
                  <Route path="/projects" element={<ProjectsPage/>} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailsPage />} />
                  {/*<Route path="/construction/:objectId" element={<ConstructionPage />} />*/}
              </Routes>
          </Content>
          <AuthModal/>
      </Layout>
  );
};

const App = () => {
  return (
      <Router>
        <AppContent />
      </Router>
  );
};

export default App;