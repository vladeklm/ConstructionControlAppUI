import React from 'react';
import { Card } from 'antd';
import { HomeOutlined, AreaChartOutlined, RestOutlined } from '@ant-design/icons'; // Изменили иконку для санузла

const ProjectCard = ({ project }) => {
  return (
    <Card
      hoverable
      style={{ width: 240, marginBottom: 20 }}
      cover={<img alt="project" src={project.image} />}
    >
      <Card.Meta
        title={project.name}
        description={
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{project.floors} этажей</span>
              <span>{project.material}</span>
            </div>
            <div style={{ marginTop: '10px' }}>
              <span><HomeOutlined /> {project.area} м²</span>
              <span style={{ marginLeft: '10px' }}><AreaChartOutlined /> {project.bedrooms} спален</span>
              <span style={{ marginLeft: '10px' }}><RestOutlined /> {project.bathrooms} санузлов</span> {/* Изменено на RestOutlined */}
            </div>
            <div style={{ marginTop: '10px', color: 'green' }}>
              {project.price} руб.
            </div>
          </>
        }
      />
    </Card>
  );
};

export default ProjectCard;
