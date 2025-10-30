import React, { useState, useEffect } from 'react';

interface KPIData {
  id: number;
  userId: number;
  period: string;
  documentsCompleted: number;
  documentsOnTime: number;
  documentsLate: number;
  meetingsAttended: number;
  receptionsConducted: number;
  score: number;
  bonus: number;
  penalty: number;
}

interface DocumentStats {
  total: number;
  completed: number;
  onTime: number;
  late: number;
  violations: number;
}

const API_URL = 'http://localhost:5000/api';

export default function KPIPage() {
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [history, setHistory] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [kpiRes, statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/kpi/my`, { headers }),
        fetch(`${API_URL}/kpi/my/stats`, { headers }),
        fetch(`${API_URL}/kpi/my/history`, { headers })
      ]);

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpi(kpiData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-3xl font-bold">KPI Ko'rsatkichlari</h1>
        <p className="text-gray-400 mt-1">Xodimlar samaradorligi va mukofotlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Umumiy ball</div>
          <div className="text-4xl font-bold text-cyan-400">{kpi?.score || 0}</div>
          <div className="text-xs text-gray-500 mt-1">100 balldan</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Mukofot</div>
          <div className="text-4xl font-bold text-green-400">{kpi?.bonus?.toLocaleString() || 0}</div>
          <div className="text-xs text-gray-500 mt-1">so'm</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Jarima</div>
          <div className="text-4xl font-bold text-red-400">{kpi?.penalty?.toLocaleString() || 0}</div>
          <div className="text-xs text-gray-500 mt-1">so'm</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Buzilishlar</div>
          <div className="text-4xl font-bold text-purple-400">{stats?.violations || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Jami</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Hujjatlar statistikasi</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Bajarilgan hujjatlar</span>
              <span className="font-bold">{kpi?.documentsCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Muddatida bajarilgan</span>
              <span className="font-bold text-green-400">{kpi?.documentsOnTime || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Kechiktirilgan</span>
              <span className="font-bold text-red-400">{kpi?.documentsLate || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Jami hujjatlar</span>
              <span className="font-bold">{stats?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Faollik ko'rsatkichlari</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Yig'ilishlarda qatnashish</span>
              <span className="font-bold">{kpi?.meetingsAttended || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Fuqarolar qabuli</span>
              <span className="font-bold">{kpi?.receptionsConducted || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Samaradorlik</span>
              <span className="font-bold">{stats?.completed && stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>O'z vaqtida</span>
              <span className="font-bold text-green-400">{stats?.onTime && stats.completed ? Math.round((stats.onTime / stats.completed) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">KPI tarixi (oxirgi 6 oy)</h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Davr</th>
                  <th className="text-center py-3 px-4">Ball</th>
                  <th className="text-center py-3 px-4">Hujjatlar</th>
                  <th className="text-center py-3 px-4">Yig'ilishlar</th>
                  <th className="text-center py-3 px-4">Mukofot</th>
                  <th className="text-center py-3 px-4">Jarima</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      {new Date(item.period).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${
                        item.score >= 90 ? 'text-green-400' :
                        item.score >= 75 ? 'text-blue-400' :
                        item.score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {item.score}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-400">{item.documentsOnTime}</span> / 
                      <span className="text-red-400">{item.documentsLate}</span>
                    </td>
                    <td className="text-center py-3 px-4">{item.meetingsAttended}</td>
                    <td className="text-center py-3 px-4 text-green-400">
                      {item.bonus > 0 ? `+${item.bonus.toLocaleString()}` : '-'}
                    </td>
                    <td className="text-center py-3 px-4 text-red-400">
                      {item.penalty > 0 ? `-${item.penalty.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Hozircha tarix yo'q</p>
          </div>
        )}
      </div>

      {/* Подсказка */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">KPI tizimi avtomatik ishlaydi!</p>
            <p>Hujjatlarni bajarganingizda ball to'planadi. Muddatida bajarilsa mukofot, kechiktirilsa jarima qo'llaniladi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
