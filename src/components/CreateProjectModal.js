import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, message, Modal, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createProject, uploadFile } from '../api/ordersApi';

const MEDIA_TYPES = ['RENDER', 'PHOTO', 'PLAN'];

const CreateProjectModal = ({ open, onClose, materialOptions, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setFileList([]);
  }, [open, form]);

  const materialSelectOptions = useMemo(
    () => materialOptions.map(option => ({ value: option.code, label: option.name })),
    [materialOptions]
  );

  const handleFilesChange = info => {
    const nextList = info.fileList.slice(0, 3);
    setFileList(nextList);
  };

  const handleBeforeUpload = () => false;

  const handleSubmit = async values => {
    if (fileList.length !== 3) {
      message.error('Загрузите 3 изображения проекта.');
      return;
    }

    setLoading(true);
    try {
      const uploaded = [];
      for (const file of fileList) {
        const response = await uploadFile(file.originFileObj || file);
        uploaded.push(response);
      }

      const media = uploaded.map((item, index) => ({
        type: MEDIA_TYPES[index],
        url: item.url,
        sortOrder: index + 1,
      }));

      const payload = {
        name: values.name,
        totalArea: values.totalArea,
        floors: values.floors,
        basePrice: values.basePrice,
        mainMaterials: values.mainMaterials,
        description: values.description || null,
        media,
      };

      const created = await createProject(payload);
      message.success('Проект добавлен.');
      onSuccess?.(created);
      onClose?.();
    } catch (error) {
      message.error(error?.message || 'Не удалось создать проект.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Добавить проект"
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Введите название проекта.' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="totalArea"
          label="Площадь"
          rules={[{ required: true, message: 'Введите площадь проекта.' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="floors"
          label="Этажи"
          rules={[{ required: true, message: 'Введите количество этажей.' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="basePrice"
          label="Цена"
          rules={[{ required: true, message: 'Введите цену проекта.' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="mainMaterials"
          label="Материал"
          rules={[{ required: true, message: 'Выберите материал.' }]}
        >
          <Select options={materialSelectOptions} placeholder="Выберите материал" />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Изображения (3 шт.)" required>
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleFilesChange}
            beforeUpload={handleBeforeUpload}
            maxCount={3}
          >
            {fileList.length < 3 && (
              <Button icon={<UploadOutlined />}>Загрузить</Button>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Создать проект
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
