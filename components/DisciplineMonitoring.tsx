import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
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

export default function DisciplineMonitoring() {
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [disciplineReport, setDisciplineReport] = useState<DisciplineReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      // Загружаем статистику мониторинга
      const monitoringRes = await fetch(`${API_BASE_URL}/discipline/monitoring`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!monitoringRes.ok) {
        throw new Error('Monitoring ma\'lumotlarini yuklashda xatolik');
      }

      const monitoringData = await monitoringRes.json();
      setMonitoringStats(monitoringData);

      // Загружаем отчет по дисциплине
      const reportRes = await fetch(`${API_BASE_URL}/discipline/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!reportRes.ok) {
        throw new Error('Hisobot ma\'lumotlarini yuklashda xatolik');
      }

      const reportData = await reportRes.json();
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

      if (!res.ok) {
        throw new Error('Tekshirishda xatolik');
      }

      const result = await res.json();
      alert(`Tekshiruv yakunlandi. ${result.violationsCreated} ta yangi buzilish yaratildi.`);
      loadData(); // Перезагружаем данные
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

      if (!res.ok) {
        throw new Error('Tekshirishda xatolik');
      }

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ijro intizomi monitoringi</h1>
          <p className="text-gray-600 mt-1">Hujjatlar va buzilishlar statistikasi</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCheckOverdue}
            disabled={checkingOverdue}
            variant="outline"
          >
            {checkingOverdue ? 'Tekshirilmoqda...' : 'Muddati o\'tganlarni tekshirish'}
          </Button>
          <Button 
            onClick={handleCheckUpcoming}
            disabled={checkingUpcoming}
            variant="outline"
          >
            {checkingUpcoming ? 'Yuborilmoqda...' : 'Yaqinlashuvchilarni xabarlash'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Hujjatlar monitoringi</TabsTrigger>
          <TabsTrigger value="violations">Buzilishlar hisoboti</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faol hujjatlar</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringStats?.activeDocuments || 0}</div>
                <p className="text-xs text-muted-foreground">Jarayonda</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muddati o'tgan</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {monitoringStats?.overdueDocuments || 0}
                </div>
                <p className="text-xs text-muted-foreground">Kechiktirilgan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yaqinlashuvchi muddat</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {monitoringStats?.upcomingDocuments || 0}
                </div>
                <p className="text-xs text-muted-foreground">3 kun ichida</p>
              </CardContent>
            </Card>
          </div>

          {/* Статистика по этапам */}
          <Card>
            <CardHeader>
              <CardTitle>Bosqichlar bo'yicha</CardTitle>
              <CardDescription>Hujjatlarning hozirgi holati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monitoringStats?.byStage.map((item) => (
                  <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.stage}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Статистика по картотекам */}
          <Card>
            <CardHeader>
              <CardTitle>Kartoteka bo'yicha</CardTitle>
              <CardDescription>Hujjatlar muhimligi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monitoringStats?.byKartoteka.map((item) => (
                  <div key={item.kartoteka} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.kartoteka}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          {/* Общая статистика нарушений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Jami buzilishlar</CardTitle>
                <CardDescription>Barcha intizomiy jazolar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{disciplineReport?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tur bo'yicha</CardTitle>
                <CardDescription>Jazo turlari statistikasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {disciplineReport && Object.entries(disciplineReport.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <Badge variant={count > 0 ? "destructive" : "secondary"}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Статистика по отделам */}
          <Card>
            <CardHeader>
              <CardTitle>Bo'limlar bo'yicha</CardTitle>
              <CardDescription>Buzilishlar taqsimoti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {disciplineReport?.byDepartment.map((item) => (
                  <div key={item.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{item.department}</span>
                    </div>
                    <Badge variant={item.count > 5 ? "destructive" : "secondary"}>
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Последние нарушения */}
          <Card>
            <CardHeader>
              <CardTitle>So'nggi buzilishlar</CardTitle>
              <CardDescription>Oxirgi intizomiy jazolar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {disciplineReport?.violations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{violation.user.name}</p>
                        <p className="text-sm text-gray-600">{violation.user.department?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{violation.reason}</p>
                        {violation.correspondence && (
                          <p className="text-xs text-blue-600 mt-1">
                            Hujjat: {violation.correspondence.title}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="destructive">{violation.type}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(violation.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
