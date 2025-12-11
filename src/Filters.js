// src/Filters.js
import React, { useState } from 'react';
import { Slider, Button, Collapse, Row, Col } from 'antd';

const { Panel } = Collapse;

const Filters = () => {
  const [priceRange, setPriceRange] = useState([7000000, 17000000]);
  const [areaRange, setAreaRange] = useState([65, 900]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);
  const [selectedBathrooms, setSelectedBathrooms] = useState([]);

  const handlePriceChange = value => {
    setPriceRange(value);
  };

  const handleAreaChange = value => {
    setAreaRange(value);
  };

  const toggleMaterial = material => {
    setSelectedMaterials(prev => 
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  };

  const toggleFilter = (filter, value) => {
    const stateMap = {
      floors: setSelectedFloors,
      rooms: setSelectedRooms,
      bedrooms: setSelectedBedrooms,
      bathrooms: setSelectedBathrooms
    };
    const setter = stateMap[filter];
    setter(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const resetFilters = () => {
    setPriceRange([7000000, 17000000]);
    setAreaRange([65, 900]);
    setSelectedMaterials([]);
    setSelectedFloors([]);
    setSelectedRooms([]);
    setSelectedBedrooms([]);
    setSelectedBathrooms([]);
  };

  return (
    <div className="filters">
      <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6']} accordion={false}>
        <Panel header="Цена" key="1">
          <Slider 
            range 
            min={7000000} 
            max={17000000} 
            step={100000} 
            value={priceRange} 
            onChange={handlePriceChange}
          />
        </Panel>

        <Panel header="Площадь (м²)" key="2">
          <Slider 
            range 
            min={65} 
            max={900} 
            step={10} 
            value={areaRange} 
            onChange={handleAreaChange}
          />
        </Panel>

        <Panel header="Материалы" key="3">
          <Row gutter={[8, 8]}>
            {['Кирпич', 'Клееный брус', 'Монолит'].map(material => (
              <Col span={8} key={material}>
                <Button 
                  type={selectedMaterials.includes(material) ? 'primary' : 'default'}
                  onClick={() => toggleMaterial(material)}
                >
                  {material}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Этажность" key="4">
          <Row gutter={[8, 8]}>
            {[1, 2, 3].map(floor => (
              <Col span={8} key={floor}>
                <Button 
                  type={selectedFloors.includes(floor) ? 'primary' : 'default'}
                  onClick={() => toggleFilter('floors', floor)}
                >
                  {floor}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Количество комнат" key="5">
          <Row gutter={[8, 8]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(room => (
              <Col span={8} key={room}>
                <Button 
                  type={selectedRooms.includes(room) ? 'primary' : 'default'}
                  onClick={() => toggleFilter('rooms', room)}
                >
                  {room}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>

        <Panel header="Количество спален" key="6">
          <Row gutter={[8, 8]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(bedroom => (
              <Col span={8} key={bedroom}>
                <Button 
                  type={selectedBedrooms.includes(bedroom) ? 'primary' : 'default'}
                  onClick={() => toggleFilter('bedrooms', bedroom)}
                >
                  {bedroom}
                </Button>
              </Col>
            ))}
          </Row>
        </Panel>
      </Collapse>
      
      <Button type="link" onClick={resetFilters}>Сбросить фильтры</Button>
    </div>
  );
};

export default Filters;
