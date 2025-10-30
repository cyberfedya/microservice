// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\CorrespondenceView.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Correspondence, Department } from '../types';
import { getDepartments, archiveDocument, unarchiveDocument } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useCorrespondence } from '../hooks/useCorrespondence';
import { useCorrespondenceActions } from '../hooks/useCorrespondenceActions';
import { getStageDisplayName } from '../constants';
import { ArrowLeftIcon, CheckIcon, ClockIcon, XMarkIcon } from './icons/IconComponents';
import DocumentEditorPreview from './DocumentEditorPreview';
import AIAssistant from './AIAssistant';
import DocumentActions from './DocumentActions';
import ExecutorsModal from './ExecutorsModal';
import AuditTrail from './AuditTrail';
import SendDocumentModal from './SendDocumentModal';

// Вспомогательный компонент для отображения статуса
const StatusBadge: React.FC<{ status?: 'PENDING' | 'APPROVED' | 'REJECTED' }> = ({ status }) => {
    if (status === 'APPROVED') return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckIcon className="w-4 h-4" /> Tasdiqlangan</span>;
    if (status === 'REJECTED') return <span className="flex items-center gap-1 text-xs text-red-400"><XMarkIcon className="w-4 h-4" /> Rad etilgan</span>;
    return <span className="flex items-center gap-1 text-xs text-amber-400"><ClockIcon className="w-4 h-4" /> Kutilmoqda</span>;
};

const CorrespondenceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const { correspondence, setCorrespondence, users, loading, error, refetch } = useCorrespondence(id);

    const [isExecutorsModalOpen, setIsExecutorsModalOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showAdvancedActions, setShowAdvancedActions] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const handleActionComplete = (updatedDoc?: Correspondence) => {
        if (updatedDoc && updatedDoc.id) {
            setCorrespondence(updatedDoc);
        } else {
            refetch();
        }
    };

    const { isActionLoading, updateExecutors } = useCorrespondenceActions(correspondence, handleActionComplete);

    const handleArchive = async () => {
        if (!correspondence?.id) return;
        
        if (!confirm('Вы уверены, что хотите архивировать этот документ?')) return;
        
        setIsArchiving(true);
        try {
            await archiveDocument(correspondence.id);
            alert('Документ успешно архивирован!');
            refetch();
        } catch (error: any) {
            alert(`Ошибка при архивировании: ${error.message}`);
        } finally {
            setIsArchiving(false);
        }
    };

    const handleUnarchive = async () => {
        if (!correspondence?.id) return;
        
        if (!confirm('Вы уверены, что хотите извлечь этот документ из архива?')) return;
        
        setIsArchiving(true);
        try {
            await unarchiveDocument(correspondence.id);
            alert('Документ успешно извлечен из архива!');
            refetch();
        } catch (error: any) {
            alert(`Ошибка при извлечении: ${error.message}`);
        } finally {
            setIsArchiving(false);
        }
    };

    useEffect(() => {
        // Listen for custom event to open modal
        const openModalHandler = () => handleOpenExecutorsModal();
        window.addEventListener('openExecutorsModal' as any, openModalHandler);
        return () => window.removeEventListener('openExecutorsModal' as any, openModalHandler);
    }, [correspondence]);

    useEffect(() => {
        // Load departments for send modal
        getDepartments().then(setDepartments).catch(console.error);
    }, []);

    const handleOpenExecutorsModal = () => {
        setIsExecutorsModalOpen(true);
    };

    const handleUpdateExecutors = (payload: { mainExecutorId: number, coExecutorIds: number[], contributorIds: number[] }) => {
        updateExecutors(payload).finally(() => setIsExecutorsModalOpen(false));
    };

    const handleSendDocument = async (departmentId: number, userId: number) => {
        // Отправляем документ выбранному пользователю
        await updateExecutors({ mainExecutorId: userId, coExecutorIds: [], contributorIds: [] });
    };

    if (loading) return <div className="text-center p-10">Hujjat yuklanmoqda...</div>;
    if (error) return <div className="text-center p-10 text-red-300">{error}</div>;
    if (!correspondence || !currentUser) return null;
    
    return (
        <>
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="p-6 rounded-2xl shadow-lg bg-white/5 border border-white/10 text-white">
                <div className="flex gap-6 mt-6">
                    {/* Левая колонка - Оригинальный документ */}
                    <div className="w-1/2 flex-shrink-0">
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20 h-full">
                            <h2 className="text-lg font-semibold mb-3">Original Hujjat</h2>
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                <DocumentEditorPreview content={correspondence.content || ''} />
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Заголовок и информация */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">{correspondence.title}</h1>
                                <p className="text-white/70 mt-1">Manba: {correspondence.source || 'Noma\'lum'}</p>
                            </div>
                            
                            {/* Кнопка Arxivlash */}
                            {correspondence.stage !== 'ARCHIVED' && (
                                <button
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    {isArchiving ? 'Arxivlanmoqda...' : 'Arxivlash'}
                                </button>
                            )}
                            
                            {/* Кнопка Arxivdan chiqarish */}
                            {correspondence.stage === 'ARCHIVED' && (
                                <button
                                    onClick={handleUnarchive}
                                    disabled={isArchiving}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    {isArchiving ? 'Chiqarilmoqda...' : 'Arxivdan chiqarish'}
                                </button>
                            )}
                        </div>

                        {/* AI Ассистент - большой блок наверху */}
                        <AIAssistant 
                            content={correspondence.content || ''}
                            title={correspondence.title}
                            source={correspondence.source || ''}
                        />

                        {/* Верхний ряд - компактные поля */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-1">Joriy Bosqich</p>
                                <p className="text-sm font-medium text-white/90">{getStageDisplayName(correspondence.stage)}</p>
                            </div>
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-1">Yaratildi</p>
                                <p className="text-sm font-medium text-white/90">{new Date(correspondence.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-1">Muallif</p>
                                <p className="text-sm font-medium text-white/90">{correspondence.author?.name || 'Noma\'lum'}</p>
                            </div>
                        </div>

                        {/* Второй ряд - исполнители */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-1">Asosiy Ijrochi</p>
                                <p className="text-sm font-medium text-white/90">{correspondence.mainExecutor?.name || 'Tayinlanmagan'}</p>
                            </div>
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <p className="text-xs uppercase text-white/50 tracking-wider mb-1">Ichki Ijrochi</p>
                                <p className="text-sm font-medium text-white/90">{correspondence.internalAssignee?.name || 'Tayinlanmagan'}</p>
                            </div>
                        </div>

                        {/* Согласователи */}
                        {correspondence.reviewers && correspondence.reviewers.length > 0 && (
                            <div className="p-3 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-sm font-semibold mb-2">Kelishuvchilar</h3>
                                <ul className="space-y-2">
                                    {correspondence.reviewers.map(reviewer => (
                                        <li key={reviewer.user.id} className="flex justify-between items-center text-xs">
                                            <span className="text-white/80">{reviewer.user.name}</span>
                                            <StatusBadge status={reviewer.status} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Audit Trail */}
                        <AuditTrail log={correspondence.auditLogs} />

                        {/* Действия с документом */}
                        <DocumentActions
                            correspondence={correspondence}
                            currentUser={currentUser}
                            users={users}
                            onUpdate={handleActionComplete}
                            showAdvancedActions={showAdvancedActions}
                            setShowAdvancedActions={setShowAdvancedActions}
                            onOpenSendModal={() => setIsSendModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <ExecutorsModal
                isOpen={isExecutorsModalOpen}
                onClose={() => setIsExecutorsModalOpen(false)}
                onSave={handleUpdateExecutors}
                users={users}
                isLoading={isActionLoading}
                initialData={{
                    mainExecutorId: correspondence.mainExecutor?.id,
                    coExecutorIds: correspondence.coExecutors?.map(u => u.user.id) || [],
                    contributorIds: correspondence.contributors?.map(u => u.user.id) || [],
                }}
            />
            
            <SendDocumentModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                onSend={handleSendDocument}
                departments={departments}
                users={users}
                isLoading={isActionLoading}
            />
        </>
    );
};

export default CorrespondenceView;