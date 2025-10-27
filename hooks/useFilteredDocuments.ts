import { useMemo } from 'react';
import { Correspondence, User } from '../types';
import { CorrespondenceStage } from '../constants';

interface Filters {
  showMyTasksOnly: boolean;
  activeTab: 'Kiruvchi' | 'Chiquvchi';
  activeKartoteka: string;
  activeStage: string;
  activeDepartment: string;
  activeStatus: string;
  searchTerm: string;
  sortBy: string;
}

export const useFilteredDocuments = (documents: Correspondence[], user: User | null, filters: Filters) => {
  return useMemo(() => {
    if (!Array.isArray(documents) || !user) return [];

    return documents
      .filter(c => {
        if (!filters.showMyTasksOnly) return true;
        const isMainExecutor = c.mainExecutor?.id === user.id;
        const isInternalAssignee = c.internalAssignee?.id === user.id;
        const isCoExecutor = c.coExecutors?.some(co => co.user.id === user.id);
        const isContributor = c.contributors?.some(con => con.user.id === user.id);
        const isPendingReviewer = c.reviewers?.some(rev => rev.user.id === user.id && rev.status === 'PENDING');
        return isMainExecutor || isInternalAssignee || isCoExecutor || isContributor || isPendingReviewer;
      })
      .filter(c => c.type === filters.activeTab)
      .filter(c => filters.activeKartoteka === 'Barchasi' || c.kartoteka === filters.activeKartoteka)
      .filter(c => {
        if (filters.activeStage === 'Barchasi') return true;
        // Специальная логика для "Rad etilgan" - показываем документы с отклоненными согласованиями
        if (filters.activeStage === 'REJECTED') {
          return c.reviewers?.some(rev => rev.status === 'REJECTED') || c.stage === 'REVISION_REQUESTED';
        }
        return c.stage === filters.activeStage;
      })
      .filter(c => filters.activeDepartment === 'Barchasi' || (c.mainExecutor?.department?.name || 'Tayinlanmagan') === filters.activeDepartment)
      .filter(c => {
        if (filters.activeStatus === 'Barchasi') return true;
        const now = new Date();
        const finalStages = [CorrespondenceStage.COMPLETED, CorrespondenceStage.ARCHIVED, CorrespondenceStage.CANCELLED];
        const isCompleted = finalStages.includes(c.stage as CorrespondenceStage);
        const isOverdue = !isCompleted && c.deadline && new Date(c.deadline) < now;
        const isInProgress = !isCompleted && !isOverdue;
        if (filters.activeStatus === 'Yakunlangan') return isCompleted;
        if (filters.activeStatus === "Muddati o'tgan") return isOverdue;
        if (filters.activeStatus === 'Ijroda') return isInProgress;
        return true;
      })
      .filter(c => {
        const search = filters.searchTerm.toLowerCase();
        if (!search) return true;
        return (c.title || '').toLowerCase().includes(search) ||
               (c.content || '').toLowerCase().includes(search) ||
               (c.mainExecutor?.name || '').toLowerCase().includes(search);
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'createdAt_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'deadline_asc':
            if (!a.deadline) return 1; if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [documents, user, filters]);
};