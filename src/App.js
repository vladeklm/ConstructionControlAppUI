import React, { useState } from 'react';
import Filters from './Filters'; // Подключаем компонент фильтров
import ProjectCard from './ProjectCard'; // Подключаем компонент карточки проекта
import './App.css'; // Подключаем стили
import { Row, Col } from 'antd';

// Пример данных для проектов
const projects = [
  { id: 1, name: 'Проект 1', image: '/path-to-image1.jpg', floors: 2, material: 'Кирпич', area: 120, bedrooms: 3, bathrooms: 2, price: 15000000 },
  { id: 2, name: 'Проект 2', image: '/path-to-image2.jpg', floors: 1, material: 'Монолит', area: 85, bedrooms: 2, bathrooms: 1, price: 8000000 },
  { id: 3, name: 'Проект 3', image: '/path-to-image3.jpg', floors: 3, material: 'Клееный брус', area: 200, bedrooms: 4, bathrooms: 3, price: 25000000 },
  // Добавь еще проекты...
];

const App = () => {
  // Состояние фильтров
  const [filters, setFilters] = useState({
    priceRange: [7000000, 17000000],
    areaRange: [65, 900],
    selectedMaterials: [],
    selectedFloors: [],
    selectedRooms: [],
    selectedBedrooms: [],
    selectedBathrooms: [],
  });

  // Функция для фильтрации проектов
  const filteredProjects = projects.filter(project => {
    return (
      project.price >= filters.priceRange[0] &&
      project.price <= filters.priceRange[1] &&
      project.area >= filters.areaRange[0] &&
      project.area <= filters.areaRange[1] &&
      (filters.selectedMaterials.length === 0 || filters.selectedMaterials.includes(project.material)) &&
      (filters.selectedFloors.length === 0 || filters.selectedFloors.includes(project.floors)) &&
      (filters.selectedBedrooms.length === 0 || filters.selectedBedrooms.includes(project.bedrooms)) &&
      (filters.selectedBathrooms.length === 0 || filters.selectedBathrooms.includes(project.bathrooms))
    );
  });

  return (
    <div className="App">
      <h1>Проекты</h1>
      <Filters filters={filters} setFilters={setFilters} /> {/* Передаем фильтры в компонент фильтров */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {filteredProjects.map(project => (
          <Col span={8} key={project.id}>
            <ProjectCard project={project} /> {/* Рендерим карточки проектов */}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default App;
