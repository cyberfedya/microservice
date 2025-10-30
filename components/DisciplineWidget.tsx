import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

interface MonitoringStats {
  activeDocuments: number;
  overdueDocuments: number;
  upcomingDocuments: number;
}

export default function DisciplineWidget() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/discipline/monitoring`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading discipline stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Всегда показываем виджет, даже при загрузке
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Показываем виджет даже если нет данных
  const displayStats = stats || { activeDocuments: 0, overdueDocuments: 0, upcomingDocuments: 0 };

  return (
    <div 
      onClick={() => navigate('/monitoring')}
      className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/70 group-hover:text-cyan-400 transition">
          Ijro Intizomi
        </h3>
        <svg className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {displayStats.activeDocuments}
          </div>
          <div className="text-xs text-white/50">Faol</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {displayStats.overdueDocuments}
          </div>
          <div className="text-xs text-white/50">Kechikkan</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {displayStats.upcomingDocuments}
          </div>
          <div className="text-xs text-white/50">Yaqin</div>
        </div>
      </div>

      {displayStats.overdueDocuments > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-red-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Muddati o'tgan hujjatlar mavjud!</span>
          </div>
        </div>
      )}
    </div>
  );
}
