'use client';

import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ id, stream, name, isMuted, isSpeaking, subtitle }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div id={`wrapper-${id}`} className={`video-wrapper ${isSpeaking ? 'speaking-indicator' : ''}`}>
            <video ref={videoRef} id={`video-${id}`} autoPlay playsInline muted={isMuted} />
            <div className="absolute bottom-4 left-4 text-white font-semibold bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                {name}
            </div>
            <div className={`subtitle-container ${subtitle ? 'visible' : ''}`}>
                <p className="subtitle-text">{subtitle}</p>
            </div>
        </div>
    );
};

export default VideoPlayer;
