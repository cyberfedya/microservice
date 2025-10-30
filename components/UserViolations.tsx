import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface ViolationStats {
  total: number;
  byType: {
    warning: number;
    reprimand: number;
    fine30: number;
    fine50: number;
    termination: number;
  };
  recent: Array<{
    id: number;
    date: string;
    reason: string;
    type: string;
    correspondence: {
      id: number;
      title: string;
      deadline: string;
    } | null;
  }>;
}

interface UserViolationsProps {
  userId?: number;
}

export default function UserViolations({ userId }: UserViolationsProps) {
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadViolations();
  }, [userId]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token topilmadi');
        return;
      }

      // Если userId не передан, берем текущего пользователя
      const userIdToFetch = userId || 'me';

      const res = await fetch(`${API_BASE_URL}/discipline/violations/user/${userIdToFetch}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Ma\'lumotlarni yuklashda xatolik');
      }

      const data = await res.json();
      setStats(data);

    } catch (err: any) {
      setError(err.message);
      console.error('Error loading violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getViolationColor = (type: string) => {
    if (type.includes('Ogohlantirish')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (type.includes('Hayfsan')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (type.includes('30%')) return 'bg-red-100 text-red-800 border-red-300';
    if (type.includes('50%')) return 'bg-red-200 text-red-900 border-red-400';
    if (type.includes('bekor qilish')) return 'bg-gray-900 text-white border-gray-900';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getViolationIcon = (type: string) => {
    if (type.includes('bekor qilish')) return <AlertCircle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
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

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intizomiy jazolar statistikasi</CardTitle>
          <CardDescription>Sizning intizom ko'rsatkichlaringiz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Jami</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-700">{stats.byType.warning}</div>
              <div className="text-sm text-gray-600 mt-1">Ogohlantirish</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-700">{stats.byType.reprimand}</div>
              <div className="text-sm text-gray-600 mt-1">Hayfsan</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-700">{stats.byType.fine30}</div>
              <div className="text-sm text-gray-600 mt-1">30% jarima</div>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <div className="text-3xl font-bold text-red-800">{stats.byType.fine50}</div>
              <div className="text-sm text-gray-600 mt-1">50% jarima</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-white">{stats.byType.termination}</div>
              <div className="text-sm text-gray-300 mt-1">Ishdan bo'shatish</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>So'nggi buzilishlar</CardTitle>
            <CardDescription>Oxirgi 5 ta intizomiy jazo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent.map((violation) => (
                <div 
                  key={violation.id} 
                  className={`p-4 rounded-lg border-2 ${getViolationColor(violation.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getViolationIcon(violation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-semibold">
                          {violation.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(violation.date).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-2">{violation.reason}</p>
                      {violation.correspondence && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2 rounded">
                          <FileText className="h-4 w-4" />
                          <span>Hujjat: {violation.correspondence.title}</span>
                          {violation.correspondence.deadline && (
                            <span className="text-xs text-gray-500">
                              (Muddat: {new Date(violation.correspondence.deadline).toLocaleDateString('uz-UZ')})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.total === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ajoyib!</h3>
              <p className="text-gray-600">Sizda hech qanday intizomiy jazo yo'q</p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.total > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Eslatma:</strong> Intizomiy jazolar reglamentga muvofiq qo'llaniladi. 
            Hujjatlarni muddatida bajarish muhim!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
