// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\components\CorrespondenceView.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Correspondence, Department } from '../types';
import { getDepartments } from '../services/api';
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

    const handleActionComplete = (updatedDoc?: Correspondence) => {
        if (updatedDoc && updatedDoc.id) {
            setCorrespondence(updatedDoc);
        } else {
            refetch();
        }
    };

    const { isActionLoading, updateExecutors } = useCorrespondenceActions(correspondence, handleActionComplete);

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
                <div className="grid grid-cols-1 gap-8 mt-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold">{correspondence.title}</h1>
                        <p className="text-white/70">Manba: {correspondence.source || 'Noma\'lum'}</p>
                        <h2 className="mt-6 mb-4 text-xl font-semibold">Hujjat matni</h2>
                        <DocumentEditorPreview content={correspondence.content || ''} />
                    </div>
                    <div className="space-y-6">
                        <AIAssistant 
                            content={correspondence.content || ''}
                            title={correspondence.title}
                            source={correspondence.source || ''}
                        />
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <h3 className="text-lg font-semibold mb-4">Ma'lumotlar</h3>
                            <div className="space-y-4 text-sm">
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Joriy Bosqich</p>
                                    <p className="font-medium text-white/90">{getStageDisplayName(correspondence.stage)}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Yaratildi</p>
                                    <p className="font-medium text-white/90">{new Date(correspondence.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Muallif</p>
                                    <p className="font-medium text-white/90">{correspondence.author?.name || 'Noma\'lum'}</p>
                                </div>
                                <div className="pb-3 border-b border-white/10">
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Asosiy Ijrochi</p>
                                    <p className="font-medium text-white/90">{correspondence.mainExecutor?.name || 'Tayinlanmagan'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-white/50 tracking-wider">Ichki Ijrochi</p>
                                    <p className="font-medium text-white/90">{correspondence.internalAssignee?.name || 'Tayinlanmagan'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {correspondence.reviewers && correspondence.reviewers.length > 0 && (
                            <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                                <h3 className="text-lg font-semibold">Kelishuvchilar</h3>
                                <ul className="mt-3 space-y-3">
                                    {correspondence.reviewers.map(reviewer => (
                                        <li key={reviewer.user.id} className="flex justify-between items-center text-sm">
                                            <span className="text-white/80">{reviewer.user.name}</span>
                                            <StatusBadge status={reviewer.status} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <AuditTrail log={correspondence.auditLogs} />
                        
                        {/* Кнопка отправки документа */}
                        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                            <button
                                onClick={() => setIsSendModalOpen(true)}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Hujjatni yuborish
                            </button>
                        </div>
                        
                        <DocumentActions
                            correspondence={correspondence}
                            currentUser={currentUser}
                            users={users}
                            onUpdate={handleActionComplete}
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