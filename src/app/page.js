'use client'; 

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lobby from '@/components/Lobby';
import VideoPlayer from '@/components/VideoPlayer';
import Controls from '@/components/Controls';

export default function App() {
    const [isInCall, setIsInCall] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [userId] = useState('user_' + Math.random().toString(36).substring(2, 9));
    const [participants, setParticipants] = useState([]);
    const [micActive, setMicActive] = useState(true);
    const [camActive, setCamActive] = useState(true);
    const [screenShareActive, setScreenShareActive] = useState(false);
    const [translationMode, setTranslationMode] = useState('text_only');
    const [sourceLang, setSourceLang] = useState('pt-BR');
    const [targetLang, setTargetLang] = useState('en-US');

    const ws = useRef(null);
    const pc = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const cameraTrackRef = useRef(null);
    const subtitleTimeouts = useRef({});
    const audioContextRef = useRef(null);
    const audioQueuesRef = useRef({});

    const translationModeRef = useRef(translationMode);
    useEffect(() => {
        translationModeRef.current = translationMode;
    }, [translationMode]);

    const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    const sendMessage = (message) => {
        if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(message));
    };

    const handleJoin = (joinedRoomId, stream, langs) => {
        if (!joinedRoomId) { alert('Por favor, insira um nome para a sala.'); return; }
        if (!stream || stream.getVideoTracks().length === 0) { alert('A stream de mídia não está pronta.'); return; }
        
        const url = new URL(window.location);
        url.searchParams.set('room', joinedRoomId);
        window.history.pushState({}, '', url);

        localStreamRef.current = stream;
        cameraTrackRef.current = stream.getVideoTracks()[0];
        setSourceLang(langs.source);
        setTargetLang(langs.target);
        setRoomId(joinedRoomId);
        setIsInCall(true);

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const handleHangup = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
        
        localStreamRef.current = null; 
        screenStreamRef.current = null; 
        cameraTrackRef.current = null;
        
        setParticipants([]); 
        setIsInCall(false); 
        setRoomId(''); 
        setScreenShareActive(false);

        const url = new URL(window.location);
        url.searchParams.delete('room');
        window.history.pushState({}, '', url);
    }, []);

    const processAudioQueue = useCallback((participantId) => {
        const userAudio = audioQueuesRef.current[participantId];
        if (!userAudio || userAudio.isPlaying || userAudio.queue.length === 0 || !audioContextRef.current || audioContextRef.current.state === 'closed') return;

        userAudio.isPlaying = true;
        const audioChunk = userAudio.queue.shift();
        audioContextRef.current.decodeAudioData(audioChunk, (buffer) => {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => { userAudio.isPlaying = false; processAudioQueue(participantId); };
            source.start(0);
        }, (error) => {
            console.error('Error decoding audio data:', error);
            userAudio.isPlaying = false; processAudioQueue(participantId);
        });
    }, []);

    const createPeerConnection = useCallback(() => {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.onicecandidate = e => e.candidate && sendMessage({ type: 'candidate', candidate: e.candidate });
        peerConnection.ontrack = e => {
            const remoteUserId = e.track.id.split('_')[0];
            setParticipants(prev => {
                if (prev.find(p => p.id === remoteUserId)) return prev.map(p => p.id === remoteUserId ? { ...p, stream: e.streams[0] } : p);
                return [...prev, { id: remoteUserId, name: `Remoto ${remoteUserId.substring(0, 4)}`, stream: e.streams[0], isSpeaking: false, subtitle: '' }];
            });
        };
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => peerConnection.addTrack(track, localStreamRef.current));
        return peerConnection;
    }, [iceServers]);

    useEffect(() => {
        if (!isInCall || !roomId) return;
        pc.current = createPeerConnection();
        const connectWebSocket = () => {
            let wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://localhost:8000`;
            
            if (wsUrl.startsWith('wss://') && wsUrl.includes(':8000')) {
                wsUrl = wsUrl.replace(':8000', '');
            }

            ws.current = new WebSocket(`${wsUrl}/ws/${roomId}/${userId}`);
            
            ws.current.onopen = async () => {
                const offer = await pc.current.createOffer();
                await pc.current.setLocalDescription(offer);
                sendMessage({ type: 'offer', offer: pc.current.localDescription, source_lang: sourceLang, target_lang: targetLang });
            };
            ws.current.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                switch (msg.type) {
                    case 'answer': await pc.current.setRemoteDescription(new RTCSessionDescription(msg.answer)); break;
                    case 'candidate': if (pc.current.remoteDescription) await pc.current.addIceCandidate(new RTCIceCandidate(msg.candidate)); break;
                    case 'user-left': setParticipants(prev => prev.filter(p => p.id !== msg.user_id)); break;
                    case 'speaking': setParticipants(prev => prev.map(p => p.id === msg.from_user_id ? { ...p, isSpeaking: msg.speaking } : p)); break;
                    case 'subtitle':
                        setParticipants(prev => prev.map(p => {
                            if (p.id !== msg.from_user_id) return p;
                            if (subtitleTimeouts.current[msg.from_user_id]) clearTimeout(subtitleTimeouts.current[msg.from_user_id]);
                            subtitleTimeouts.current[msg.from_user_id] = setTimeout(() => setParticipants(prevSub => prevSub.map(pSub => pSub.id === msg.from_user_id ? { ...pSub, subtitle: '' } : pSub)), 5000);
                            return { ...p, subtitle: msg.text };
                        }));
                        break;
                    case 'translated_audio':
                        if (translationModeRef.current === 'audio_and_text') {
                            const audioData = atob(msg.audio_content);
                            const buffer = new ArrayBuffer(audioData.length);
                            const view = new Uint8Array(buffer);
                            for (let i = 0; i < audioData.length; i++) view[i] = audioData.charCodeAt(i);
                            if (!audioQueuesRef.current[msg.from_user_id]) audioQueuesRef.current[msg.from_user_id] = { queue: [], isPlaying: false };
                            audioQueuesRef.current[msg.from_user_id].queue.push(buffer);
                            processAudioQueue(msg.from_user_id);
                        }
                        break;
                }
            };
            ws.current.onclose = () => handleHangup();
            ws.current.onerror = (error) => {
                console.error("WebSocket Error:", error);
                // CORREÇÃO: Mensagem de erro de diagnóstico ainda mais detalhada
                let errorMessage = "Falha na ligação ao servidor WebSocket.\n\n";
                errorMessage += `URL de destino: ${wsUrl}\n\n`;
                errorMessage += "Isto é um problema de configuração do servidor (backend), não do frontend.\n\n";
                errorMessage += "GUIA DE DIAGNÓSTICO DO SERVIDOR:\n\n";
                errorMessage += "1. O PROCESSO DO BACKEND ESTÁ A CORRER?\n   - Aceda ao servidor e verifique se o processo Uvicorn/Python está ativo.\n\n";
                errorMessage += "2. CONFIGURAÇÃO DE PROXY REVERSO (NGINX, CADDY, ETC.) - CAUSA MAIS COMUM\n   - O seu proxy precisa de ser configurado para o protocolo WebSocket.\n   - Para NGINX, verifique se a sua configuração inclui:\n";
                errorMessage += "     proxy_set_header Upgrade $http_upgrade;\n";
                errorMessage += "     proxy_set_header Connection \"upgrade\";\n\n";
                errorMessage += "3. CERTIFICADO SSL/TLS\n   - O seu domínio tem um certificado SSL válido? Ligações 'wss://' falham sem um.\n\n";
                errorMessage += "4. FIREWALL\n   - A firewall do servidor permite tráfego na porta 443 (para wss://)?";

                alert(errorMessage);
                handleHangup();
            };
        };
        connectWebSocket();
        setParticipants([{ id: userId, name: 'Você', stream: localStreamRef.current, isMuted: true, isSpeaking: false, subtitle: '' }]);
        return () => handleHangup();
    }, [isInCall, roomId, userId, createPeerConnection, handleHangup, processAudioQueue, sourceLang, targetLang]);

    const toggleMic = () => { if (localStreamRef.current) { const e = !micActive; localStreamRef.current.getAudioTracks()[0].enabled = e; setMicActive(e); } };
    const toggleCam = () => { if (localStreamRef.current) { const e = !camActive; localStreamRef.current.getVideoTracks()[0].enabled = e; setCamActive(e); } };
    
    const stopScreenShare = useCallback(async () => {
        if (!pc.current || !cameraTrackRef.current) return;
        const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(cameraTrackRef.current);
        if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
        setParticipants(prev => prev.map(p => p.id === userId ? { ...p, stream: localStreamRef.current } : p));
        setScreenShareActive(false);
    }, [userId]);

    const startScreenShare = useCallback(async () => {
        if (!pc.current) return;
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = stream;
            const screenTrack = stream.getVideoTracks()[0];
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) await sender.replaceTrack(screenTrack);
            setParticipants(prev => prev.map(p => p.id === userId ? { ...p, stream: stream } : p));
            setScreenShareActive(true);
            screenTrack.onended = () => stopScreenShare();
        } catch (err) {
            if (err.name === 'NotAllowedError') alert('A partilha de ecrã foi bloqueada.');
            setScreenShareActive(false);
        }
    }, [userId, stopScreenShare]);
    
    const toggleScreenShare = () => screenShareActive ? stopScreenShare() : startScreenShare();
    
    const handleLanguageChange = (type, value) => {
        const newSettings = { source_lang: sourceLang, target_lang: targetLang };
        if (type === 'source') {
            setSourceLang(value);
            newSettings.source_lang = value;
        } else {
            setTargetLang(value);
            newSettings.target_lang = value;
        }
        sendMessage({ type: 'language-settings-change', ...newSettings });
    };

    const handleTranslationModeToggle = () => {
        const newMode = translationMode === 'text_only' ? 'audio_and_text' : 'text_only';
        setTranslationMode(newMode);
        sendMessage({ type: 'translation-mode-change', mode: newMode });
    };

    if (!isInCall) {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center"><Lobby onJoin={handleJoin} /></div>;
    }

    return (
        <div className="bg-slate-900 text-white w-full h-screen flex-col p-4 flex">
            <div id="video-grid" className="flex-1 w-full grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
                {participants.map(p => <VideoPlayer key={p.id} {...p} isMuted={p.id === userId} />)}
            </div>
            <div className="mt-4 flex items-center justify-center">
                 <Controls
                    roomId={roomId}
                    onMicToggle={toggleMic} onCamToggle={toggleCam} onScreenShareToggle={toggleScreenShare}
                    onLangChange={handleLanguageChange} onHangup={handleHangup} onTranslationModeToggle={handleTranslationModeToggle}
                    micActive={micActive} camActive={camActive} screenShareActive={screenShareActive}
                    translationMode={translationMode} sourceLang={sourceLang} targetLang={targetLang}
                />
            </div>
        </div>
    );
}
