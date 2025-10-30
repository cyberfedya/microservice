import React, { useState, useEffect } from 'react';

interface ReportStats {
  totalDocuments: number;
  completedDocuments: number;
  overdueDocuments: number;
  totalMeetings: number;
  totalReceptions: number;
  avgCompletionTime: number;
}

const API_URL = 'http://localhost:5000/api';

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedYear, selectedMonth]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reports/stats?period=${selectedPeriod}&year=${selectedYear}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reports/export?format=${format}&period=${selectedPeriod}&year=${selectedYear}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hisobot_${selectedYear}_${selectedMonth}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Eksport xatolik yuz berdi!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Yuklanmoqda...</div>
      </div>
    );
  }

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hisobotlar</h1>
          <p className="text-gray-400 mt-1">Faoliyat statistikasi va eksport</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Davr</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            >
              <option value="month">Oylik</option>
              <option value="quarter">Choraklik</option>
              <option value="year">Yillik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yil</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {selectedPeriod === 'month' && (
            <div>
              <label className="block text-sm font-medium mb-2">Oy</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Jami hujjatlar</div>
          <div className="text-4xl font-bold text-cyan-400">{stats?.totalDocuments || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Davrda</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Bajarilgan</div>
          <div className="text-4xl font-bold text-green-400">{stats?.completedDocuments || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.totalDocuments ? Math.round((stats.completedDocuments / stats.totalDocuments) * 100) : 0}% samaradorlik
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Kechiktirilgan</div>
          <div className="text-4xl font-bold text-red-400">{stats?.overdueDocuments || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Muddati o'tgan</div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Faoliyat ko'rsatkichlari</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Yig'ilishlar</span>
              <span className="font-bold">{stats?.totalMeetings || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>Fuqarolar qabuli</span>
              <span className="font-bold">{stats?.totalReceptions || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
              <span>O'rtacha bajarilish vaqti</span>
              <span className="font-bold">{stats?.avgCompletionTime || 0} kun</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Samaradorlik</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Bajarilgan hujjatlar</span>
                <span className="text-sm font-bold">
                  {stats?.totalDocuments ? Math.round((stats.completedDocuments / stats.totalDocuments) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.totalDocuments ? (stats.completedDocuments / stats.totalDocuments) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Kechiktirilgan hujjatlar</span>
                <span className="text-sm font-bold text-red-400">
                  {stats?.totalDocuments ? Math.round((stats.overdueDocuments / stats.totalDocuments) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.totalDocuments ? (stats.overdueDocuments / stats.totalDocuments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка */}
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Hisobotlar tizimi</p>
            <p>Oylik, choraklik va yillik hisobotlarni Excel yoki PDF formatida yuklab olishingiz mumkin. Barcha statistik ma'lumotlar avtomatik hisoblanadi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
