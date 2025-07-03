import React from 'react';

// CORREÇÃO: Os ícones de Mic e Cam agora recebem uma propriedade 'active' para decidir qual SVG renderizar.
// Isto resolve o erro do linter sobre "variáveis não utilizadas".
const MicOnSvg = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const MicOffSvg = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.586 15.586a2 2 0 01-2.828 0L6 8.414m12 0L9.414 15M19 11a7 7 0 01-14 0" /></svg>;
export const MicOnIcon = ({ active }) => active ? <MicOnSvg /> : <MicOffSvg />;

const CamOnSvg = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CamOffSvg = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 13.828l-2.828-2.828m2.828 2.828l2.828 2.828M11 11L8.172 8.172m2.828 2.828l-2.828 2.828M3 8.172L5.828 11m5.172.001L14.172 8.172M5.828 5.828L8.172 3m2.828-.001L13.828 5.828m0 5.172l2.828 2.828M5.828 13.828L3 16.172" /></svg>;
export const CamOnIcon = ({ active }) => active ? <CamOnSvg /> : <CamOffSvg />;

export const HangupIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2 2m-2-2v4.5A2.5 2.5 0 0115.5 13H12a1 1 0 00-1 1v5a1 1 0 001 1h.5a2.5 2.5 0 012.5 2.5V22m-7-14l-2 2m0 0l-2-2m2 2V4.5A2.5 2.5 0 006.5 2H4a1 1 0 00-1 1v5a1 1 0 001 1h.5A2.5 2.5 0 007.5 13v4.5" /></svg>;
export const CopyIcon = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6zm8 2V5a1 1 0 00-1-1H7a1 1 0 00-1 1v.083l.083.083L7.167 6H13a1 1 0 011 1v7.167l.083.083L14.25 15H6V6h.25l.833-.833L7.167 5H14z" /></svg>;
export const ScreenShareIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
export const PlusIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
export const SubtitlesOnlyIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
export const VoiceAndSubtitlesIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10m-5 9.25V3.75M3.75 9.25h16.5M12 3.75a9 9 0 100 18 9 9 0 000-18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
