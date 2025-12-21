import React from 'react';
import { Slider, Button, Collapse, Row, Col } from 'antd';

const { Panel } = Collapse;

const materialOptions = ['Кирпич', 'Монолит', 'Клееный брус'];
const floorOptions = [1, 2, 3];
const roomOptions = [2, 3, 4, 5, 6, 7, 8];
const bedroomOptions = [1, 2, 3, 4, 5, 6];
const bathroomOptions = [1, 2, 3];

const initialFilters = {
  priceRange: [7000000, 17000000],
  areaRange: [60, 900],
  selectedMaterials: [],
  selectedFloors: [],
  selectedRooms: [],
  selectedBedrooms: [],
  selectedBathrooms: [],
};

const Filters = ({ filters, setFilters }) => {
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
    setFilters({ ...initialFilters });
  };

  return (
    <div className="filters">
      <Collapse
        defaultActiveKey={['price', 'area', 'materials', 'floors', 'rooms', 'bedrooms', 'bathrooms']}
        accordion={false}
      >
        <Panel header="Цена, ₽" key="price">
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

        <Panel header="Площадь (м²)" key="area">
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
              <Col span={12} key={material}>
                <Button
                  block
                  type={filters.selectedMaterials.includes(material) ? 'primary' : 'default'}
                  onClick={() => toggleInList('selectedMaterials', material)}
                >
                  {material}
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

        <Panel header="Количество комнат" key="rooms">
          <Row gutter={[8, 8]}>
            {roomOptions.map(room => (
              <Col span={8} key={room}>
                <Button
                  block
                  type={filters.selectedRooms.includes(room) ? 'primary' : 'default'}
                  onClick={() => toggleInList('selectedRooms', room)}
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
                  type={filters.selectedBedrooms.includes(bedroom) ? 'primary' : 'default'}
                  onClick={() => toggleInList('selectedBedrooms', bedroom)}
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
                  type={filters.selectedBathrooms.includes(bathroom) ? 'primary' : 'default'}
                  onClick={() => toggleInList('selectedBathrooms', bathroom)}
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
