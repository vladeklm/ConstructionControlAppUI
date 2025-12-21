import {Button, Card, Col, Space, Tag, Typography} from "antd";
import { useNavigate } from 'react-router-dom';
import Title from "antd/es/skeleton/Title";
import {CalendarOutlined, EyeOutlined, HomeOutlined, MailOutlined, PhoneOutlined} from "@ant-design/icons";
const {  Text } = Typography;

const OrderCard = ({ order }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

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
                    <div>
                        <Title level={4} style={{ margin: 0, color: '#0c3f5f' }}>
                            Заявка #{order.id}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatDate(order.submittedAt)}
                        </Text>
                    </div>
                    <Tag color={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                    </Tag>
                </div>

                <div className="order-info" style={{ flex: 1 }}>
                    <div style={{ marginBottom: 12 }}>
                        <Title level={5} style={{ marginBottom: 4, fontSize: '16px' }}>
                            <HomeOutlined style={{ marginRight: 8 }} />
                            {order.projectTemplateName}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            {order.address}
                        </Text>
                    </div>

                    {hasTimeline && (
                        <div style={{ marginBottom: 12 }}>
                            <Text>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Срок: {order.requestedTimeline}
                            </Text>
                        </div>
                    )}

                    <div style={{ marginBottom: hasTimeline ? 12 : 'auto' }}>
                        <Space direction="vertical" size={4}>
                            <Text>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {order.phone}
                            </Text>
                            <Text>
                                <MailOutlined style={{ marginRight: 8 }} />
                                {order.email}
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

export default OrderCard;