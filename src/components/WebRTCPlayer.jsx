import React, { useEffect, useRef, useState } from 'react';
import MediaMTXWebRTCReader from '../utils/MediaMTXWebRTCReader';
import { apiFetch } from '../api/http';

const WebRTCPlayer = ({ constructionObjectId }) => {
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const readerRef = useRef(null);

    useEffect(() => {
        if (!constructionObjectId) return;

        const initStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await apiFetch(`/cameras/${constructionObjectId}/stream-url`);

                const streamUrl = data.url;

                const reader = new MediaMTXWebRTCReader({
                    url: streamUrl,
                    onTrack: (evt) => {
                        console.log("Track received", evt);
                        if (videoRef.current) {
                            videoRef.current.srcObject = evt.streams[0];
                            setIsLoading(false);
                        }
                    },
                    onError: (err) => {
                        console.error("Stream error:", err);
                        setError("Ошибка подключения к камере");
                        setIsLoading(false);
                    }
                });

                readerRef.current = reader;

            } catch (err) {
                console.error("Init error:", err);
                setError("Не удалось получить адрес трансляции");
                setIsLoading(false);
            }
        };

        initStream();

        return () => {
            if (readerRef.current) {
                console.log("Closing reader");
                readerRef.current.close();
                readerRef.current = null;
            }
        };
    }, [constructionObjectId]);

    return (
        <div style={styles.container}>
            {error && <div style={styles.error}>{error}</div>}

            {isLoading && !error && <div style={styles.loading}>Подключение к камере...</div>}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={false}
                style={styles.video}
            />
        </div>
    );
};

const styles = {
    container: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },
    video: {
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        objectFit: 'contain',
        borderRadius: '4px'
    },
    loading: {
        color: '#fff',
        padding: '20px'
    },
    error: {
        color: '#ff6b6b',
        padding: '10px',
        background: '#2c0000',
        marginBottom: '10px',
        width: '100%',
        textAlign: 'center',
        borderRadius: '4px'
    }
};

export default WebRTCPlayer;