import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Input, Button, Avatar, List, Typography, Empty, Divider, Tag } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext'; // Импортируем ваш контекст

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// URL вашего WebSocket эндпоинта
const WS_URL = process.env.REACT_APP_API_BASE_URL
? process.env.REACT_APP_API_BASE_URL.replace('/api', '') + '/ws'
: 'http://localhost:8088/ws';

const ChatComponent = ({ orderId }) => {
    // Получаем token и user из вашего AuthContext
    const { user, token } = useAuth();

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [connected, setConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Refs для Stomp клиента и контейнера сообщений
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Подключение к WebSocket
    useEffect(() => {
        if (!orderId) return;

        // 1. Инициализация SockJS
        const socket = new SockJS(WS_URL);

        // 2. Настройка STOMP клиента
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // 3. ПЕРЕДАЧА ТОКЕНА (ВАЖНО)
            connectHeaders: {
                // Используем токен из AuthContext
                Authorization: token ? `Bearer ${token}` : undefined
            },

            onConnect: () => {
                console.log('WebSocket Connected');
                setConnected(true);

                // Подписываемся на топик заказа
                client.subscribe(`/topic/orders/${orderId}/chat`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                setConnected(false);
            },
            onDisconnect: () => {
                console.log('WebSocket Disconnected');
                setConnected(false);
            }
        });

        client.activate();
        stompClientRef.current = client;

        // Очистка при размонтировании
        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [orderId, token]); // Добавили token в зависимости

    // Автоматическая прокрутка вниз при появлении новых сообщений
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || !connected || !stompClientRef.current) return;

        setIsSending(true);

        // Формируем тело запроса согласно SendMessageRequest DTO
        const messagePayload = JSON.stringify({
            content: inputValue.trim()
        });

        // Отправка через WebSocket
        stompClientRef.current.publish({
            destination: `/app/chat/${orderId}/send`,
            body: messagePayload,
        });

        setInputValue('');
        setIsSending(false);
    };

    // Форматирование даты из OffsetDateTime (ISO String)
    const formatDate = (createdAt) => {
        if (!createdAt) return '';
        const date = new Date(createdAt);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    // Проверка, является ли сообщение моим
    const isMyMessage = (senderId) => {
        if (!user || !senderId) return false;

        // Приводим к строке для корректного сравнения
        // ID может прийти как Long (число) из Java, а в user храниться как String
        const currentUserId = String(user.login || user.id || user.sub);
        const messageSenderId = String(senderId);

        return currentUserId === messageSenderId;
    };

    const renderMessage = (item) => {
        // Обработка системных сообщений
        if (item.type === 'SYSTEM') {
        return (
    <div key={item.id} style={styles.systemMessage}>
    <Text type="secondary" style={{ fontSize: '12px' }}>
    {item.content}
    </Text>
    <br />
    <Text type="secondary" style={{ fontSize: '10px' }}>
    {formatDate(item.createdAt)}
    </Text>
    </div>
    );
}

// Обычные сообщения чата
const isMe = isMyMessage(item.senderId);

return (
<div key={item.id} style={isMe ? styles.messageRight : styles.messageLeft}>
{!isMe && (
<Avatar size="small" style={{ backgroundColor: '#87d068', marginRight: '8px' }} icon={<UserOutlined />} />
)}

<div style={styles.bubbleContainer}>
{!isMe && (
<div style={styles.senderName}>{item.senderName || 'Менеджер'}</div>
)}
<div style={isMe ? styles.bubbleMy : styles.bubbleOther}>
<Text style={{ color: isMe ? '#fff' : '#000' }}>{item.content}</Text>
</div>
<Text type="secondary" style={styles.timestamp}>
{formatDate(item.createdAt)}
</Text>
</div>
</div>
);
};

if (!orderId) {
return <Empty description="Выберите заказ для начала чата" />;
}

return (
<div style={styles.chatContainer}>
{/* Заголовок чата */}
<div style={styles.chatHeader}>
<div>
<Text strong style={{fontSize: '16px'}}>Чат по заявке #{orderId}</Text>
<div style={{marginTop: 4}}>
<Tag color={connected ? 'green' : 'red'} icon={connected ? <CheckCircleOutlined /> : null}>
{connected ? 'Онлайн' : 'Офлайн'}
</Tag>
</div>
</div>
</div>

{/* Область сообщений */}
<div style={styles.messagesArea}>
{messages.length === 0 ? (
<Empty
image={Empty.PRESENTED_IMAGE_SIMPLE}
description="Чат пуст. Напишите первое сообщение"
style={{ marginTop: '50px' }}
/>
) : (
<>
{messages.map(renderMessage)}
<div ref={messagesEndRef} />
</>
)}
</div>

{/* Поле ввода */}
<div style={styles.inputArea}>
<TextArea
rows={2}
placeholder={!connected ? "Подключение к серверу..." : "Введите сообщение..."}
value={inputValue}
onChange={(e) => setInputValue(e.target.value)}
onPressEnter={(e) => {
if (e.shiftKey) return; // Разрешаем перенос строки на Shift+Enter
e.preventDefault();
handleSendMessage();
}}
disabled={!connected}
style={{ resize: 'none' }}
maxLength={3000} // Ограничение из SendMessageRequest
showCount
/>
<Button
type="primary"
icon={<SendOutlined />}
onClick={handleSendMessage}
loading={isSending}
disabled={!inputValue.trim() || !connected}
style={{ marginLeft: '8px', height: '100%' }}
>
Отправить
</Button>
</div>
</div>
);
};

const styles = {
chatContainer: {
display: 'flex',
flexDirection: 'column',
height: '600px',
border: '1px solid #d9d9d9',
borderRadius: '8px',
backgroundColor: '#fff'
},
chatHeader: {
padding: '12px 16px',
borderBottom: '1px solid #f0f0f0',
backgroundColor: '#fafafa',
borderRadius: '8px 8px 0 0'
},
messagesArea: {
flex: 1,
padding: '16px',
overflowY: 'auto',
backgroundColor: '#f7f7f7',
display: 'flex',
flexDirection: 'column'
},
messageLeft: {
display: 'flex',
marginBottom: '16px',
justifyContent: 'flex-start',
maxWidth: '70%'
},
messageRight: {
display: 'flex',
marginBottom: '16px',
justifyContent: 'flex-end',
marginLeft: 'auto',
maxWidth: '70%'
},
systemMessage: {
textAlign: 'center',
margin: '12px 0',
display: 'flex',
flexDirection: 'column',
alignItems: 'center'
},
bubbleContainer: {
display: 'flex',
flexDirection: 'column'
},
senderName: {
fontSize: '12px',
color: '#8c8c8c',
marginBottom: '4px',
marginLeft: '2px'
},
bubbleMy: {
padding: '10px 14px',
borderRadius: '12px',
backgroundColor: '#1890ff',
color: '#fff',
wordBreak: 'break-word'
},
bubbleOther: {
padding: '10px 14px',
borderRadius: '12px',
backgroundColor: '#fff',
border: '1px solid #e8e8e8',
wordBreak: 'break-word'
},
timestamp: {
fontSize: '10px',
marginTop: '4px',
textAlign: 'right'
},
inputArea: {
padding: '12px',
borderTop: '1px solid #f0f0f0',
display: 'flex',
borderRadius: '0 0 8px 8px',
backgroundColor: '#fff'
}
};

export default ChatComponent;