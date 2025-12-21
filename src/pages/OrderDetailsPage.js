import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Steps,
    Tabs,
    Tag,
    Button,
    Space,
    Descriptions,
    Typography,
    Image,
    Spin,
    message,
    Timeline,
    Divider,
    Badge,
    Empty, Progress
} from 'antd';
import {
    HomeOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    BuildOutlined, CheckSquareOutlined, SafetyCertificateOutlined, ToolOutlined, PauseCircleOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import {getOrderById, getProjectById} from '../api/ordersApi';
import './OrderDetailsPage.css';

const {Title, Text, Paragraph} = Typography;
const {Step} = Steps;
const {TabPane} = Tabs;

const mockStages = [
    {
        id: 1,
        name: 'Подготовка документов',
        type: 'DOCS_APPROVAL',
        status: 'COMPLETED',
        progress: 100,
        description: 'Согласование договора и сметы',
        startDate: '2024-01-15',
        endDate: '2024-01-30',
        documents: 5,
        documentsSigned: 5
    },
    {
        id: 2,
        name: 'Фундамент',
        type: 'FOUNDATION',
        status: 'IN_PROGRESS',
        progress: 75,
        description: 'Земляные работы и заливка фундамента',
        startDate: '2024-02-01',
        endDate: '2024-03-15',
        documents: 3,
        documentsSigned: 2
    },
    {
        id: 3,
        name: 'Стены и кровля',
        type: 'WALLS_ROOF',
        status: 'NOT_STARTED',
        progress: 0,
        description: 'Возведение стен и монтаж кровли',
        startDate: '2024-03-20',
        endDate: '2024-05-10'
    },
    {
        id: 4,
        name: 'Отделочные работы',
        type: 'FINISHING',
        status: 'NOT_STARTED',
        progress: 0,
        description: 'Внутренняя и внешняя отделка',
        startDate: '2024-05-15',
        endDate: '2024-07-30'
    },
    {
        id: 5,
        name: 'Сдача объекта',
        type: 'HANDOVER',
        status: 'NOT_STARTED',
        progress: 0,
        description: 'Финальная приемка и передача ключей',
        startDate: '2024-08-01',
        endDate: '2024-08-15'
    }
];

const OrderDetailsPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stages, setStages] = useState(mockStages);
    const [activeStageIndex, setActiveStageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const orderData = await getOrderById(id);
            setOrder(orderData);

            if (orderData.projectTemplateId) {
                const projectData = await getProjectById(orderData.projectTemplateId);
                setProject(projectData);
            }

            // Mock stages data (in real app, fetch from API)

            setStages(mockStages);

            // Find active stage
            const activeIndex = mockStages.findIndex(stage => stage.status === 'IN_PROGRESS');
            setActiveStageIndex(activeIndex >= 0 ? activeIndex : 0);

        } catch (error) {
            message.error('Ошибка при загрузке данных заказа');
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            SUBMITTED: 'blue',
            IN_REVIEW: 'orange',
            APPROVED: 'green',
            DECLINED: 'red',
            CONVERTED_TO_OBJECT: 'cyan',
            COMPLETED: 'purple',
            IN_PROGRESS: 'green',
            NOT_STARTED: 'default',
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
            IN_PROGRESS: 'В процессе',
            NOT_STARTED: 'Не начат',
        };
        return texts[status] || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStageStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleOutlined style={{color: '#52c41a'}}/>;
            case 'IN_PROGRESS':
                return <ClockCircleOutlined style={{color: '#1890ff'}}/>;
            default:
                return <ClockCircleOutlined/>;
        }
    };

    const handleStageClick = (index) => {
        setActiveStageIndex(index);
        setActiveTab('overview');
    };

    const renderProjectInfo = () => (
        <Card className="project-info-card">
            {project?.media?.[0]?.url ? (
                <Image
                    src={project.media[0].url}
                    alt={project.name}
                    style={{width: '100%', borderRadius: '8px', marginBottom: '16px'}}
                    preview={false}
                />
            ) : (
                <div className="project-image-placeholder">
                    <HomeOutlined style={{fontSize: '48px', color: '#d9d9d9'}}/>
                </div>
            )}

            <Title level={4}>{project?.name || order?.projectTemplateName}</Title>

            <Descriptions column={1} size="small">
                <Descriptions.Item label="Общая площадь">
                    <Text strong>{project?.totalArea || 0} м²</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Этажность">
                    <Text strong>{project?.floors || 0}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Материалы">
                    <Text strong>{project?.mainMaterials || 'Не указано'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Базовая стоимость">
                    <Text strong style={{color: '#1f7a3d'}}>
                        {project?.basePrice ? project.basePrice.toLocaleString('ru-RU') : '0'} ₽
                    </Text>
                </Descriptions.Item>
            </Descriptions>

            {project?.description && (
                <div style={{marginTop: '16px'}}>
                    <Text type="secondary">{project.description}</Text>
                </div>
            )}
        </Card>
    );

    const renderOrderInfo = () => (
        <Card className="order-info-card">
            <Space direction="vertical" size="middle" style={{width: '100%'}}>
                <div className="order-header-section">
                    <Title level={3} style={{margin: 0}}>Заявка #{order?.id}</Title>
                    <Tag color={getStatusColor(order?.status)} style={{fontSize: '14px', padding: '4px 8px'}}>
                        {getStatusText(order?.status)}
                    </Tag>
                </div>

                <Divider style={{margin: '12px 0'}}/>

                <Space direction="vertical" size="small" style={{width: '100%'}}>
                    <div className="info-item">
                        <EnvironmentOutlined style={{marginRight: '8px', color: '#1f7a3d'}}/>
                        <Text strong>Адрес строительства:</Text>
                        <Text style={{marginLeft: '8px'}}>{order?.address || 'Не указано'}</Text>
                    </div>

                    <div className="info-item">
                        <CalendarOutlined style={{marginRight: '8px', color: '#1890ff'}}/>
                        <Text strong>Желаемый срок:</Text>
                        <Text style={{marginLeft: '8px'}}>
                            {order?.requestedTimeline || 'Не указан'}
                        </Text>
                    </div>

                    <div className="info-item">
                        <CalendarOutlined style={{marginRight: '8px', color: '#722ed1'}}/>
                        <Text strong>Дата подачи:</Text>
                        <Text style={{marginLeft: '8px'}}>{formatDate(order?.submittedAt)}</Text>
                    </div>

                    <Divider style={{margin: '12px 0'}}/>

                    <Title level={5}>Контактная информация</Title>

                    <div className="info-item">
                        <PhoneOutlined style={{marginRight: '8px', color: '#52c41a'}}/>
                        <Text strong>Телефон:</Text>
                        <Text style={{marginLeft: '8px'}}>{order?.phone || 'Не указан'}</Text>
                    </div>

                    <div className="info-item">
                        <MailOutlined style={{marginRight: '8px', color: '#fa8c16'}}/>
                        <Text strong>Email:</Text>
                        <Text style={{marginLeft: '8px'}}>{order?.email || 'Не указан'}</Text>
                    </div>
                </Space>

                <Divider style={{margin: '12px 0'}}/>

                <Button
                    type="primary"
                    block
                    onClick={() => message.info('Чат будет реализован позже')}
                    icon={<TeamOutlined/>}
                >
                    Открыть чат с менеджером
                </Button>

                <Button
                    block
                    onClick={() => navigate('/orders')}
                    icon={<ArrowLeftOutlined/>}
                >
                    Вернуться к списку заказов
                </Button>
            </Space>
        </Card>
    );

    const renderStagesSteps = () => {
        const stageStatusConfig = {
            NOT_STARTED: { color: 'default', icon: <ClockCircleOutlined />, text: 'Не начат' },
            IN_PROGRESS: { color: 'processing', icon: <PlayCircleOutlined />, text: 'В процессе' },
            COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Завершен' },
            PAUSED: { color: 'warning', icon: <PauseCircleOutlined />, text: 'Приостановлен' }
        };

        const stageTypeIcons = {
            DOCS_APPROVAL: <FileTextOutlined />,
            FOUNDATION: <ToolOutlined />,
            WALLS_ROOF: <BuildOutlined />,
            FINISHING: <CheckSquareOutlined />,
            HANDOVER: <SafetyCertificateOutlined />
        };

        const stageTypeNames = {
            DOCS_APPROVAL: 'Согласование',
            FOUNDATION: 'Фундамент',
            WALLS_ROOF: 'Стены/Кровля',
            FINISHING: 'Отделка',
            HANDOVER: 'Сдача'
        };

        if (!stages || stages.length === 0) {
            return (
                <Card style={{ marginBottom: '24px' }}>
                    <Empty description="Этапы строительства не определены" />
                </Card>
            );
        }

        const stepItems = stages.map((stage, index) => {
            const statusConfig = stageStatusConfig[stage.status] || stageStatusConfig.NOT_STARTED;
            const stageTypeIcon = stageTypeIcons[stage.type] || <BuildOutlined />;
            const stageTypeName = stageTypeNames[stage.type] || stage.type;

            const stepStatus =
                stage.status === 'COMPLETED' ? 'finish' :
                    stage.status === 'IN_PROGRESS' ? 'process' :
                        stage.status === 'PAUSED' ? 'wait' : 'wait';

            return {
                key: stage.id,
                title: (
                    <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleStageClick(index)}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px'
                        }}>
                            {stageTypeIcon}
                            <Text strong>{stageTypeName}</Text>
                        </div>
                        <div>
                            <Tag
                                color={statusConfig.color}
                                style={{ marginRight: '4px' }}
                            >
                                {statusConfig.text}
                            </Tag>
                            <Progress
                                percent={stage.progress || 0}
                                size="small"
                                showInfo={false}
                                strokeWidth={6}
                            />
                        </div>
                    </div>
                ),
                description: (
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <Text type="secondary">
                            {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Прогресс: {stage.progress || 0}%
                        </Text>
                    </div>
                ),
                status: stepStatus,
                icon: statusConfig.icon
            };
        });

        return (
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BuildOutlined />
                        <span>Этапы строительства</span>
                        <Tag color="blue">{stages.length} этапов</Tag>
                    </div>
                }
                style={{ marginBottom: '24px' }}
                bodyStyle={{ padding: '24px' }}
            >
                <Steps
                    current={activeStageIndex}
                    labelPlacement="vertical"
                    size="small"
                    items={stepItems}
                />

                {/* Легенда статусов */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '24px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#52c41a', borderRadius: '50%' }} />
                        <Text type="secondary">Завершено</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#1890ff', borderRadius: '50%' }} />
                        <Text type="secondary">В процессе</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#d9d9d9', borderRadius: '50%' }} />
                        <Text type="secondary">Не начат</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#faad14', borderRadius: '50%' }} />
                        <Text type="secondary">Приостановлен</Text>
                    </div>
                </div>
            </Card>
        );
    };

    const renderStagesProgress = () => (
        <Card className="stages-card">
            <Title level={4}>Этапы строительства</Title>

            {renderStagesSteps()}

            <Divider/>

            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                <TabPane tab="Общая информация" key="overview">
                    {renderStageOverview()}
                </TabPane>
                <TabPane tab="Документы" key="documents">
                    {renderStageDocuments()}
                </TabPane>
                <TabPane tab="Ход работ" key="progress">
                    {renderStageProgress()}
                </TabPane>
                <TabPane tab="Команда" key="team">
                    {renderStageTeam()}
                </TabPane>
            </Tabs>
        </Card>
    );

    const renderStageOverview = () => {
        const stage = stages[activeStageIndex];
        if (!stage) return null;

        return (
            <Space direction="vertical" size="middle" style={{width: '100%'}}>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Название этапа" span={2}>
                        {stage.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Статус">
                        <Badge
                            status={stage.status === 'COMPLETED' ? 'success' : stage.status === 'IN_PROGRESS' ? 'processing' : 'default'}
                            text={getStatusText(stage.status)}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Прогресс">
                        <Text strong>{stage.progress}%</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Плановые сроки">
                        {stage.startDate} - {stage.endDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="Описание">
                        {stage.description}
                    </Descriptions.Item>
                </Descriptions>

                {stage.documents && (
                    <div>
                        <Text strong>Документы:</Text>
                        <Text style={{marginLeft: '8px'}}>
                            Подписано {stage.documentsSigned || 0} из {stage.documents}
                        </Text>
                    </div>
                )}

                {stage.status === 'IN_PROGRESS' && (
                    <Button
                        type="primary"
                        icon={<FileTextOutlined/>}
                        onClick={() => setActiveTab('documents')}
                    >
                        Перейти к документам
                    </Button>
                )}
            </Space>
        );
    };

    const renderStageDocuments = () => {
        const mockDocuments = [
            {id: 1, title: 'Договор строительства', type: 'CONTRACT', status: 'SIGNED', date: '2024-01-20'},
            {id: 2, title: 'Смета на работы', type: 'ESTIMATE', status: 'SIGNED', date: '2024-01-22'},
            {id: 3, title: 'Акт выполненных работ', type: 'ACT', status: 'AWAITING_SIGNATURE', date: '2024-02-28'},
            {id: 4, title: 'Техническое задание', type: 'SPECIFICATION', status: 'DRAFT', date: '2024-02-15'},
        ];

        return (
            <Space direction="vertical" size="middle" style={{width: '100%'}}>
                {mockDocuments.map(doc => (
                    <Card key={doc.id} size="small">
                        <Row align="middle" gutter={16}>
                            <Col>
                                <FileTextOutlined style={{fontSize: '24px', color: '#1890ff'}}/>
                            </Col>
                            <Col flex={1}>
                                <Text strong>{doc.title}</Text>
                                <br/>
                                <Text type="secondary" style={{fontSize: '12px'}}>
                                    Тип: {doc.type} • Дата: {doc.date}
                                </Text>
                            </Col>
                            <Col>
                                <Tag
                                    color={doc.status === 'SIGNED' ? 'green' : doc.status === 'AWAITING_SIGNATURE' ? 'orange' : 'default'}>
                                    {doc.status === 'SIGNED' ? 'Подписан' : doc.status === 'AWAITING_SIGNATURE' ? 'Ожидает подписи' : 'Черновик'}
                                </Tag>
                            </Col>
                            <Col>
                                <Button type="link" size="small">
                                    Просмотреть
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                ))}

                <Button
                    type="primary"
                    block
                    onClick={() => message.info('Функция подписания документов будет реализована позже')}
                >
                    Перейти к подписанию документов
                </Button>
            </Space>
        );
    };

    const renderStageProgress = () => {
        const mockProgress = [
            {date: '2024-02-01', description: 'Начало земляных работ'},
            {date: '2024-02-10', description: 'Завершение котлована'},
            {date: '2024-02-15', description: 'Монтаж опалубки'},
            {date: '2024-02-20', description: 'Заливка бетона'},
            {date: '2024-02-25', description: 'Демонтаж опалубки'},
        ];

        return (
            <Space direction="vertical" size="middle" style={{width: '100%'}}>
                <Timeline>
                    {mockProgress.map((item, index) => (
                        <Timeline.Item key={index}>
                            <Text strong>{item.date}</Text>
                            <br/>
                            <Text>{item.description}</Text>
                        </Timeline.Item>
                    ))}
                </Timeline>

                <Divider/>

                <Title level={5}>Фотографии с объекта</Title>
                <Row gutter={[16, 16]}>
                    {[1, 2, 3].map(item => (
                        <Col span={8} key={item}>
                            <div className="progress-image-placeholder">
                                <Image
                                    src={`https://via.placeholder.com/150?text=Фото+${item}`}
                                    alt={`Прогресс ${item}`}
                                    style={{width: '100%', borderRadius: '8px'}}
                                />
                            </div>
                        </Col>
                    ))}
                </Row>
            </Space>
        );
    };

    const renderStageTeam = () => {
        const mockTeam = [
            {role: 'Менеджер проекта', name: 'Иванов Иван', phone: '+7-999-123-45-67', email: 'ivanov@example.com'},
            {role: 'Прораб', name: 'Петров Петр', phone: '+7-999-987-65-43', email: 'petrov@example.com'},
            {role: 'Инженер', name: 'Сидорова Анна', phone: '+7-999-555-44-33', email: 'sidorova@example.com'},
        ];

        return (
            <Space direction="vertical" size="middle" style={{width: '100%'}}>
                {mockTeam.map(member => (
                    <Card key={member.role} size="small">
                        <Row align="middle" gutter={16}>
                            <Col>
                                <div className="avatar-placeholder">
                                    <TeamOutlined style={{fontSize: '24px', color: '#722ed1'}}/>
                                </div>
                            </Col>
                            <Col flex={1}>
                                <Text strong>{member.role}</Text>
                                <br/>
                                <Text>{member.name}</Text>
                                <br/>
                                <Text type="secondary" style={{fontSize: '12px'}}>
                                    {member.phone} • {member.email}
                                </Text>
                            </Col>
                            <Col>
                                <Button type="link" size="small">
                                    Написать
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </Space>
        );
    };



    if (loading) {
        return (
            <div style={{textAlign: 'center', padding: '100px'}}>
                <Spin size="large"/>
                <Paragraph style={{marginTop: '20px'}}>Загрузка данных заказа...</Paragraph>
            </div>
        );
    }

    if (!order) {
        return (
            <Empty
                description="Заказ не найден"
                style={{margin: '100px 0'}}
            >
                <Button type="primary" onClick={() => navigate('/orders')}>
                    Вернуться к списку заказов
                </Button>
            </Empty>
        );
    }


    return (
        <div className="order-details-page">
            <Button
                type="text"
                icon={<ArrowLeftOutlined/>}
                onClick={() => navigate('/orders')}
                style={{marginBottom: '16px'}}
            >
                Назад к заказам
            </Button>

            <Row gutter={[24, 24]}>

                {/* Левая колонка: информация о проекте */}
                <Col xs={24} lg={16}>
                    {renderProjectInfo()}
                </Col>
                <Col xs={24} md={8}>
                    {renderOrderInfo()}
                </Col>
            </Row>
            {/*{renderStagesSteps()}*/}
            {renderStagesProgress()}
        </div>
    )
};

export default OrderDetailsPage;