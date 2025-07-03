'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlusIcon } from '@/components/Icons';

const Lobby = ({ onJoin }) => {
    const lobbyVideoRef = useRef(null);
    const lobbyStreamRef = useRef(null);
    const [roomId, setRoomId] = useState('');
    const [micDevices, setMicDevices] = useState([]);
    const [camDevices, setCamDevices] = useState([]);
    const [selectedMic, setSelectedMic] = useState('');
    const [selectedCam, setSelectedCam] = useState('');
    const [sourceLang, setSourceLang] = useState('pt-BR');
    const [targetLang, setTargetLang] = useState('en-US');
    const [isStreamReady, setIsStreamReady] = useState(false);

    const availableLangs = [
        { code: 'pt-BR', name: 'Português' },
        { code: 'en-US', name: 'Inglês' },
        { code: 'es-ES', name: 'Espanhol' },
        { code: 'fr-FR', name: 'Francês' },
        { code: 'de-DE', name: 'Alemão' },
        { code: 'ja-JP', name: 'Japonês' },
    ];

    const startLobbyStream = useCallback(async () => {
        setIsStreamReady(false);
        if (lobbyStreamRef.current) lobbyStreamRef.current.getTracks().forEach(track => track.stop());
        const constraints = {
            audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
            video: { deviceId: selectedCam ? { exact: selectedCam } : undefined, width: { ideal: 1280 }, height: { ideal: 720 } }
        };
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            lobbyStreamRef.current = stream;
            if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = stream;
            setIsStreamReady(true);
        } catch (error) {
            // CORREÇÃO: Renomeada a variável de erro para 'error' para resolver o aviso do linter
            console.error("Error getting lobby stream:", error);
            alert("Não foi possível aceder aos seus dispositivos.");
            setIsStreamReady(false);
        }
    }, [selectedMic, selectedCam]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('room')) setRoomId(urlParams.get('room'));
        const setupDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audio = devices.filter(d => d.kind === 'audioinput');
                const video = devices.filter(d => d.kind === 'videoinput');
                setMicDevices(audio); setCamDevices(video);
                if (audio.length > 0) setSelectedMic(audio[0].deviceId);
                if (video.length > 0) setSelectedCam(video[0].deviceId);
            } catch (error) { // CORREÇÃO: Renomeada a variável de erro
                console.error("Error setting up devices:", error); 
            }
        };
        setupDevices();
    }, []);

    useEffect(() => {
        if (selectedMic && selectedCam) startLobbyStream();
    }, [selectedMic, selectedCam, startLobbyStream]);

    const handleCreateMeeting = () => setRoomId(Math.random().toString(36).substring(2, 10));

    return (
        <div className="w-full max-w-2xl text-center p-4">
            <h1 className="text-3xl font-bold mb-4">Videochamada com Tradução</h1>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video w-full mx-auto mb-4 border-2 border-slate-700">
                <video ref={lobbyVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            </div>
            <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                    <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Insira ou crie um nome de sala" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" />
                    <button onClick={handleCreateMeeting} title="Criar Reunião" className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg"><PlusIcon /></button>
                </div>
                <div className="flex space-x-4">
                    <select value={selectedMic} onChange={e => setSelectedMic(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-3 text-white"><option disabled>Microfone</option>{micDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label}</option>)}</select>
                    <select value={selectedCam} onChange={e => setSelectedCam(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-3 text-white"><option disabled>Câmara</option>{camDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label}</option>)}</select>
                </div>
                <div className="flex space-x-4 text-left">
                    <div className="w-1/2">
                        <label className="text-sm text-slate-400 ml-1">Eu falo</label>
                        <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                            {availableLangs.map(lang => <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>)}
                        </select>
                    </div>
                    <div className="w-1/2">
                        <label className="text-sm text-slate-400 ml-1">Traduzir para</label>
                        <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                             {availableLangs.map(lang => <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <button onClick={() => onJoin(roomId, lobbyStreamRef.current, { source: sourceLang, target: targetLang })} disabled={!isStreamReady || !roomId} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-slate-500 disabled:cursor-not-allowed">
                {isStreamReady ? 'Entrar na Sala' : 'A carregar...'}
            </button>
        </div>
    );
};

export default Lobby;
