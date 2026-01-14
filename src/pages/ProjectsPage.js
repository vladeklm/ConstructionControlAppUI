import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Добавили useLocation
import { Row, Col, Tag, message, Spin, Button } from 'antd'; // Добавили Button
import { PlusOutlined } from '@ant-design/icons'; // Добавили иконку
import { useAuth } from '../auth/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Filters from "../components/Filters";
import CreateProjectModal from "../components/CreateProjectModal"; // Импортируем модалку
import { apiFetch } from '../api/http';

const mediaBase = process.env.REACT_APP_MEDIA_BASE;

const ProjectsPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Получаем location
    const { isAuthenticated, openAuthModal, user } = useAuth(); // Получаем user

    const isManager = user?.role === 'MANAGER'; // Проверка роли

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [materialsList, setMaterialsList] = useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false); // Состояние модалки

    const [filters, setFilters] = useState({
        priceRange: [7000000, 17000000],
        areaRange: [60, 900],
        selectedMaterials: [],
        selectedFloors: [],
    });

    // Загрузка списка материалов
    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const data = await apiFetch('/projects/materials');
                setMaterialsList(data);
            } catch (error) {
                console.error('Failed to load materials', error);
            }
        };
        fetchMaterials();
    }, []);

    // Обработка открытия модалки через location.state (например, переход с кнопки "Добавить проект")
    useEffect(() => {
        if (!location.state?.openCreate) return;
        if (isManager) {
            setCreateModalOpen(true);
        }
        // Очищаем state, чтобы не открывалась снова при перезагрузке (если replace используется)
        navigate('/projects', { replace: true, state: {} });
    }, [location.state, isManager, navigate]);

    // Очистка памяти (blob URLs) приUnmount компонента
    useEffect(() => {
        return () => {
            projects.forEach(project => {
                if (project.image && project.image.startsWith('blob:')) {
                    URL.revokeObjectURL(project.image);
                }
            });
        };
    }, [projects]);

    const loadProjects = useCallback(async () => {
        try {
            setIsLoading(true);

            const params = {};

            if (filters.priceRange) {
                params.priceMin = filters.priceRange[0];
                params.priceMax = filters.priceRange[1];
            }

            if (filters.areaRange) {
                params.areaMin = filters.areaRange[0];
                params.areaMax = filters.areaRange[1];
            }

            if (filters.selectedFloors && filters.selectedFloors.length > 0) {
                params.floors = filters.selectedFloors;
            }

            if (filters.selectedMaterials && filters.selectedMaterials.length > 0) {
                params.materials = filters.selectedMaterials;
            }

            const data = await apiFetch('/projects', { params });

            // Загружаем картинки для каждого проекта
            const formattedProjects = await Promise.all(data.map(async (item) => {
                let finalImage = ''; // Фоллбэк, если картинка не загрузится

                if (item.previewImageUrl) {
                    try {
                        // Запрашиваем картинку как blob, пропуская /api часть
                        const imageBlob = await apiFetch(item.previewImageUrl, {
                            skipApiPrefix: true,
                            responseType: 'blob'
                        });
                        // Создаем локальный URL для отображения
                        finalImage = URL.createObjectURL(imageBlob);
                    } catch (imgError) {
                        console.error(`Ошибка загрузки изображения для проекта ${item.name}:`, imgError);
                        // Можно оставить finalImage пустым или поставить заглушку
                    }
                }

                return {
                    id: item.id,
                    name: item.name,
                    image: finalImage,
                    floors: item.floors,
                    material: item.mainMaterials,
                    area: item.totalArea,
                    price: item.basePrice,
                    rooms: null,
                    bedrooms: null,
                    bathrooms: null,
                };
            }));

            setProjects(formattedProjects);
        } catch (error) {
            console.error('Ошибка при загрузке проектов:', error);
            message.error('Не удалось загрузить список проектов');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

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
        message.info(`Открыть страницу проекта "${project.name}" (заглушка)`);
    };

    const handleOpenCreateProject = () => {
        if (!isManager) return;
        setCreateModalOpen(true);
    };

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        loadProjects(); // Перезагружаем список проектов после создания
    };

    const removeTag = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].filter(item => item !== value),
        }));
    };

    const getMaterialName = (code) => {
        const mat = materialsList.find(m => m.code === code);
        return mat ? mat.name : code;
    };

    return (
<div className="page-layout">
<Row gutter={[16, 16]}>
<Col xs={24} md={8} lg={7} xl={6}>
<Filters filters={filters} setFilters={setFilters} />
</Col>
<Col xs={24} md={16} lg={17} xl={18}>
<div className="projects-header">
<div>
<h1>Подбор проектов</h1>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<p className="app-subtitle">
Найдено проектов: {projects.length}
</p>
{/* Кнопка для менеджеров */}
{isManager && (
<Button
type="primary"
icon={<PlusOutlined />}
onClick={handleOpenCreateProject}
style={{ marginLeft: '16px' }}
>
Добавить проект
</Button>
)}
</div>
</div>
<div className="chips">
{filters.selectedMaterials.map(code => (
<Tag
key={code}
closable
onClose={() => removeTag('selectedMaterials', code)}
>
{getMaterialName(code)}
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

{isLoading ? (
<div style={{ textAlign: 'center', padding: '50px' }}>
<Spin size="large" tip="Загрузка проектов..." />
</div>
) : (
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
)}

{/* Модальное окно создания проекта */}
<CreateProjectModal
open={createModalOpen}
onClose={() => setCreateModalOpen(false)}
materialOptions={materialsList}
onSuccess={handleCreateSuccess}
/>
</Col>
</Row>
</div>
);
};

export default ProjectsPage;