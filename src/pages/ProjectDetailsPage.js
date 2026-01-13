import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Carousel, Col, Empty, message, Row, Spin, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { getProjectById } from '../api/ordersApi';
import { API_BASE_URL } from '../api/http';
import CreateOrderModal from '../components/CreateOrderModal';
import './ProjectDetailsPage.css';

const { Title, Paragraph, Text } = Typography;

const mediaBase = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
// previewImageUrl/media.url is relative (e.g. /uploads/1_1.jpg), so prepend API base without /api
const resolveImageUrl = url => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${mediaBase}${path}`;
};

const formatValue = value => (value === null || value === undefined || value === '' ? '-' : value);

const formatPrice = value => {
  if (value === null || value === undefined || value === '') return '-';
  const number = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(number)) return String(value);
  return number.toLocaleString('ru-RU');
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const carouselRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProjectById(id)
      .then(data => {
        if (!active) return;
        setProject(data || null);
      })
      .catch(error => {
        if (!active) return;
        message.error(error.message || 'Не удалось загрузить проект');
        setProject(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const mediaUrls = useMemo(() => {
    if (!project?.media) return [];
    return [...project.media]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(item => resolveImageUrl(item.url))
      .filter(Boolean);
  }, [project]);

  const handleSlideMouseDown = event => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleSlideMouseUp = event => {
    if (!carouselRef.current) return;
    const start = dragStartRef.current;
    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx > 6 || dy > 6) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    if (clickX < rect.width / 2) {
      carouselRef.current.prev();
    } else {
      carouselRef.current.next();
    }
  };

  const handleCreateOrder = () => {
    if (!isAuthenticated) {
      message.info('Пожалуйста, войдите чтобы создать заявку.');
      openAuthModal('login');
      return;
    }
    setOrderModalOpen(true);
  };

  if (loading) {
    return (
      <div className="project-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <Empty description="Проект не найден" className="project-details-empty">
        <Button onClick={() => navigate('/projects')}>
          Вернуться к списку проектов
        </Button>
      </Empty>
    );
  }

  return (
    <div className="project-details-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="project-details-main">
            <Title level={1} className="project-title">
              {project.name || 'Проект'}
            </Title>

            {mediaUrls.length > 0 ? (
              <Carousel className="project-carousel" ref={carouselRef} draggable swipeToSlide>
                {mediaUrls.map((url, index) => (
                  <div
                    className="project-carousel-slide"
                    key={`${url}-${index}`}
                    onMouseDown={handleSlideMouseDown}
                    onMouseUp={handleSlideMouseUp}
                  >
                    <img
                      src={url}
                      alt={`${project.name || 'Проект'} ${index + 1}`}
                      draggable={false}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="project-carousel-empty">Нет изображений</div>
            )}

            {project.description && (
              <Paragraph className="project-description">{project.description}</Paragraph>
            )}

            <div className="project-actions">
              <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleCreateOrder}>
                Создать заявку
              </Button>
              <Button onClick={() => navigate('/projects')}>
                Вернуться к списку проектов
              </Button>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="project-details-sidebar">
            <div className="project-meta-block">
              <Text className="project-meta-label">Площадь</Text>
              <div className="project-meta-value">
                {formatValue(project.totalArea)} м²
              </div>
            </div>
            <div className="project-meta-block">
              <Text className="project-meta-label">Материал</Text>
              <div className="project-meta-text">{formatValue(project.mainMaterials)}</div>
            </div>
            <div className="project-meta-block">
              <Text className="project-meta-label">Цена</Text>
              <div className="project-meta-price">{formatPrice(project.basePrice)} руб.</div>
            </div>
          </Card>
        </Col>
      </Row>

      <CreateOrderModal
        open={orderModalOpen}
        project={project}
        onClose={() => setOrderModalOpen(false)}
        onSuccess={() => setOrderModalOpen(false)}
      />
    </div>
  );
};

export default ProjectDetailsPage;
