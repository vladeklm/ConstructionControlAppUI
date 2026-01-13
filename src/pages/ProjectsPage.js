import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Filters from "../components/Filters";
import { getProjectMaterials, getProjectTemplates } from '../api/ordersApi';
import { API_BASE_URL } from '../api/http';
import CreateProjectModal from '../components/CreateProjectModal';

const mediaBase = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
// previewImageUrl is relative (e.g. /uploads/1_1.jpg), so prepend API base without /api
const resolveImageUrl = url => {
    if (!url) {
        return '';
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${mediaBase}${path}`;
};
const fallbackImage = `https://www.gwd.ru/upload/resize_cache/iblock/97f/847_556_2619711fa078991f0a23d032687646b21/97f67b8327b47781ad683df04fc6d192.jpg.webp`;

const mapProject = project => ({
    id: project.id,
    name: project.name,
    image: resolveImageUrl(project.previewImageUrl) || fallbackImage,
    floors: project.floors,
    material: project.mainMaterials,
    area: project.totalArea,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    price: project.basePrice,
});



const ProjectsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, openAuthModal, user } = useAuth();
    const isManager = user?.role === 'MANAGER';
    const [projects, setProjects] = useState([]);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(null);
    const [refreshToken, setRefreshToken] = useState(0);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        priceRange: [7000000, 17000000],
        areaRange: [60, 900],
        selectedMaterial: null,
        selectedFloor: null,
        selectedRooms: [],
        selectedBedrooms: [],
        selectedBathrooms: [],
    });

    const materialLabelByCode = useMemo(() => {
        return new Map(materialOptions.map(material => [material.code, material.name]));
    }, [materialOptions]);

    useEffect(() => {
        let active = true;
        getProjectMaterials()
            .then(data => {
                if (!active) return;
                setMaterialOptions(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                if (!active) return;
                message.error(error.message || 'Failed to load materials');
            });
        return () => {
            active = false;
        };
    }, [refreshToken]);

    useEffect(() => {
        let active = true;
        getProjectTemplates()
            .then(data => {
                if (!active) return;
                setTotalCount(Array.isArray(data) ? data.length : 0);
            })
            .catch(() => {
                if (!active) return;
                setTotalCount(0);
            });
        return () => {
            active = false;
        };
    }, [refreshToken]);

    useEffect(() => {
        let active = true;
        const params = {
            areaMin: filters.areaRange[0],
            areaMax: filters.areaRange[1],
            priceMin: filters.priceRange[0],
            priceMax: filters.priceRange[1],
            floors: filters.selectedFloor ?? undefined,
            materials: filters.selectedMaterial ?? undefined,
        };
        const queryParams = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
        );

        getProjectTemplates(queryParams)
            .then(data => {
                if (!active) return;
                const list = Array.isArray(data) ? data.map(mapProject) : [];
                setProjects(list);
            })
            .catch(error => {
                if (!active) return;
                message.error(error.message || 'Failed to load projects');
                setProjects([]);
            });

        return () => {
            active = false;
        };
    }, [filters, refreshToken]);

    useEffect(() => {
        if (!location.state?.openCreate) return;
        if (isManager) {
            setCreateModalOpen(true);
        }
        navigate('/projects', { replace: true, state: {} });
    }, [location.state, isManager, navigate]);

    const totalProjects = totalCount === null ? projects.length : totalCount;


    const handleAddToOrders = project => {
        if (!isAuthenticated) {
            message.info('Авторизуйтесь, чтобы добавлять проекты в заказы');
            openAuthModal('login')
            return;
        }
        message.success(`Проект "${project.name}" добавлен в заказы (заглушка)`);
    };

    const handleOpenProject = project => {
        navigate(`/projects/${project.id}`);
    };

    const handleOpenCreateProject = () => {
        if (!isManager) return;
        setCreateModalOpen(true);
    };

    const handleCreateSuccess = () => {
        setRefreshToken(prev => prev + 1);
    };

    const removeTag = key => {
        setFilters(prev => ({
            ...prev,
            [key]: null,
        }));
    };

    return (
        <div className="page-layout">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8} lg={7} xl={6}>
                    <Filters filters={filters} setFilters={setFilters} materialOptions={materialOptions} />
                </Col>
                <Col xs={24} md={16} lg={17} xl={18}>
                    <div className="projects-header">
                        <div>
                            <h1>Подбор проектов</h1>
                            <p className="app-subtitle">
                                Доступно {projects.length} из {totalProjects} проектов
                            </p>
                        </div>
                        <div className="projects-header-actions">
                            {isManager && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateProject}>
                                    Добавить проект
                                </Button>
                            )}
                            <div className="chips">

                            {filters.selectedMaterial && (
                                <Tag
                                    key={filters.selectedMaterial}
                                    closable
                                    onClose={() => removeTag('selectedMaterial')}
                                >
                                    {materialLabelByCode.get(filters.selectedMaterial) || filters.selectedMaterial}
                                </Tag>
                            )}
                            {filters.selectedFloor !== null && (
                                <Tag
                                    key={`floor-${filters.selectedFloor}`}
                                    closable
                                    onClose={() => removeTag('selectedFloor')}
                                >
                                    {filters.selectedFloor}
                                </Tag>
                            )}
                                                    </div>
                        </div>
                    </div>

                    <Row gutter={[16, 16]} id="projects">
                        {projects.map(project => (
                            <Col xs={24} sm={12} lg={8} key={project.id}>
                                <ProjectCard
                                    project={project}
                                    onOpen={handleOpenProject}
                                    onAdd={handleAddToOrders}
                                    isAuthenticated={isAuthenticated}
                                />
                            </Col>
                        ))}
                        {projects.length === 0 && (
                            <Col span={24}>
                                <div className="empty-state">Нет проектов по выбранным параметрам</div>
                            </Col>
                        )}
                    </Row>
                    <CreateProjectModal
                        open={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        materialOptions={materialOptions}
                        onSuccess={handleCreateSuccess}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default ProjectsPage;
