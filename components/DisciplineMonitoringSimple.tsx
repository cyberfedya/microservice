import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

interface MonitoringStats {
  activeDocuments: number;
  overdueDocuments: number;
  upcomingDocuments: number;
  byStage: Array<{ stage: string; count: number }>;
  byKartoteka: Array<{ kartoteka: string; count: number }>;
}

interface DisciplineReport {
  total: number;
  byType: {
    [key: string]: number;
  };
  byDepartment: Array<{ department: string; count: number }>;
  violations: Array<any>;
}

export default function DisciplineMonitoringSimple() {
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [disciplineReport, setDisciplineReport] = useState<DisciplineReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'violations'>('monitoring');
  const [checkingOverdue, setCheckingOverdue] = useState(false);
  const [checkingUpcoming, setCheckingUpcoming] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token topilmadi');
        return;
      }

      const [monitoringRes, reportRes] = await Promise.all([
        fetch(`${API_BASE_URL}/discipline/monitoring`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/discipline/report`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!monitoringRes.ok || !reportRes.ok) {
        throw new Error('Ma\'lumotlarni yuklashda xatolik');
      }

      const [monitoringData, reportData] = await Promise.all([
        monitoringRes.json(),
        reportRes.json()
      ]);

      setMonitoringStats(monitoringData);
      setDisciplineReport(reportData);

    } catch (err: any) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOverdue = async () => {
    try {
      setCheckingOverdue(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/discipline/check-overdue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Tekshirishda xatolik');

      const result = await res.json();
      alert(`Tekshiruv yakunlandi. ${result.violationsCreated} ta yangi buzilish yaratildi.`);
      loadData();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    } finally {
      setCheckingOverdue(false);
    }
  };

  const handleCheckUpcoming = async () => {
    try {
      setCheckingUpcoming(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/discipline/check-upcoming`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Tekshirishda xatolik');

      const result = await res.json();
      alert(`Xabarnomalar yuborildi: ${result.notificationsSent} ta`);
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    } finally {
      setCheckingUpcoming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg">
        <p className="font-semibold">Xatolik:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ijro intizomi monitoringi</h1>
          <p className="text-gray-300 mt-1">Hujjatlar va buzilishlar statistikasi</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleCheckOverdue}
            disabled={checkingOverdue}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition"
          >
            {checkingOverdue ? 'Tekshirilmoqda...' : 'Muddati o\'tganlarni tekshirish'}
          </button>
          <button 
            onClick={handleCheckUpcoming}
            disabled={checkingUpcoming}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition"
          >
            {checkingUpcoming ? 'Yuborilmoqda...' : 'Yaqinlashuvchilarni xabarlash'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-600">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'monitoring'
              ? 'border-b-2 border-blue-400 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Hujjatlar monitoringi
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'violations'
              ? 'border-b-2 border-blue-400 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buzilishlar hisoboti
        </button>
      </div>

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Faol hujjatlar</div>
              <div className="text-3xl font-bold">{monitoringStats?.activeDocuments || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Jarayonda</div>
            </div>

            <div className="bg-red-900/30 backdrop-blur-sm p-6 rounded-lg border border-red-700">
              <div className="text-sm text-red-400 mb-2">Muddati o'tgan</div>
              <div className="text-3xl font-bold text-red-400">
                {monitoringStats?.overdueDocuments || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Kechiktirilgan</div>
            </div>

            <div className="bg-yellow-900/30 backdrop-blur-sm p-6 rounded-lg border border-yellow-700">
              <div className="text-sm text-yellow-400 mb-2">Yaqinlashuvchi muddat</div>
              <div className="text-3xl font-bold text-yellow-400">
                {monitoringStats?.upcomingDocuments || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">3 kun ichida</div>
            </div>
          </div>

          {/* Статистика по этапам */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Bosqichlar bo'yicha</h3>
            <div className="space-y-2">
              {monitoringStats?.byStage.map((item) => (
                <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="font-medium">{item.stage}</span>
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Статистика по картотекам */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Kartoteka bo'yicha</h3>
            <div className="space-y-2">
              {monitoringStats?.byKartoteka.map((item) => (
                <div key={item.kartoteka} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="font-medium">{item.kartoteka}</span>
                  <span className="px-3 py-1 bg-gray-600 rounded-full text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'violations' && (
        <div className="space-y-6">
          {/* Общая статистика нарушений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Jami buzilishlar</h3>
              <div className="text-4xl font-bold">{disciplineReport?.total || 0}</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Tur bo'yicha</h3>
              <div className="space-y-2">
                {disciplineReport && Object.entries(disciplineReport.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span>{type}</span>
                    <span className={`px-2 py-1 rounded ${(count as number) > 0 ? 'bg-red-600' : 'bg-gray-600'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Статистика по отделам */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Bo'limlar bo'yicha</h3>
            <div className="space-y-2">
              {disciplineReport?.byDepartment.map((item) => (
                <div key={item.department} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="font-medium">{item.department}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.count > 5 ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Последние нарушения */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">So'nggi buzilishlar</h3>
            <div className="space-y-3">
              {disciplineReport?.violations.slice(0, 10).map((violation) => (
                <div key={violation.id} className="border-l-4 border-red-500 pl-4 py-3 bg-gray-700/30 rounded-r">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{violation.user.name}</p>
                      <p className="text-sm text-gray-400">{violation.user.department?.name}</p>
                      <p className="text-sm text-gray-300 mt-1">{violation.reason}</p>
                      {violation.correspondence && (
                        <p className="text-xs text-blue-400 mt-1">
                          Hujjat: {violation.correspondence.title}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-red-600 rounded text-xs">{violation.type}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(violation.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
