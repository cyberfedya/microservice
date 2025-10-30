import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Correspondence } from '../types';
import { useFilteredDocuments } from '../hooks/useFilteredDocuments';
import { getCorrespondences } from '../services/api';
import { UserRole, CorrespondenceStage, getStageDisplayName } from '../constants';
import RoleSpecificDashboard from './RoleSpecificDashboard';
import DocumentCard from './DocumentCard';
import StatusDistributionChart from './StatusDistributionChart';
import DocsPerDeptChart from './charts/DocsPerDeptChart';
import DashboardSkeleton from './DashboardSkeleton';
import CreateCorrespondenceModal from './CreateCorrespondenceModal';
import DisciplineWidget from './DisciplineWidget';
import { PlusIcon, SearchIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/IconComponents';

const KARTOTEKA_ITEMS = [
    "Barchasi", "Markaziy Bank", "Murojaatlar", "Prezident Administratsiyasi",
    "Vazirlar Mahkamasi", "Xizmat yozishmalari", "Nazoratdagi",
];

const initialFilterState = {
    activeTab: 'Kiruvchi' as 'Kiruvchi' | 'Chiquvchi',
    activeKartoteka: 'Barchasi',
    activeStage: 'Barchasi',
    activeDepartment: 'Barchasi',
    sortBy: 'createdAt_desc',
    activeStatus: 'Barchasi',
    showMyTasksOnly: false,
    searchTerm: '',
};

function filterReducer(state: typeof initialFilterState, action: { type: string; payload?: any }) {
    switch (action.type) {
        case 'SET_FILTER':
            return { ...state, [action.payload.name]: action.payload.value };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}

const Devonxona: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    const fetchData = () => {
        if (!user) return;
        setLoading(true);
        setError('');
        getCorrespondences()
            .then(data => {
                setCorrespondences(data || []);
            })
            .catch((err) => {
                console.error(err);
                setError('Hujjatlarni yuklashda xatolik yuz berdi.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user && ![UserRole.Resepshn, UserRole.BankKengashiKotibi, UserRole.KollegialOrganKotibi].includes(user.role as UserRole)) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const filteredCorrespondences = useFilteredDocuments(correspondences, user, filters);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const paginatedCorrespondences = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCorrespondences.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCorrespondences, currentPage]);

    const totalPages = Math.ceil(filteredCorrespondences.length / ITEMS_PER_PAGE);

    const chartData = useMemo(() => {
        if (!Array.isArray(correspondences)) return [];
        const stats = { inProgress: 0, completed: 0, overdue: 0 };
        const now = new Date();
        const finalStages = [CorrespondenceStage.COMPLETED, CorrespondenceStage.ARCHIVED, CorrespondenceStage.CANCELLED];
        correspondences.forEach(doc => {
            if (finalStages.includes(doc.stage as CorrespondenceStage)) {
                stats.completed++;
            } else if (doc.deadline && new Date(doc.deadline) < now) {
                stats.overdue++;
            } else {
                stats.inProgress++;
            }
        });
        return [{ name: 'Ijroda', value: stats.inProgress }, { name: 'Yakunlangan', value: stats.completed }, { name: "Muddati o'tgan", value: stats.overdue }];
    }, [correspondences]);

    const handleStatusFilterClick = (status: string) => {
        const newStatus = filters.activeStatus === status ? 'Barchasi' : status;
        dispatch({ type: 'SET_FILTER', payload: { name: 'activeStatus', value: newStatus } });
        dispatch({ type: 'SET_FILTER', payload: { name: 'activeStage', value: 'Barchasi' } });
    };

    const handleDepartmentFilterClick = (departmentName: string) => {
        const newDepartment = filters.activeDepartment === departmentName ? 'Barchasi' : departmentName;
        dispatch({ type: 'SET_FILTER', payload: { name: 'activeDepartment', value: newDepartment } });
    };

    const handleResetFilters = () => {
        dispatch({ type: 'RESET_FILTERS' });
    };

    const handleCardClick = (document: Correspondence) => {
        navigate(`/correspondence/${document.id}`);
    };

    if (!user) return null;

    if ([UserRole.Resepshn, UserRole.BankKengashiKotibi, UserRole.KollegialOrganKotibi].includes(user.role as UserRole)) {
        return <RoleSpecificDashboard user={user} />;
    }

    return (
        <>
            <div className="flex flex-col h-full text-white">
                <header className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-wider">DEVONXONA</h1>
                        <p className="text-white/60">Sizda {filteredCorrespondences.length} ta mos keladigan hujjat mavjud</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Hujjatni qidirish..."
                                value={filters.searchTerm}
                                onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { name: 'searchTerm', value: e.target.value } })}
                                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-primary rounded-full shadow hover:bg-primary-dark transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Yangi hujjat</span>
                        </button>
                    </div>
                </header>

                <div className="flex-shrink-0 flex items-center gap-2 border-b border-white/10 pb-4 mb-4 overflow-x-auto">
                    <div className="flex items-center pr-4 border-r border-white/20">
                        <label htmlFor="my-tasks-toggle" className="text-sm font-semibold text-white/70 mr-3 whitespace-nowrap">Mening vazifalarim</label>
                        <button
                            id="my-tasks-toggle"
                            role="switch"
                            aria-checked={filters.showMyTasksOnly}
                            onClick={() => dispatch({ type: 'SET_FILTER', payload: { name: 'showMyTasksOnly', value: !filters.showMyTasksOnly } })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.showMyTasksOnly ? 'bg-cyan-500' : 'bg-white/20'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.showMyTasksOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-semibold text-white/70 whitespace-nowrap">Filterlar:</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={filters.activeStage} onChange={e => dispatch({ type: 'SET_FILTER', payload: { name: 'activeStage', value: e.target.value } })} className="bg-black/20 border border-white/20 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="Barchasi" className="text-black">Barcha Bosqichlar</option>
                            {Object.values(CorrespondenceStage).map(stage => (
                                <option key={stage} value={stage} className="text-black">{getStageDisplayName(stage)}</option>
                            ))}
                        </select>
                        <div className="w-px h-5 bg-white/20"></div>
                        <h3 className="text-sm font-semibold text-white/70 whitespace-nowrap">Saralash:</h3>
                        <select value={filters.sortBy} onChange={e => dispatch({ type: 'SET_FILTER', payload: { name: 'sortBy', value: e.target.value } })} className="bg-black/20 border border-white/20 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="createdAt_desc" className="text-black">Yangi (sana bo'yicha)</option>
                            <option value="createdAt_asc" className="text-black">Eski (sana bo'yicha)</option>
                            <option value="deadline_asc" className="text-black">Muddati yaqin</option>
                        </select>
                        <div className="w-px h-5 bg-white/20"></div>
                        <button onClick={handleResetFilters} className="flex items-center gap-2 px-4 py-1.5 bg-black/20 border border-white/20 rounded-full text-sm text-white/70 hover:text-white hover:border-cyan-500 transition-colors">
                            <ArrowPathIcon className="w-4 h-4" />
                            Tozalash
                        </button>
                    </div>
                </div>

                <div className="flex-grow flex gap-8 mt-4 overflow-hidden">
                    <aside className="w-60 flex-shrink-0 pr-4 border-r border-white/10 overflow-y-auto">
                        {/* Виджет мониторинга дисциплины - ВРЕМЕННО ДЛЯ ВСЕХ */}
                        <div className="mb-6">
                            <DisciplineWidget />
                        </div>

                        <h2 className="text-sm font-semibold uppercase text-white/50 mb-4">Hujjat turi</h2>
                        <ul className="space-y-2 mb-8">
                            <li><button onClick={() => dispatch({ type: 'SET_FILTER', payload: { name: 'activeTab', value: 'Kiruvchi' } })} className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${filters.activeTab === 'Kiruvchi' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10'}`}>Kiruvchi</button></li>
                            <li><button onClick={() => dispatch({ type: 'SET_FILTER', payload: { name: 'activeTab', value: 'Chiquvchi' } })} className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-base font-medium ${filters.activeTab === 'Chiquvchi' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10'}`}>Chiquvchi</button></li>
                        </ul>
                        <h2 className="text-sm font-semibold uppercase text-white/50 mb-4">Kartoteka</h2>
                        <ul className="space-y-1">
                            {KARTOTEKA_ITEMS.map(item => (
                                <li key={item}><button onClick={() => dispatch({ type: 'SET_FILTER', payload: { name: 'activeKartoteka', value: item } })} className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${filters.activeKartoteka === item ? 'bg-white/5 text-cyan-300' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>{item}</button></li>
                            ))}
                        </ul>
                    </aside>

                    <main className="flex-grow overflow-y-auto">
                        {loading && <DashboardSkeleton />}
                        {error && <p className="text-center pt-10 text-red-400">{error}</p>}
                        {!loading && !error && (
                            <>
                                {paginatedCorrespondences.length > 0 ? (
                                    <div className="mb-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {paginatedCorrespondences.map(doc => (
                                                <DocumentCard key={doc.id} document={doc} onClick={handleCardClick} />
                                            ))}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-4 mt-8">
                                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Oldingi sahifa"><ChevronLeftIcon className="w-5 h-5" /></button>
                                                <span className="text-sm text-white/70">Sahifa {currentPage} / {totalPages}</span>
                                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Keyingi sahifa"><ChevronRightIcon className="w-5 h-5" /></button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-white/60">
                                        <p className="text-lg">Hujjatlar topilmadi</p>
                                        <p className="text-sm">Filterlarni o'zgartirib ko'ring.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {!loading && (
                            <div className="mt-10 pt-6 border-t border-white/10">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* --- ИЗМЕНЕН ПОРЯДОК БЛОКОВ --- */}
                                    
                                    {/* СНАЧАЛА СТОЛБЧАТАЯ ДИАГРАММА (СЛЕВА) */}
                                    <div className="lg:w-2/3">
                                        <h2 className="text-xl font-bold mb-4">Departamentlar bo'yicha hujjatlar</h2>
                                        <div className="h-64 bg-black/10 border border-white/10 rounded-xl p-4">
                                            <DocsPerDeptChart
                                                data={correspondences}
                                                onBarClick={handleDepartmentFilterClick}
                                                activeFilter={filters.activeDepartment}
                                            />
                                        </div>
                                    </div>

                                    {/* ПОТОМ КРУГОВАЯ ДИАГРАММА (СПРАВА) */}
                                    <div className="lg:w-1/3 flex flex-col">
                                        <h2 className="text-xl font-bold mb-4 text-white">Hujjatlar Holati</h2>
                                        <div className="flex-1 min-h-[350px]">
                                            <StatusDistributionChart
                                                data={chartData}
                                                onSliceClick={handleStatusFilterClick}
                                                activeFilter={filters.activeStatus}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateCorrespondenceModal
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </>
    );
};

export default Devonxona;