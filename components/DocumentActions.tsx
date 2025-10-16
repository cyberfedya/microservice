import React, { useState } from 'react';
import { Correspondence, User } from '../types';
import { UserRole, CorrespondenceStage, getStageDisplayName } from '../constants';
import { useCorrespondenceActions } from '../hooks/useCorrespondenceActions';
import {
    PaperAirplaneIcon, CheckBadgeIcon, XCircleIcon, PencilIcon, CheckCircleIcon,
    UsersIcon, CalendarDaysIcon, PauseIcon, ArchiveBoxXMarkIcon
} from './icons/IconComponents';

interface DocumentActionsProps {
    correspondence: Correspondence;
    currentUser: User;
    users: User[];
    onUpdate: (updatedDoc?: Correspondence) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ correspondence, currentUser, users, onUpdate }) => {
    const [selectedInternalAssignee, setSelectedInternalAssignee] = useState<number | undefined>(correspondence.internalAssignee?.id);
    // State for a confirmation/input modal instead of prompt()
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [isDeadlineModalOpen, setDeadlineModalOpen] = useState(false);

    const {
        isActionLoading, assignInternal, submitForReviewAction, approveReviewAction,
        rejectReviewAction, signDocumentAction, dispatchDocumentAction, holdAction,
        cancelAction, updateDeadlineAction
    } = useCorrespondenceActions(correspondence, onUpdate);

    // --- Action Handlers ---
    const handleReject = (comment: string) => {
        if (comment) rejectReviewAction(comment);
        setRejectModalOpen(false);
    };

    const handleCancel = (reason: string) => {
        if (reason) cancelAction(reason);
        setCancelModalOpen(false);
    };

    const handleUpdateDeadline = (newDeadline: string) => {
        if (newDeadline) updateDeadlineAction(newDeadline);
        setDeadlineModalOpen(false);
    };

    const handleAssignInternal = () => {
        if (selectedInternalAssignee) {
            assignInternal(selectedInternalAssignee);
        }
    };

    // --- Visibility Logic ---
    const isDocActive = ![CorrespondenceStage.COMPLETED, CorrespondenceStage.CANCELLED, CorrespondenceStage.ON_HOLD].includes(correspondence.stage as CorrespondenceStage);
    const canManage = [UserRole.Admin, UserRole.Boshqaruv, UserRole.BankApparati].includes(currentUser.role as UserRole);
    const canDelegateInternal = currentUser.role === UserRole.Tarmoq && correspondence.mainExecutor?.id === currentUser.id && correspondence.stage === CorrespondenceStage.EXECUTION;
    const isOwnerOrExecutor = currentUser.id === correspondence.mainExecutor?.id || currentUser.id === correspondence.author.id;
    const canSubmitForReview = isOwnerOrExecutor && [CorrespondenceStage.DRAFTING, CorrespondenceStage.REVISION_REQUESTED, CorrespondenceStage.EXECUTION].includes(correspondence.stage as CorrespondenceStage);
    const isUserAReviewer = correspondence.reviewers?.some(r => r.user.id === currentUser.id && r.status === 'PENDING');
    const canApproveOrReject = correspondence.stage === CorrespondenceStage.FINAL_REVIEW && isUserAReviewer;
    const canSign = currentUser.role === UserRole.Boshqaruv && correspondence.stage === CorrespondenceStage.SIGNATURE;
    const canDispatch = currentUser.role === UserRole.BankApparati && correspondence.stage === CorrespondenceStage.DISPATCH;

    return (
        <>
        <div className="p-4 border border-white/20 rounded-lg bg-black/20">
            <h3 className="text-lg font-semibold">Harakatlar</h3>
            <div className="mt-2 space-y-2">
                {canSubmitForReview && isDocActive && (<button onClick={submitForReviewAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"> <PaperAirplaneIcon className="w-5 h-5" /> Kelishuvga yuborish </button>)}
                {canApproveOrReject && isDocActive && (
                    <div className="grid grid-cols-2 gap-2">
                        {/* This button would now open a modal */}
                        <button onClick={() => setRejectModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"> <XCircleIcon className="w-5 h-5" /> Rad etish </button>
                        <button onClick={approveReviewAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"> <CheckBadgeIcon className="w-5 h-5" /> Tasdiqlash </button>
                    </div>
                )}
                {canSign && isDocActive && (<button onClick={signDocumentAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"> <PencilIcon className="w-5 h-5" /> Imzolash </button>)}
                {canDispatch && isDocActive && (<button onClick={dispatchDocumentAction} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700"> <CheckCircleIcon className="w-5 h-5" /> Jo'natish / Yakunlash </button>)}
                {canManage && isDocActive && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <button onClick={() => (window as any).dispatchEvent(new CustomEvent('openExecutorsModal'))} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"> <UsersIcon className="w-5 h-5" /> Ijrochilar </button>
                        <button onClick={() => setDeadlineModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700"> <CalendarDaysIcon className="w-5 h-5" /> Muddat </button>
                        <button onClick={() => window.confirm("Haqiqatan ham ushbu hujjatni 'Pauza' holatiga o'tkazmoqchimisiz?") && holdAction()} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700"> <PauseIcon className="w-5 h-5" /> Pauza </button>
                        <button onClick={() => setCancelModalOpen(true)} disabled={isActionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700"> <ArchiveBoxXMarkIcon className="w-5 h-5" /> Bekor qilish </button>
                    </div>
                )}
                {canDelegateInternal && isDocActive && (
                    <>
                        <h4 className="text-md font-semibold pt-2">Ichki ijrochini tayinlash</h4>
                        <select onChange={(e) => setSelectedInternalAssignee(Number(e.target.value))} value={selectedInternalAssignee || ""} className="w-full p-2 border rounded-md bg-white/10 border-white/20 text-white">
                            <option value="" disabled>Xodimni tanlang...</option>
                            {users.filter(u => u.department === currentUser.department && u.role === UserRole.Reviewer).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <button onClick={handleAssignInternal} disabled={!selectedInternalAssignee || isActionLoading} className="w-full px-4 py-2 mt-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-white/20">Tasdiqlash</button>
                    </>
                )}
            </div>
        </div>
        {/* Example of how a modal would be used (implementation would be in a separate component) */}
        {/* {isRejectModalOpen && <InputModal title="Rad etish sababi" onSubmit={handleReject} onClose={() => setRejectModalOpen(false)} />} */}
        {/* {isCancelModalOpen && <InputModal title="Bekor qilish sababi" onSubmit={handleCancel} onClose={() => setCancelModalOpen(false)} />} */}
        {/* {isDeadlineModalOpen && <InputModal title="Yangi muddat" inputType="date" onSubmit={handleUpdateDeadline} onClose={() => setDeadlineModalOpen(false)} />} */}
        </>
    );
};

export default DocumentActions;