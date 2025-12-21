import React, {useState} from 'react';
import {Card, Button, Tooltip, message} from 'antd';
import {HomeOutlined, AreaChartOutlined, RestOutlined, ShoppingCartOutlined} from '@ant-design/icons';
import CreateOrderModal from './CreateOrderModal';

const ProjectCard = ({project, onAdd, onOpen, isAuthenticated}) => {
    const [orderModalOpen, setOrderModalOpen] = useState(false);


    const handleAdd = e => {
        e.stopPropagation();
        if (!isAuthenticated) {
            onAdd?.(project);
            return;
        }
        setOrderModalOpen(true);
    };

    return (
        <>
            <Card
                hoverable
                className="project-card"
                cover={<img alt={project.name} src={project.image}/>}
                onClick={() => onOpen?.(project)}
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
                                <span><AreaChartOutlined/> {project.area} м²</span>
                                <span><HomeOutlined/> {project.rooms} комн.</span>
                            </div>
                            <div className="card-row spaced">
                                <span>Спален: {project.bedrooms}</span>
                                <span><RestOutlined/> Санузлов: {project.bathrooms}</span>
                            </div>
                            <div className="card-price">
                                {project.price.toLocaleString('ru-RU')} ₽
                            </div>
                            <Tooltip title={isAuthenticated ? 'Создать заявку' : 'Авторизуйтесь, чтобы создать заявку'}>
                                <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined/>}
                                    block
                                    onClick={handleAdd}
                                >
                                    Создать заявку
                                </Button>
                            </Tooltip>
                        </>
                    }
                />
            </Card>

            <CreateOrderModal
                open={orderModalOpen}
                project={project}
                onClose={() => setOrderModalOpen(false)}
                onSuccess={() => {
                    setOrderModalOpen(false);
                }}
            />
        </>
    );
};

export default ProjectCard;