import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Empty, message, Row, Spin, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { getProjectById } from '../api/ordersApi';
import { API_BASE_URL } from '../api/http';
import CreateOrderModal from '../components/CreateOrderModal';
import ProjectImagesCarousel from '../components/ProjectImagesCarousel';
import './ProjectDetailsPage.css';

const { Title, Paragraph, Text } = Typography;

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

              <ProjectImagesCarousel
                  media={project.media}
                  projectName={project.name}
              />

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