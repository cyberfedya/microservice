// C:\Users\aliak\Desktop\Док-оборот\microservice\components\DocumentActions.tsx
// --- ИЗМЕНЕННЫЙ ФАЙЛ ---

import React, { useState } from 'react';
import { Correspondence, User } from '../types';
import { UserRole, CorrespondenceStage, getStageDisplayName } from '../constants';
import { useCorrespondenceActions } from '../hooks/useCorrespondenceActions';
import {
    PaperAirplaneIcon, CheckBadgeIcon, XCircleIcon, PencilIcon, CheckCircleIcon,
    UsersIcon, CalendarDaysIcon, PauseIcon, ArchiveBoxXMarkIcon
} from './icons/IconComponents';
// --- ДОБАВЛЯЕМ ИМПОРТ НАШЕГО НОВОГО МОДАЛЬНОГО ОКНА ---
import SimpleInputModal from './SimpleInputModal';
import SignatureModal from './SignatureModal'; 

interface DocumentActionsProps {
    correspondence: Correspondence;
    currentUser: User;
    users: User[];
    onUpdate: (updatedDoc?: Correspondence) => void;
    showAdvancedActions?: boolean;
    setShowAdvancedActions?: (show: boolean) => void;
    onOpenSendModal?: () => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ correspondence, currentUser, users, onUpdate, showAdvancedActions = false, setShowAdvancedActions, onOpenSendModal }) => {
    const [selectedInternalAssignee, setSelectedInternalAssignee] = useState<number | undefined>(correspondence.internalAssignee?.id);
    
    // --- ЭТИ СОСТОЯНИЯ ТЕПЕРЬ БУДУТ РАБОТАТЬ ---
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [isDeadlineModalOpen, setDeadlineModalOpen] = useState(false);
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);

    const {
        isActionLoading, assignInternal, submitForReviewAction, approveReviewAction,
        rejectReviewAction, signDocumentAction, dispatchDocumentAction, holdAction,
        cancelAction, updateDeadlineAction
    } = useCorrespondenceActions(correspondence, onUpdate);

    // --- Action Handlers (обновленные) ---
    const handleReject = (comment: string) => {
        if (comment) {
            rejectReviewAction(comment);
            setRejectModalOpen(false); // Закрываем окно при успехе
        }
    };

    const handleCancel = (reason: string) => {
        if (reason) {
            cancelAction(reason);
            setCancelModalOpen(false); // Закрываем окно при успехе
        }
    };

    const handleUpdateDeadline = (newDeadline: string) => {
        if (newDeadline) {
            updateDeadlineAction(newDeadline);
            setDeadlineModalOpen(false); // Закрываем окно при успехе
        }
    };

    const handleSign = (signatureData: string) => {
        // Здесь можно сохранить подпись на сервер, если нужно
        // Пока просто вызываем действие подписания
        signDocumentAction();
        setSignatureModalOpen(false);
    };

    const handleAssignInternal = () => {
        if (selectedInternalAssignee) {
            assignInternal(selectedInternalAssignee);
        }
    };

    // --- Visibility Logic (без изменений) ---
    const isDocActive = ![CorrespondenceStage.COMPLETED, CorrespondenceStage.CANCELLED, CorrespondenceStage.ON_HOLD].includes(correspondence.stage as CorrespondenceStage);
    const canManage = [UserRole.Admin, UserRole.Boshqaruv, UserRole.BankApparati].includes(currentUser.role.name as UserRole);
    const canDelegateInternal = currentUser.role.name === UserRole.Tarmoq && correspondence.mainExecutor?.id === currentUser.id && correspondence.stage === CorrespondenceStage.EXECUTION;
    const isOwnerOrExecutor = currentUser.id === correspondence.mainExecutor?.id || currentUser.id === correspondence.author.id;
    const canSubmitForReview = isOwnerOrExecutor && [CorrespondenceStage.PENDING_REGISTRATION, CorrespondenceStage.DRAFTING, CorrespondenceStage.REVISION_REQUESTED, CorrespondenceStage.EXECUTION].includes(correspondence.stage as CorrespondenceStage);
    const isUserAReviewer = correspondence.reviewers?.some(r => r.user.id === currentUser.id && r.status === 'PENDING');
    const canApproveOrReject = correspondence.stage === CorrespondenceStage.FINAL_REVIEW && isUserAReviewer;
    const canSign = currentUser.role.name === UserRole.Boshqaruv && correspondence.stage === CorrespondenceStage.SIGNATURE;
    const canDispatch = currentUser.role.name === UserRole.BankApparati && correspondence.stage === CorrespondenceStage.DISPATCH;

    return (
        <>
            <div className="p-4 border border-white/20 rounded-lg bg-black/20">
                <h3 className="text-lg font-semibold">Harakatlar</h3>
                <div className="mt-2 space-y-2">
                    {canApproveOrReject && isDocActive && (
                        <div className="grid grid-cols-2 gap-2">
                            {/* --- ИЗМЕНЕНИЕ: Эта кнопка теперь открывает модальное окно --- */}
                            <button onClick={() => setRejectModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"> <XCircleIcon className="w-5 h-5" /> Rad etish </button>
                            <button onClick={approveReviewAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"> <CheckBadgeIcon className="w-5 h-5" /> Tasdiqlash </button>
                        </div>
                    )}
                    {canSign && isDocActive && (<button onClick={() => setSignatureModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"> <PencilIcon className="w-5 h-5" /> Imzolash </button>)}
                    {canDispatch && isDocActive && (<button onClick={dispatchDocumentAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50"> <CheckCircleIcon className="w-5 h-5" /> Jo'natish / Yakunlash </button>)}
                    {canManage && isDocActive && (
                        <div className="pt-2 border-t border-white/10 space-y-2">
                            {canSubmitForReview && (
                                <button onClick={submitForReviewAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                    Kelishuvga yuborish
                                </button>
                            )}
                            {onOpenSendModal && (
                                <button onClick={onOpenSendModal} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Hujjatni yuborish
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => (window as any).dispatchEvent(new CustomEvent('openExecutorsModal'))} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"> <UsersIcon className="w-5 h-5" /> Ijrochilar </button>
                                <button onClick={() => setDeadlineModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"> <CalendarDaysIcon className="w-5 h-5" /> Muddat </button>
                                <button onClick={() => window.confirm("Haqiqatan ham ushbu hujjatni 'Pauza' holatiga o'tkazmoqchimisiz?") && holdAction()} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50"> <PauseIcon className="w-5 h-5" /> Pauza </button>
                                <button onClick={() => setCancelModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"> <ArchiveBoxXMarkIcon className="w-5 h-5" /> Bekor qilish </button>
                            </div>
                        </div>
                    )}
                    {canDelegateInternal && isDocActive && (
                        <>
                            <h4 className="text-md font-semibold pt-2">Ichki ijrochini tayinlash</h4>
                            <select onChange={(e) => setSelectedInternalAssignee(Number(e.target.value))} value={selectedInternalAssignee || ""} className="w-full p-2 border rounded-md bg-white/10 border-white/20 text-white">
                                <option value="" disabled>Xodimni tanlang...</option>
                                {users.filter(u => u.department.name === currentUser.department.name && u.role.name === UserRole.Reviewer).map(u => (
                                    <option key={u.id} value={u.id} className="text-black">{u.name}</option>
                                ))}
                            </select>
                            <button onClick={handleAssignInternal} disabled={!selectedInternalAssignee || isActionLoading} className="w-full px-4 py-2 mt-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-white/20">Tasdiqlash</button>
                        </>
                    )}
                </div>
            </div>
            
            {/* --- ДОБАВЛЯЕМ НАШИ НОВЫЕ МОДАЛЬНЫЕ ОКНА --- */}
            <SimpleInputModal
                isOpen={isRejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onSubmit={handleReject}
                title="Rad etish sababi"
                label="Iltimos, hujjatni rad etish sababini kiriting"
                inputType="textarea"
                isLoading={isActionLoading}
                submitText="Rad etish"
            />

            <SimpleInputModal
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onSubmit={handleCancel}
                title="Bekor qilish sababi"
                label="Iltimos, hujjatni bekor qilish sababini kiriting"
                inputType="textarea"
                isLoading={isActionLoading}
                submitText="Bekor qilish"
            />

            <SimpleInputModal
                isOpen={isDeadlineModalOpen}
                onClose={() => setDeadlineModalOpen(false)}
                onSubmit={handleUpdateDeadline}
                title="Yangi muddat"
                label="Yangi ijro muddatini tanlang"
                inputType="date"
                isLoading={isActionLoading}
                submitText="Yangilash"
            />

            <SignatureModal
                visible={isSignatureModalOpen}
                onClose={() => setSignatureModalOpen(false)}
                onSubmit={handleSign}
                documentTitle={correspondence.title}
            />
        </>
    );
};

export default DocumentActions;