import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { createOrder } from '../api/ordersApi';

const CreateOrderModal = ({ open, project, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && project) {
            form.setFieldsValue({
                projectTemplateId: project.id,
                email: user?.email || '',
                phone: user?.phone || '',
            });
        }
    }, [open, project, form, user]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await createOrder({
                ...values,
                customerId: user?.id,
                projectTemplateId: project.id,
            });

            message.success('Заявка успешно создана!');
            form.resetFields();
            onSuccess?.();
            onClose?.();
        } catch (error) {
            message.error(error.message || 'Ошибка при создании заявки');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Создание заявки на строительство"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="projectTemplateId"
                    hidden
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Выбранный проект"
                >
                    <Input
                        value={project?.name}
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    label="Адрес строительства"
                    name="address"
                    rules={[{ required: true, message: 'Введите адрес строительства' }]}
                >
                    <Input placeholder="Например: Московская область, г. Красногорск, ул. Ленина, д. 15" />
                </Form.Item>

                <Form.Item
                    label="Желаемые сроки"
                    name="requestedTimeline"
                >
                    <Input placeholder="Например: 6-8 месяцев" />
                </Form.Item>

                <Form.Item
                    label="Контактный телефон"
                    name="phone"
                    rules={[{ required: true, message: 'Введите телефон для связи' }]}
                >
                    <Input placeholder="+7-999-999-99-99" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Введите email' },
                        { type: 'email', message: 'Некорректный email' },
                    ]}
                >
                    <Input placeholder="email@example.com" />
                </Form.Item>

                <Form.Item style={{ marginTop: 32 }}>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Отправить заявку
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateOrderModal;