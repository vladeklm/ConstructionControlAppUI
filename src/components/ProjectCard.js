import React, {useState} from 'react';
import {Card, Button, Tooltip} from 'antd';
import {AreaChartOutlined, ShoppingCartOutlined} from '@ant-design/icons';
import CreateOrderModal from './CreateOrderModal';

const formatValue = value => (value === null || value === undefined || value === '' ? '-' : value);

const formatPrice = value => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(number)) {
        return String(value);
    }
    return number.toLocaleString('ru-RU');
};

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
                                <span>{formatValue(project.floors)} этажа</span>
                                <span>{formatValue(project.material)}</span>
                            </div>
                            <div className="card-row spaced">
                                <span><AreaChartOutlined/> {formatValue(project.area)} m2</span>
                            </div>
                            <div className="card-price">
                                {formatPrice(project.price)} ₽
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
