// C:\Users\aliak\Desktop\Док-оборот\microservice\hooks\useCorrespondenceActions.ts
// --- ИЗМЕНЕННЫЙ ФАЙЛ ---

import { useState } from 'react';
import { notification } from 'antd';
import {
    assignInternalEmployee,
    submitForReview,
    approveReview,
    rejectReview,
    signDocument,
    dispatchDocument,
    holdCorrespondence,
    cancelCorrespondence,
    updateDeadline,
    updateExecutors as apiUpdateExecutors,
} from '../services/api';
import { Correspondence } from '../types';

type ActionCallback = (updatedDoc?: Correspondence) => void;

export const useCorrespondenceActions = (correspondence: Correspondence | null, onActionComplete: ActionCallback) => {
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleAction = async (action: () => Promise<any>) => {
        if (!correspondence) return;
        setIsActionLoading(true);
        try {
            const result = await action();
            notification.success({ message: "Amal muvaffaqiyatli bajarildi!" }); // Добавим уведомление об успехе
            onActionComplete(result);
        } catch (err: any) {
            notification.error({
                message: 'Xatolik',
                description: err.message || 'Amalni bajarishda kutilmagan xatolik yuz berdi.',
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const assignInternal = (assigneeId: number) => handleAction(() => 
        assignInternalEmployee(correspondence!.id, assigneeId)
    );

    const submitForReviewAction = () => handleAction(() => 
        submitForReview(correspondence!.id)
    );

    const approveReviewAction = () => handleAction(() => 
        approveReview(correspondence!.id)
    );

    const rejectReviewAction = (comment: string) => handleAction(() => 
        rejectReview(correspondence!.id, comment)
    );

    const signDocumentAction = () => handleAction(() => 
        signDocument(correspondence!.id)
    );

    const dispatchDocumentAction = () => handleAction(() => 
        dispatchDocument(correspondence!.id)
    );

    const holdAction = () => handleAction(() => 
        holdCorrespondence(correspondence!.id)
    );

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    const cancelAction = (reason: string) => handleAction(() => 
        cancelCorrespondence(correspondence!.id, reason) // Передаем 'reason' в API
    );
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    const updateDeadlineAction = (newDeadline: string) => handleAction(() => 
        updateDeadline(correspondence!.id, { deadline: newDeadline })
    );

    const updateExecutors = (payload: any) => handleAction(() => 
        apiUpdateExecutors(correspondence!.id, payload)
    );

    return {
        isActionLoading,
        assignInternal, submitForReviewAction, approveReviewAction, rejectReviewAction,
        signDocumentAction, dispatchDocumentAction, holdAction, cancelAction,
        updateDeadlineAction, updateExecutors,
    };
};