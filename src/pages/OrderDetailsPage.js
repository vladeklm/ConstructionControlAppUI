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
Empty, Progress, Modal, Statistic, Input
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
BuildOutlined, CheckSquareOutlined, SafetyCertificateOutlined, ToolOutlined, PauseCircleOutlined, PlayCircleOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import {getOrderById} from '../api/ordersApi';
import './OrderDetailsPage.css';
import {getProjectTemplateById} from "../api/projectApi";
import {getStageReports, getStagesForObject} from "../api/stagesApi";
import ProjectImagesCarousel from "../components/ProjectImagesCarousel";
import WebRTCPlayer from '../components/WebRTCPlayer';
import ChatComponent from '../components/ChatComponent'; // Импортируем чат
import {
getDocument,
getDocumentChecklist,
getDocumentHistory,
getStageDocuments, rejectDocument,
signDocument
} from "../api/documentsApi";

const {Title, Text, Paragraph} = Typography;
const {TabPane} = Tabs;

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
PREPARATION: 'Подготовительный этап',
FOUNDATION: 'Фундамент',
WALLS: 'Стены и перекрытия',
ROOFING: 'Кровля',
WINDOWS_AND_DOORS: 'Окна и двери',
FACADE: 'Фасад',
ENGINEERING_SYSTEMS: 'Инженерные системы',
INTERIOR_FINISHING: 'Внутренняя отделка',
LANDSCAPING: 'Благоустройство',
HANDOVER: 'Сдача объекта'
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

const formatHistoryAction = (action) => {
const actionMap = {
CREATED: 'Создан',
SIGNED: 'Подписан',
REJECTED: 'Отклонен'
};
return actionMap[action] || action;
};

const OrderDetailsPage = () => {
const {id} = useParams();
const navigate = useNavigate();
const [order, setOrder] = useState(null);
const [project, setProject] = useState(null);
const [loading, setLoading] = useState(true);
const [stages, setStages] = useState([]);
const [activeStageIndex, setActiveStageIndex] = useState(0);
const [activeTab, setActiveTab] = useState('overview');
const [documents, setDocuments] = useState([]);
const [selectedDocument, setSelectedDocument] = useState(null);
const [documentHistory, setDocumentHistory] = useState([]);
const [signingLoading, setSigningLoading] = useState(false);
const [documentsLoading, setDocumentsLoading] = useState(false);
const [stageReports, setStageReports] = useState([]);
const [reportsLoading, setReportsLoading] = useState(false);

useEffect(() => {
fetchOrderDetails();
}, [id]);

const fetchOrderDetails = async () => {
setLoading(true);
try {
const orderData = await getOrderById(id);
setOrder(orderData);

if (orderData.projectTemplateId) {
const projectData = await getProjectTemplateById(orderData.projectTemplateId);
setProject(projectData);
}

let activeIndex = -1
if (orderData.constructionObjectId) {
const {stages} = await getStagesForObject(orderData.constructionObjectId);
setStages(stages);
activeIndex = stages.findIndex(stage => stage.status === 'IN_PROGRESS');
}

setActiveStageIndex(activeIndex >= 0 ? activeIndex : 0);

} catch (error) {
message.error('Ошибка при загрузке данных заказа');
console.error('Error fetching order details:', error);
} finally {
setLoading(false);
}
};

const fetchStageDocuments = async () => {
if (!stages[activeStageIndex]) return;

setDocumentsLoading(true);
try {
const stage = stages[activeStageIndex];
const docsData = await getStageDocuments(stage.id);
setDocuments(docsData.documents || []);
} catch (error) {
message.error('Ошибка при загрузке документов этапа');
console.error('Error fetching stage documents:', error);
} finally {
setDocumentsLoading(false);
}
};

const fetchStageReports = async () => {
if (!stages[activeStageIndex]) return;

setReportsLoading(true);
try {
const stage = stages[activeStageIndex];
const reportsData = await getStageReports(stage.id);
setStageReports(reportsData || []);
} catch (error) {
console.error('Error fetching stage reports:', error);
} finally {
setReportsLoading(false);
}
};


useEffect(() => {
if (stages.length > 0 && activeStageIndex >= 0) {
fetchStageDocuments();
fetchStageReports();
}
}, [activeStageIndex, stages]);

const handleStageClick = (index) => {
setActiveStageIndex(index);
setActiveTab('overview');
};

const handleSignDocument = async (documentId, comment = null) => {
setSigningLoading(true);
try {
await signDocument(documentId, comment);
message.success('Документ успешно подписан');
fetchStageDocuments();
} catch (error) {
message.error('Ошибка при подписании документа');
console.error('Error signing document:', error);
} finally {
setSigningLoading(false);
}
};

const handleRejectDocument = async (documentId, reason) => {
setSigningLoading(true);
try {
await rejectDocument(documentId, reason);
message.success('Документ отклонен');
await fetchStageDocuments();
} catch (error) {
message.error('Ошибка при отклонении документа');
console.error('Error rejecting document:', error);
} finally {
setSigningLoading(false);
}
};

const handleViewDocumentDetails = async (documentId) => {
try {
const documentDetails = await getDocument(documentId);
setSelectedDocument(documentDetails);
const history = await getDocumentHistory(documentId);
setDocumentHistory(history.history || []);
} catch (error) {
message.error('Ошибка при загрузке деталей документа');
console.error('Error fetching document details:', error);
}
};

const renderProjectInfo = () => (
<Card className="project-info-card" style={{ height: '100%' }}>
<ProjectImagesCarousel
media={project.media}
projectName={project.name}
/>

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
<Card className="order-info-card" style={{ height: '100%' }}>
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
onClick={() => setActiveTab('chat')} // Переключаем на вкладку чата
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
minHeight: '60px',
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
{formatDate(stage.plannedStartDate)} - {formatDate(stage.plannedEndDate)}
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
{/* Добавленная вкладка Чата */}
<TabPane tab="Чат" key="chat">
<ChatComponent orderId={order?.id} />
</TabPane>
</Tabs>
</Card>
);

const renderStageOverview = () => {
const stage = stages[activeStageIndex];
if (!stage) return null;

const signedDocs = documents.filter(d => d.status === 'SIGNED').length;
const rejectDocs = documents.filter(d => d.status === 'REJECTED').length;
const pendingDocs = documents.filter(d => d.status === 'AWAITING_SIGNATURE').length;
const totalDocs = documents.length;

return (
<Space direction="vertical" size="middle" style={{ width: '100%' }}>
<Descriptions bordered column={2} size="small">
<Descriptions.Item label="Название этапа" span={2}>
{stageTypeNames[stage.type] || stage.type}
</Descriptions.Item>
<Descriptions.Item label="Статус">
<Badge
status={stage.status === 'COMPLETED' ? 'success' : stage.status === 'IN_PROGRESS' ? 'processing' : 'default'}
text={getStatusText(stage.status)}
/>
</Descriptions.Item>
<Descriptions.Item label="Прогресс">
<Text strong>{stage.progressPercentage}%</Text>
</Descriptions.Item>
<Descriptions.Item label="Плановые сроки">
{stage.plannedStartDate} - {stage.plannedEndDate}
</Descriptions.Item>
<Descriptions.Item label="Документы" span={2}>
{totalDocs > 0 ? (
<Space>
<Tag color="green">Подписано: {signedDocs}</Tag>
<Tag color="red">Отклонено: {rejectDocs}</Tag>
<Tag color="orange">Ожидают: {pendingDocs}</Tag>
<Tag color="blue">Всего: {totalDocs}</Tag>
</Space>
) : (
<Text type="secondary">Нет документов</Text>
)}
</Descriptions.Item>
</Descriptions>
</Space>
);
};

const renderStageDocuments = () => {
if (documentsLoading) {
return (
<div style={{ textAlign: 'center', padding: '40px' }}>
<Spin />
<Paragraph style={{ marginTop: '20px' }}>Загрузка документов...</Paragraph>
</div>
);
}

if (!documents || documents.length === 0) {
return (
<Empty description="Документы не найдены" />
);
}

const getStatusConfig = (status) => {
const config = {
AWAITING_SIGNATURE: { color: 'orange', text: 'Ожидает подписи' },
SIGNED: { color: 'green', text: 'Подписан' },
REJECTED: { color: 'red', text: 'Отклонен' },
DRAFT: { color: 'default', text: 'Черновик/В разработке' },
ARCHIVED: { color: 'default', text: 'В архиве' }
};
return config[status] || { color: 'default', text: status };
};
const signedDocs = documents.filter(d => d.status === 'SIGNED').length;
const rejectDocs = documents.filter(d => d.status === 'REJECTED').length;
const totalDocs = documents.length;


return (
<Space direction="vertical" size="middle" style={{ width: '100%' }}>
{/* Статистика по документам */}
{<Card size="small" style={{ marginBottom: '16px' }}>
<Space size="large">
<Statistic
title="Всего документов"
value={documents.length}
prefix={<FileTextOutlined />}
/>
<Statistic
title="Подписано"
value={signedDocs || 0}
suffix={`/${totalDocs || 0}`}
valueStyle={{ color: signedDocs===totalDocs ? '#52c41a' : '#1890ff' }}
/>
<Statistic
title="Статус"
value={signedDocs===totalDocs ? 'Все подписаны' :
rejectDocs !==0
? 'Требуются исправления'
: 'Требуются подписи'}
valueStyle={{ color: signedDocs===totalDocs ? '#52c41a' : '#faad14' }}
/>
</Space>
</Card>
}

{/* Список документов */}
{documents.map(doc => {
const statusConfig = getStatusConfig(doc.status);

return (
<Card key={doc.id} size="small">
<Row align="middle" gutter={16}>
<Col>
<FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
</Col>
<Col flex={1}>
<Text strong>{doc.title}</Text>
<Button
type="link"
size="small"
onClick={() => handleViewDocumentDetails(doc.id)}
disabled={!doc.fileUrl}
>
{doc.fileUrl ? 'Посмотреть документ' : 'Нет файла'}
</Button>
</Col>
<Col>
<Tag color={statusConfig.color}>
{statusConfig.text}
</Tag>
</Col>
<Col>
<Space>
<Button
type="link"
size="small"
onClick={() => handleViewDocumentDetails(doc.id)}
>
{doc ? 'Просмотреть историю' : 'Нет файла'}
</Button>

{doc.status === 'AWAITING_SIGNATURE' && (
<>
<Button
type="primary"
size="small"
onClick={() => handleSignDocument(doc.id)}
loading={signingLoading}
>
Подписать
</Button>
<Button
danger
onClick={() => {
let reason = '';
Modal.confirm({
title: 'Отклонение документа',
content: (
<div>
<p>Укажите причину отклонения:</p>
<Input.TextArea
rows={3}
onChange={(e) => reason = e.target.value}
/>
</div>
),
onOk: () => handleRejectDocument(doc.id, reason)
});
}}
>
Отклонить документ
</Button>
</>
)}
</Space>
</Col>
</Row>
</Card>
);
})}

{/* История документа (модальное окно) */}
{selectedDocument && (
<Modal
title= "История согласования"
open={!!selectedDocument}
onCancel={() => setSelectedDocument(null)}
footer={[
<Button key="close" onClick={() => setSelectedDocument(null)}>
Закрыть
</Button>
]}
width={800}
>
<Descriptions column={2} bordered>
<Descriptions.Item label="Тип документа">
{selectedDocument.title}
</Descriptions.Item>
<Descriptions.Item label="Статус">
<Tag color={getStatusConfig(selectedDocument.status).color}>
{getStatusConfig(selectedDocument.status).text}
</Tag>
</Descriptions.Item>
<Descriptions.Item label="Этап" span={2}>
{stageTypeNames[selectedDocument.stageName] || selectedDocument.stageName }
</Descriptions.Item>
{selectedDocument.signedBy && (
<Descriptions.Item label="Подписал">
{selectedDocument.signedBy.fullName} ({selectedDocument.signedBy.email})
</Descriptions.Item>
)}
{selectedDocument.rejectedBy && (
<Descriptions.Item label="Отклонил">
{selectedDocument.rejectedBy.fullName}
</Descriptions.Item>
)}
{selectedDocument.rejectionReason && (
<Descriptions.Item label="Причина отклонения" span={2}>
{selectedDocument.rejectionReason}
</Descriptions.Item>
)}
</Descriptions>

{/* История документа */}
<Divider />
<Title level={5}>История изменений</Title>
<Timeline>
{documentHistory.map((event, index) => (
<Timeline.Item key={index}>
<Text strong>{formatDate(event.timestamp)}</Text>
<br />
<Text>
{event.actor ? `${event.actor.fullName} - ${formatHistoryAction(event.action)}` : formatHistoryAction(event.action)}
{event.comment && (
<Text type="secondary">: {event.comment}</Text>
)}
</Text>
</Timeline.Item>
))}
</Timeline>

{/* Кнопки для работы с документом */}
<Divider />
<Space style={{ width: '100%', justifyContent: 'center' }}>
{selectedDocument.fileUrl && (
<Button
type="primary"
href={selectedDocument.fileUrl}
target="_blank"
>
Открыть документ
</Button>
)}
{selectedDocument.status === 'AWAITING_SIGNATURE' && (
<>
<Button
type="primary"
onClick={() => {
Modal.confirm({
title: 'Подтверждение подписи',
content: 'Вы уверены, что хотите подписать этот документ?',
onOk: () => handleSignDocument(selectedDocument.id, 'Подписано через модальное окно')
});
}}
>
Подписать документ
</Button>
<Button
danger
onClick={() => {
let reason = '';
Modal.confirm({
title: 'Отклонение документа',
content: (
<div>
<p>Укажите причину отклонения:</p>
<Input.TextArea
rows={3}
onChange={(e) => reason = e.target.value}
/>
</div>
),
onOk: () => handleRejectDocument(selectedDocument.id, reason)
});
}}
>
Отклонить документ
</Button>
</>
)}
</Space>
</Modal>
)}
</Space>
);
};

const renderStageProgress = () => {
const stage = stages[activeStageIndex];
if (!stage) return null;

if (reportsLoading) {
return (
<div style={{ textAlign: 'center', padding: '40px' }}>
<Spin />
<Paragraph style={{ marginTop: '20px' }}>Загрузка отчетов...</Paragraph>
</div>
);
}

const getStatusColor = (status) => {
const colors = {
OK: 'green',
WARNING: 'orange',
ISSUE: 'red'
};
return colors[status] || 'blue';
};

const getStatusText = (status) => {
const texts = {
OK: 'Всё в порядке',
WARNING: 'Есть замечания',
ISSUE: 'Проблемы'
};
return texts[status] || 'Информация';
};

// Собираем все фотографии из отчетов
const allPhotos = stageReports.flatMap(report =>
(report.photos || []).map(photo => ({
...photo,
reportDate: report.reportDate,
reportTitle: report.title
}))
);

return (
<Space direction="vertical" size="middle" style={{ width: '100%' }}>

{/* Блок WebRTC плеера */}
{order?.constructionObjectId && (
<>
<div>
<Title level={5}>
<VideoCameraOutlined style={{marginRight: '8px'}} />
Онлайн трансляция с объекта
</Title>
{/*
                               ВАЖНО: Добавлен key={`webrtc-${activeTab}`}.
                               Это принудительно перерисовывает плеер при каждом переключении на вкладку "progress",
                               решая проблему с зависшим видео.
                            */}
<WebRTCPlayer
constructionObjectId={order.constructionObjectId}
key={`webrtc-${activeTab}`}
/>
</div>
<Divider/>
</>
)}

{/* Список отчетов */}
{stageReports.length === 0 && allPhotos.length === 0  ? (
<div style={{ textAlign: 'center', padding: '40px 20px' }}>
<FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
<Paragraph type="secondary">
По данному этапу пока нет отчетов и фотографий.
<br />
Они будут добавлены инженером по мере выполнения работ.
</Paragraph>
</div>
) : (
<>
<div>
<Title level={5}>Отчеты по этапу</Title>
<Text type="secondary">
Всего отчетов: {stageReports.length}
{stageReports[0] && ` • Последний отчет: ${formatDate(stageReports[0].reportDate)}`}
</Text>
</div>

{stageReports.map((report) => (
<Card
key={report.id}
size="small"
style={{ marginBottom: '12px' }}
title={
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<Text strong>{report.title}</Text>
<Tag color={getStatusColor(report.status)}>
{getStatusText(report.status)}
</Tag>
</div>
}
>
<Space direction="vertical" size="small" style={{ width: '100%' }}>
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
<Text type="secondary" style={{ fontSize: '12px' }}>
Дата: {formatDate(report.reportDate)}
</Text>
<Text type="secondary" style={{ fontSize: '12px' }}>
Автор: {report.author?.fullName || 'Инженер'}
</Text>
</div>

{report.comment && (
<div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
<Text strong style={{ display: 'block', marginBottom: '4px' }}>Комментарий инженера:</Text>
<Text>{report.comment}</Text>
</div>
)}

{report.pdfUrl && (
<div>
<Button
type="link"
icon={<FileTextOutlined />}
href={report.pdfUrl}
target="_blank"
>
Открыть полный отчет (PDF)
</Button>
</div>
)}
</Space>
</Card>
))}
</>
)}

{/* Фотографии из отчетов */}
{allPhotos.length > 0 && (
<>
<Divider />
<div>
<Title level={5}>Фотографии с объекта</Title>
<Text type="secondary">
Всего фотографий: {allPhotos.length}
</Text>
</div>

<Row gutter={[16, 16]}>
{allPhotos.map((photo, index) => (
<Col xs={24} sm={12} md={8} key={photo.id || index}>
<Card
size="small"
cover={
<div style={{ height: '180px', overflow: 'hidden' }}>
<Image
src={photo.photoUrl}
alt={photo.caption || `Фото ${index + 1}`}
style={{
width: '100%',
height: '100%',
objectFit: 'cover',
cursor: 'pointer'
}}
preview={{
mask: 'Просмотреть',
zIndex: 1000
}}
/>
</div>
}
bodyStyle={{ padding: '12px' }}
>
<Space direction="vertical" size={2} style={{ width: '100%' }}>
{photo.caption && (
<Text style={{ fontSize: '12px' }}>{photo.caption}</Text>
)}
<Text type="secondary" style={{ fontSize: '10px' }}>
{photo.reportDate && formatDate(photo.reportDate)}
{photo.uploadedBy && ` • ${photo.uploadedBy}`}
</Text>
</Space>
</Card>
</Col>
))}
</Row>
</>
)}

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

<div style={{ marginBottom: '24px' }}>
<Row gutter={[24, 24]} style={{ alignItems: 'stretch' }}>
{/* Левая колонка: информация о проекте */}
<Col xs={24} lg={16}>
{renderProjectInfo()}
</Col>
<Col xs={24} lg={8}>
{renderOrderInfo()}
</Col>
</Row>
</div>

{renderStagesProgress()}
</div>
)
};

export default OrderDetailsPage;