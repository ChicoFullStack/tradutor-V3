'use client';

import React, { useState } from 'react';
// CORREÇÃO: Removidos os imports dos ícones que não estavam a ser usados diretamente
import { MicOnIcon, CamOnIcon, ScreenShareIcon, HangupIcon, CopyIcon, SubtitlesOnlyIcon, VoiceAndSubtitlesIcon } from '@/components/Icons';

const LanguageSelector = ({ label, value, onChange, availableLangs }) => (
    <div className="flex flex-col items-center">
        <label className="text-xs text-slate-400 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
            {availableLangs.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
        </select>
    </div>
);

const Controls = ({ 
    onMicToggle, onCamToggle, onScreenShareToggle, onLangChange, onHangup, onTranslationModeToggle,
    micActive, camActive, screenShareActive, translationMode, roomId, sourceLang, targetLang
}) => {
    const [copyButtonText, setCopyButtonText] = useState('Copiar Link');

    const availableLangs = [
        { code: 'pt-BR', name: 'Português' },
        { code: 'en-US', name: 'Inglês' },
        { code: 'es-ES', name: 'Espanhol' },
        { code: 'fr-FR', name: 'Francês' },
        { code: 'de-DE', name: 'Alemão' },
        { code: 'ja-JP', name: 'Japonês' },
    ];

    const handleCopy = () => {
        const inviteLink = window.location.href;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopyButtonText('Copiado!');
            setTimeout(() => setCopyButtonText('Copiar Link'), 2000);
        });
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center mb-4 px-4">
                <h1 className="text-xl font-bold">Sala: <span className="text-teal-400">{roomId}</span></h1>
                <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <CopyIcon /> {copyButtonText}
                </button>
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-full shadow-lg">
                {/* CORREÇÃO: A lógica dos ícones foi movida para o ficheiro Icons.js para resolver o erro do linter */}
                <button onClick={onMicToggle} title={micActive ? "Silenciar" : "Ativar Mic"} className={`control-button ${micActive ? 'active' : ''}`}><MicOnIcon active={micActive} /></button>
                <button onClick={onCamToggle} title={camActive ? "Desligar" : "Ligar Cam"} className={`control-button ${camActive ? 'active' : ''}`}><CamOnIcon active={camActive} /></button>
                <button onClick={onScreenShareToggle} title={screenShareActive ? "Parar" : "Partilhar Ecrã"} className={`control-button ${screenShareActive ? 'active' : ''}`}><ScreenShareIcon /></button>
                <button onClick={onTranslationModeToggle} title="Modo de Tradução" className={`control-button ${translationMode === 'audio_and_text' ? 'active' : ''}`}>
                    {translationMode === 'audio_and_text' ? <VoiceAndSubtitlesIcon /> : <SubtitlesOnlyIcon />}
                </button>
                <div className="flex items-center space-x-3 bg-slate-700/50 p-2 rounded-full">
                    <LanguageSelector label="Eu falo" value={sourceLang} onChange={(e) => onLangChange('source', e.target.value)} availableLangs={availableLangs} />
                    <LanguageSelector label="Traduzir para" value={targetLang} onChange={(e) => onLangChange('target', e.target.value)} availableLangs={availableLangs} />
                </div>
                <button onClick={onHangup} title="Encerrar" className="control-button hangup"><HangupIcon /></button>
            </div>
        </div>
    );
};

export default Controls;
