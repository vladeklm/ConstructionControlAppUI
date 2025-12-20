import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, message, Modal, Select, Tabs } from 'antd';
import { useAuth } from '../auth/AuthContext';

const ROLE_OPTIONS = [{ value: 'CUSTOMER', label: 'CUSTOMER' }];
const PHONE_PATTERN = /^(\+7|8)(?:-\d{3}){2}(?:-\d{2}){2}$/;

const pickDisplayName = user => user?.fullName || user?.login || '';

const formatPhone = value => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  let prefix = '+7';
  let rest = digits;

  if (digits[0] === '8') {
    prefix = '8';
    rest = digits.slice(1);
  } else if (digits[0] === '7') {
    prefix = '+7';
    rest = digits.slice(1);
  }

  rest = rest.slice(0, 10);

  const parts = [];
  if (rest.length > 0) parts.push(rest.slice(0, 3));
  if (rest.length > 3) parts.push(rest.slice(3, 6));
  if (rest.length > 6) parts.push(rest.slice(6, 8));
  if (rest.length > 8) parts.push(rest.slice(8, 10));

  return parts.length ? `${prefix}-${parts.join('-')}` : prefix;
};

export default function AuthModal({ open, initialTab = 'login', onClose }) {
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    loginForm.resetFields();
    registerForm.resetFields();
  }, [open, initialTab, loginForm, registerForm]);

  const tabItems = useMemo(
    () => [
      { key: 'login', label: 'Вход' },
      { key: 'register', label: 'Регистрация' },
    ],
    []
  );

  const handleFinishLogin = async values => {
    setLoading(true);
    try {
      const result = await signIn({ login: values.login, password: values.password });
      message.success(`Вы вошли как ${pickDisplayName(result) || values.login}`);
      onClose?.();
    } catch (err) {
      message.error(err?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRegister = async values => {
    setLoading(true);
    try {
      const result = await signUp({
        login: values.login,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
      });
      message.success(`Аккаунт создан: ${pickDisplayName(result) || values.login}`);
      onClose?.();
    } catch (err) {
      message.error(err?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Авторизация"
      className="auth-modal"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {activeTab === 'login' ? (
        <Form form={loginForm} layout="vertical" onFinish={handleFinishLogin}>
          <Form.Item
            name="login"
            label="Логин"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form form={registerForm} layout="vertical" onFinish={handleFinishRegister}>
          <Form.Item
            name="login"
            label="Логин"
            rules={[{ required: true, message: 'Введите логин' }]}
          >
            <Input autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Повторите пароль"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Повторите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Телефон"
            normalize={formatPhone}
            rules={[
              { required: true, message: 'Введите телефон' },
              { pattern: PHONE_PATTERN, message: 'Неверный формат телефона' },
            ]}
          >
            <Input autoComplete="tel" inputMode="tel" placeholder="+7-999-999-99-99" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            initialValue="CUSTOMER"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
