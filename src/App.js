import React, { useMemo, useState } from 'react';
import { Row, Col, Button, Tag, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Filters from './Filters';
import ProjectCard from './ProjectCard';
import AuthModal from './components/AuthModal';
import { useAuth } from './auth/AuthContext';
import './App.css';

const mediaBase = process.env.REACT_APP_MEDIA_BASE;

const generateProjects = () => {
  const materials = ['Кирпич', 'Монолит', 'Клееный брус'];
  return Array.from({ length: 30 }, (_, index) => {
    const id = index + 1;
    const floors = (index % 3) + 1;
    const rooms = 3 + (index % 6);
    const bedrooms = 2 + (index % 4);
    const bathrooms = 1 + (index % 3);
    const area = 60 + ((index * 28) % 840); // 60–900
    const price = 7000000 + (index * 340000); // 7–17 млн в пределах 30 проектов
    const material = materials[index % materials.length];
    return {
      id,
      name: `Проект ${id}`,
      image: mediaBase
        ? `${mediaBase}/projects/${id}.jpg`
        : `https://via.placeholder.com/480x280?text=Project+${id}`,
      floors,
      material,
      area,
      rooms,
      bedrooms,
      bathrooms,
      price,
    };
  });
};

const projects = generateProjects();

const App = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [filters, setFilters] = useState({
    priceRange: [7000000, 17000000],
    areaRange: [60, 900],
    selectedMaterials: [],
    selectedFloors: [],
    selectedRooms: [],
    selectedBedrooms: [],
    selectedBathrooms: [],
  });

  const filteredProjects = useMemo(
    () =>
      projects.filter(project => {
        return (
          project.price >= filters.priceRange[0] &&
          project.price <= filters.priceRange[1] &&
          project.area >= filters.areaRange[0] &&
          project.area <= filters.areaRange[1] &&
          (filters.selectedMaterials.length === 0 || filters.selectedMaterials.includes(project.material)) &&
          (filters.selectedFloors.length === 0 || filters.selectedFloors.includes(project.floors)) &&
          (filters.selectedRooms.length === 0 || filters.selectedRooms.includes(project.rooms)) &&
          (filters.selectedBedrooms.length === 0 || filters.selectedBedrooms.includes(project.bedrooms)) &&
          (filters.selectedBathrooms.length === 0 || filters.selectedBathrooms.includes(project.bathrooms))
        );
      }),
    [filters]
  );

  const openAuth = tab => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAddToOrders = project => {
    if (!isAuthenticated) {
      message.info('Авторизуйтесь, чтобы добавлять проекты в заказы');
      openAuth('login');
      return;
    }
    message.success(`Проект "${project.name}" добавлен в заказы (заглушка)`);
  };

  const handleOpenProject = project => {
    message.info(`Открыть страницу проекта "${project.name}" (заглушка)`);
  };

  const removeTag = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item !== value),
    }));
  };

  return (
    <div className="App">
      <header className="top-nav">
        <div className="brand">СтройПроекты</div>
        <nav className="nav-links">
          <a href="#projects">Проекты</a>
          <a href="#orders">Мои заказы</a>
          <a href="#about">О нас</a>
        </nav>
        <div className="nav-actions">
          {!isAuthenticated ? (
            <Button type="primary" icon={<UserOutlined />} onClick={() => openAuth('login')}>
              Войти
            </Button>
          ) : (
            <>
              <span className="user-info">{user?.fullName || user?.login}</span>
              <Button icon={<UserOutlined />} onClick={signOut}>
                Выйти
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="page-layout">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8} lg={7} xl={6}>
            <Filters filters={filters} setFilters={setFilters} />
          </Col>
          <Col xs={24} md={16} lg={17} xl={18}>
            <div className="projects-header">
              <div>
                <h1>Подбор проектов</h1>
                <p className="app-subtitle">
                  Доступно {filteredProjects.length} из {projects.length} проектов
                </p>
              </div>
              <div className="chips">
                {filters.selectedMaterials.map(material => (
                  <Tag
                    key={material}
                    closable
                    onClose={() => removeTag('selectedMaterials', material)}
                  >
                    {material}
                  </Tag>
                ))}
                {filters.selectedFloors.map(floor => (
                  <Tag
                    key={`floor-${floor}`}
                    closable
                    onClose={() => removeTag('selectedFloors', floor)}
                  >
                    {floor} этаж
                  </Tag>
                ))}
              </div>
            </div>

            <Row gutter={[16, 16]} id="projects">
              {filteredProjects.map(project => (
                <Col xs={24} sm={12} lg={8} key={project.id}>
                  <ProjectCard
                    project={project}
                    onOpen={handleOpenProject}
                    onAdd={handleAddToOrders}
                    isAuthenticated={isAuthenticated}
                  />
                </Col>
              ))}
              {filteredProjects.length === 0 && (
                <Col span={24}>
                  <div className="empty-state">Нет проектов по выбранным параметрам</div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </div>

      <AuthModal
        open={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
