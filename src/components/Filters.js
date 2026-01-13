import React, { useState, useEffect } from 'react';
import { Slider, Button, Collapse, Row, Col, Spin } from 'antd';
import { apiFetch } from '../api/http';

const { Panel } = Collapse;

// Фиксированные опции этажей, так как отдельного API для них нет в задании
const floorOptions = [1, 2, 3];

// Начальное состояние фильтров (значения по умолчанию)
const initialFilters = {
  priceRange: [7000000, 17000000], // Будут обновлены при загрузке ranges
  areaRange: [60, 900],            // Будут обновлены при загрузке ranges
  selectedMaterials: [],
  selectedFloors: [],
};

const Filters = ({ filters, setFilters }) => {
  const [materialsList, setMaterialsList] = useState([]);
  const [ranges, setRanges] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка метаданных (материалы и диапазоны) при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Запрашиваем материалы и диапазоны параллельно
        const [materialsData, rangesData] = await Promise.all([
          apiFetch('/projects/materials'),
          apiFetch('/projects/ranges'),
        ]);

        setMaterialsList(materialsData);

        // Обновляем состояние диапазонов из API
        setRanges(rangesData);

        // Опционально: можно обновить состояние фильтров в родителе, чтобы значения ползунков совпадали с реальными min/max
        // Но для простоты оставим инициализацию как есть, ползунки просто получат новые пропсы min/max
      } catch (error) {
        console.error('Failed to load filters metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePriceChange = value => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };

  const handleAreaChange = value => {
    setFilters(prev => ({ ...prev, areaRange: value }));
  };

  const toggleInList = (key, value) => {
    setFilters(prev => {
      const current = prev[key];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const resetFilters = () => {
    // При сбросе возвращаемся к диапазонам из API, если они загружены, или к дефолтным
    const defaultRange = ranges
    ? { priceRange: [ranges.minPrice, ranges.maxPrice], areaRange: [ranges.minArea, ranges.maxArea] }
    : { ...initialFilters };

    setFilters({
      ...defaultRange,
      selectedMaterials: [],
      selectedFloors: [],
    });
  };

  if (isLoading) {
  return <div style={{ padding: '20px', textAlign: 'center' }}><Spin tip="Загрузка фильтров..." /></div>;
}

// Определяем границы для слайдеров
const minPrice = ranges?.minPrice || 0;
const maxPrice = ranges?.maxPrice || 20000000;
const minArea = ranges?.minArea || 0;
const maxArea = ranges?.maxArea || 1000;

return (
<div className="filters">
<Collapse
defaultActiveKey={['price', 'area', 'materials', 'floors']}
accordion={false}
>
<Panel header="Цена, ₽" key="price">
<Slider
range
min={minPrice}
max={maxPrice}
step={50000}
value={filters.priceRange}
onChange={handlePriceChange}
tooltip={{ formatter: value => `${value?.toLocaleString('ru-RU')} ₽` }}
/>
</Panel>

<Panel header="Площадь (м²)" key="area">
<Slider
range
min={minArea}
max={maxArea}
step={5}
value={filters.areaRange}
onChange={handleAreaChange}
tooltip={{ formatter: value => `${value} м²` }}
/>
</Panel>

<Panel header="Материал / технология" key="materials">
<Row gutter={[8, 8]}>
{materialsList.map(material => (
<Col span={12} key={material.code}>
<Button
block
type={filters.selectedMaterials.includes(material.code) ? 'primary' : 'default'}
onClick={() => toggleInList('selectedMaterials', material.code)}
>
{material.name}
</Button>
</Col>
))}
</Row>
</Panel>

<Panel header="Этажность" key="floors">
<Row gutter={[8, 8]}>
{floorOptions.map(floor => (
<Col span={8} key={floor}>
<Button
block
type={filters.selectedFloors.includes(floor) ? 'primary' : 'default'}
onClick={() => toggleInList('selectedFloors', floor)}
>
{floor}
</Button>
</Col>
))}
</Row>
</Panel>
</Collapse>

<Button className="filters-reset" size="large" block onClick={resetFilters} style={{ marginTop: 12 }}>
Сбросить фильтры
</Button>
</div>
);
};

export default Filters;