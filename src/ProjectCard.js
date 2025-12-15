import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { HomeOutlined, AreaChartOutlined, RestOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const ProjectCard = ({ project, onOpen, onAdd, isAuthenticated }) => {
  const handleOpen = () => onOpen?.(project);
  const handleAdd = e => {
    e.stopPropagation();
    onAdd?.(project);
  };

  return (
    <Card
      hoverable
      className="project-card"
      cover={<img alt={project.name} src={project.image} />}
      onClick={handleOpen}
    >
      <Card.Meta
        title={project.name}
        description={
          <>
            <div className="card-row">
              <span>{project.floors} этажа</span>
              <span>{project.material}</span>
            </div>
            <div className="card-row spaced">
              <span><AreaChartOutlined /> {project.area} м²</span>
              <span><HomeOutlined /> {project.rooms} комн.</span>
            </div>
            <div className="card-row spaced">
              <span>Спален: {project.bedrooms}</span>
              <span><RestOutlined /> Санузлов: {project.bathrooms}</span>
            </div>
            <div className="card-price">
              {project.price.toLocaleString('ru-RU')} ₽
            </div>
            <Tooltip title={isAuthenticated ? 'Добавить в заказы' : 'Авторизуйтесь, чтобы добавить в заказы'}>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                block
                onClick={handleAdd}
              >
                В заказ
              </Button>
            </Tooltip>
          </>
        }
      />
    </Card>
  );
};

export default ProjectCard;
