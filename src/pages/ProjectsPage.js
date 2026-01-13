import React, { useState, useEffect, useCallback } from 'react'; // Добавили useCallback
import { useNavigate } from 'react-router-dom';
import { Row, Col, Tag, message, Spin } from 'antd';
import { useAuth } from '../auth/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Filters from "../components/Filters";
import { apiFetch } from '../api/http';

const mediaBase = process.env.REACT_APP_MEDIA_BASE;

const ProjectsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, openAuthModal } = useAuth();

    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [materialsList, setMaterialsList] = useState([]); // Добавим список материалов для отображения имен в тегах

    const [filters, setFilters] = useState({
        priceRange: [7000000, 17000000],
        areaRange: [60, 900],
        selectedMaterials: [],
        selectedFloors: [],
    });

    // Загрузка списка материалов (для корректного отображения имен в тегах)
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

    // Оборачиваем функцию в useCallback. Зависимость - filters.
    // Теперь функция будет пересоздаваться только при изменении filters.
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

            const formattedProjects = data.map(item => ({
                id: item.id,
                name: item.name,
                image: item.previewImageUrl.startsWith('http')
                ? item.previewImageUrl
                : `${mediaBase}${item.previewImageUrl}`,
                floors: item.floors,
                material: item.mainMaterials,
                area: item.totalArea,
                price: item.basePrice,
                rooms: null,
                bedrooms: null,
                bathrooms: null,
            }));

            setProjects(formattedProjects);
        } catch (error) {
            console.error('Ошибка при загрузке проектов:', error);
            message.error('Не удалось загрузить список проектов');
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Зависимость от filters

    // Теперь useEffect зависит от loadProjects, что безопасно благодаря useCallback
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

    const removeTag = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].filter(item => item !== value),
        }));
    };

    // Вспомогательная функция для получения имени материала по коду
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
<p className="app-subtitle">
Найдено проектов: {projects.length}
</p>
</div>
<div className="chips">
{filters.selectedMaterials.map(code => (
<Tag
key={code}
closable
onClose={() => removeTag('selectedMaterials', code)}
>
{getMaterialName(code)} {/* Теперь отображаем читаемое имя */}
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
</Col>
</Row>
</div>
);
};

export default ProjectsPage;