import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Button, Space, message, Empty, Spin, Typography, Tooltip } from 'antd';
import { EyeOutlined, PlusOutlined, HomeOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, CopyOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/http';
import './OrdersPage.css';

const { Title, Text } = Typography;

const OrdersPage = () => {
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 9,
        total: 0,
    });

    const fetchOrders = async (page = 1, size = 9) => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const response = await apiFetch('/orders', {
                token,
                method: 'GET',
                params: {
                    page: page - 1,
                    size,
                }
            });

            const sortedOrders = response.content
                ? [...response.content].sort((a, b) =>
                    a.id - b.id)
                : [];

            setOrders(sortedOrders);
            setPagination({
                current: response.currentPage + 1,
                pageSize: size,
                total: response.totalElements,
            });
        } catch (error) {
            message.error('Не удалось загрузить заказы');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [isAuthenticated, token]);

    const getStatusColor = (status) => {
        const colors = {
            SUBMITTED: 'blue',
            IN_REVIEW: 'orange',
            APPROVED: 'green',
            DECLINED: 'red',
            CONVERTED_TO_OBJECT: 'cyan',
            COMPLETED: 'purple',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            SUBMITTED: 'Отправлена',
            IN_REVIEW: 'На рассмотрении',
            APPROVED: 'Одобрена',
            DECLINED: 'Отклонена',
            CONVERTED_TO_OBJECT: 'В строительстве',
            COMPLETED: 'Завершена',
        };
        return texts[status] || status;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                message.success('ID скопирован в буфер обмена');
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
            });
    };

    const OrderCard = ({ order }) => {
        const hasTimeline = order.requestedTimeline && order.requestedTimeline.trim() !== '';

        return (
            <Col xs={24} sm={12} lg={8} key={order.id}>
                <Card
                    hoverable
                    className="order-card"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    style={{
                        height: '100%',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div className="order-header">
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                <Title level={4} style={{
                                    margin: 0,
                                    color: '#0c3f5f',
                                    marginRight: 8
                                }}>
                                    Заявка #{order.id}
                                </Title>
                                <Tooltip title="Копировать ID">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(order.id.toString());
                                        }}
                                        style={{
                                            padding: '0 4px',
                                            height: 'auto',
                                            minWidth: 'auto'
                                        }}
                                    />
                                </Tooltip>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                     {formatDate(order.submittedAt)}
                                </Text>
                            </div>
                        </div>
                        <Tag color={getStatusColor(order.status)} style={{ marginLeft: 8 }}>
                            {getStatusText(order.status)}
                        </Tag>
                    </div>

                    <div className="order-info" style={{ flex: 1 }}>
                        <div style={{ marginBottom: 12 }}>
                            <Title level={5} style={{
                                marginBottom: 4,
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <HomeOutlined style={{ marginRight: 8, color: '#1f7a3d' }} />
                                {order.projectTemplateName}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                {order.address}
                            </Text>
                        </div>

                        {hasTimeline && (
                            <div style={{ marginBottom: 12 }}>
                                <Text style={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                    <span><strong>Желаемый срок:</strong> {order.requestedTimeline}</span>
                                </Text>
                            </div>
                        )}

                        <div style={{ marginBottom: hasTimeline ? 12 : 'auto' }}>
                            <Space direction="vertical" size={6}>
                                <Text style={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                    <span><strong>Тел:</strong> {order.phone}</span>
                                </Text>
                                <Text style={{ display: 'flex', alignItems: 'center' }}>
                                    <MailOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                                    <span><strong>Email:</strong> {order.email}</span>
                                </Text>
                            </Space>
                        </div>
                    </div>

                    <div className="order-actions" style={{
                        marginTop: 'auto',
                        paddingTop: 16
                    }}>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${order.id}`);
                            }}
                            block
                        >
                            Подробнее
                        </Button>
                    </div>
                </Card>
            </Col>
        );
    };

    if (!isAuthenticated) {
        return (
            <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '10px' }}>
                <Empty
                    description="Войдите в систему, чтобы просмотреть свои заказы"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                    type="primary"
                    onClick={() => navigate('/projects')}
                    style={{ marginTop: 16 }}
                >
                    Перейти к проектам
                </Button>
            </Card>
        );
    }

    const handlePageChange = (page) => {
        fetchOrders(page, pagination.pageSize);
    };

    return (
        <div className="orders-page">
            <div className="orders-header">
                <div>
                    <Title level={2}>Мои заказы</Title>
                    <Text type="secondary">
                        Всего заказов: {pagination.total}
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/projects')}
                    size="large"
                >
                    Новый заказ
                </Button>
            </div>

            <Spin spinning={loading}>
                {orders.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '10px' }}>
                        <Empty
                            description="У вас пока нет заказов"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                        <Button
                            type="primary"
                            onClick={() => navigate('/projects')}
                            style={{ marginTop: 16 }}
                        >
                            Создать первый заказ
                        </Button>
                    </Card>
                ) : (
                    <>
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            {orders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </Row>

                        {pagination.total > pagination.pageSize && (
                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                <Button
                                    onClick={() => handlePageChange(pagination.current - 1)}
                                    disabled={pagination.current === 1}
                                    style={{ marginRight: 8 }}
                                >
                                    Назад
                                </Button>
                                <span style={{ margin: '0 8px' }}>
                                    Страница {pagination.current} из {Math.ceil(pagination.total / pagination.pageSize)}
                                </span>
                                <Button
                                    onClick={() => handlePageChange(pagination.current + 1)}
                                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                >
                                    Вперед
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Spin>
        </div>
    );
};

export default OrdersPage;