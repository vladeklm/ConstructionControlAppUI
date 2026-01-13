import React from 'react';
import { Slider, Button, Collapse, Row, Col } from 'antd';

const { Panel } = Collapse;

const floorOptions = [1, 2, 3];
const roomOptions = [2, 3, 4, 5, 6, 7, 8];
const bedroomOptions = [1, 2, 3, 4, 5, 6];
const bathroomOptions = [1, 2, 3];

const initialFilters = {
  priceRange: [7000000, 17000000],
  areaRange: [60, 900],
  selectedMaterial: null,
  selectedFloor: null,
  selectedRooms: [],
  selectedBedrooms: [],
  selectedBathrooms: [],
};

const Filters = ({ filters, setFilters, materialOptions = [] }) => {
  const handlePriceChange = value => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };

  const handleAreaChange = value => {
    setFilters(prev => ({ ...prev, areaRange: value }));
  };

  const toggleSingle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const resetFilters = () => {
    setFilters({ ...initialFilters });
  };

  return (
    <div className="filters">
      <Collapse
        defaultActiveKey={['price', 'area', 'materials', 'floors', 'rooms', 'bedrooms', 'bathrooms']}
        accordion={false}
      >
        <Panel header={<span>Цена <span className="filter-value">{filters.priceRange[0].toLocaleString('ru-RU')} - {filters.priceRange[1].toLocaleString('ru-RU')} ₽</span></span>} key="price">
          <Slider
            range
            min={7000000}
            max={17000000}
            step={50000}
            value={filters.priceRange}
            onChange={handlePriceChange}
            tooltip={{ formatter: value => `${value?.toLocaleString('ru-RU')} ₽` }}
          />
        </Panel>

        <Panel header={<span>Площадь <span className="filter-value">{filters.areaRange[0]} - {filters.areaRange[1]} м²</span></span>} key="area">
          <Slider
            range
            min={60}
            max={900}
            step={10}
            value={filters.areaRange}
            onChange={handleAreaChange}
            tooltip={{ formatter: value => `${value} м²` }}
          />
        </Panel>

        <Panel header="Материал / технология" key="materials">
          <Row gutter={[8, 8]}>
            {materialOptions.map(material => (
              <Col span={12} key={material.code}>
                <Button
                  block
                  type={filters.selectedMaterial === material.code ? 'primary' : 'default'}
                  onClick={() => toggleSingle('selectedMaterial', material.code)}
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
                  type={filters.selectedFloor === floor ? 'primary' : 'default'}
                  onClick={() => toggleSingle('selectedFloor', floor)}
                >
                  {floor}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Количество комнат" key="rooms">
          <Row gutter={[8, 8]}>
            {roomOptions.map(room => (
              <Col span={8} key={room}>
                <Button
                  block
                  disabled
                  type={filters.selectedRooms.includes(room) ? 'primary' : 'default'}
                >
                  {room}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Количество спален" key="bedrooms">
          <Row gutter={[8, 8]}>
            {bedroomOptions.map(bedroom => (
              <Col span={8} key={bedroom}>
                <Button
                  block
                  disabled
                  type={filters.selectedBedrooms.includes(bedroom) ? 'primary' : 'default'}
                >
                  {bedroom}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Количество санузлов" key="bathrooms">
          <Row gutter={[8, 8]}>
            {bathroomOptions.map(bathroom => (
              <Col span={8} key={bathroom}>
                <Button
                  block
                  disabled
                  type={filters.selectedBathrooms.includes(bathroom) ? 'primary' : 'default'}
                >
                  {bathroom}
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
