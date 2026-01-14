import React, { useRef, useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import { Carousel } from 'antd';
import {API_BASE_URL} from "../api/http";

const mediaBase = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const ProjectImagesCarousel = ({ media, projectName }) => {
    const carouselRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функция для обработки URL изображений
    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${mediaBase}${path}`;
    };

    useEffect(() => {
        if (!media || !Array.isArray(media)) {
            setImageUrls([]);
            setLoading(false);
            return;
        }

        try {
            // Сортируем изображения по sortOrder
            const sortedMedia = [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

            // Преобразуем URL
            const urls = sortedMedia
                .map(item => {
                    try {
                        return resolveImageUrl(item.url);
                    } catch (err) {
                        console.error('Error resolving image URL:', err);
                        return null;
                    }
                })
                .filter(Boolean); // Убираем null/undefined

            setImageUrls(urls);
            setError(null);
        } catch (err) {
            console.error('Error processing media:', err);
            setError('Ошибка при обработке изображений');
            setImageUrls([]);
        } finally {
            setLoading(false);
        }
    }, [media, mediaBase]);

    const handleSlideMouseDown = event => {
        dragStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleSlideMouseUp = event => {
        if (!carouselRef.current) return;
        const start = dragStartRef.current;
        const dx = Math.abs(event.clientX - start.x);
        const dy = Math.abs(event.clientY - start.y);
        if (dx > 6 || dy > 6) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        if (clickX < rect.width / 2) {
            carouselRef.current.prev();
        } else {
            carouselRef.current.next();
        }
    };

    if (loading) {
        return (
            <div className="project-images-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Ошибка загрузки изображений"
                description={error}
                type="error"
                showIcon
                className="project-images-error"
            />
        );
    }

    if (!imageUrls || imageUrls.length === 0) {
        return <div className="project-carousel-empty">Нет изображений</div>;
    }

    return (
        <Carousel className="project-carousel" ref={carouselRef} draggable swipeToSlide>
            {imageUrls.map((url, index) => (
                <div
                    className="project-carousel-slide"
                    key={`${url}-${index}`}
                    onMouseDown={handleSlideMouseDown}
                    onMouseUp={handleSlideMouseUp}
                >
                    <img
                        src={url}
                        alt={`${projectName || 'Проект'} ${index + 1}`}
                        draggable={false}
                        onError={(e) => {
                            console.error('Image failed to load:', url);
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            ))}
        </Carousel>
    );
};

// Значение по умолчанию для apiBaseUrl
ProjectImagesCarousel.defaultProps = {
    media: [],
    projectName: 'Проект',
    apiBaseUrl: ''
};

export default ProjectImagesCarousel;