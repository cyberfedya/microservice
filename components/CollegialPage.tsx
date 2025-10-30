import React, { useState, useEffect } from 'react';

interface CollegialBody {
  id: number;
  type: string;
  name: string;
  description?: string;
  chairman?: {
    id: number;
    name: string;
  };
  secretary?: {
    id: number;
    name: string;
  };
  _count?: {
    members: number;
    meetings: number;
  };
}

interface Member {
  id: number;
  role?: string;
  isVotingMember: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const API_URL = 'http://localhost:5000/api';

const BODY_TYPES = [
  { value: 'KREDIT_KOMITETI', label: 'Kredit komiteti', icon: '💰', color: 'blue' },
  { value: 'AKTIVLAR_PASSIVLAR', label: 'Aktivlar va passivlar komiteti', icon: '📊', color: 'green' },
  { value: 'AUDIT_KOMITETI', label: 'Audit komiteti', icon: '🔍', color: 'purple' },
  { value: 'RISK_KOMITETI', label: 'Risk-menejment komiteti', icon: '⚠️', color: 'red' },
  { value: 'BOSHQARUV_KENGASHI', label: 'Boshqaruv kengashi', icon: '👥', color: 'cyan' }
];

export default function CollegialPage() {
  const [bodies, setBodies] = useState<CollegialBody[]>([]);
  const [selectedBody, setSelectedBody] = useState<CollegialBody | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBodies();
  }, []);

  const loadBodies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/collegial/bodies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBodies(data);
      }
    } catch (error) {
      console.error('Error loading bodies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (bodyId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/collegial/bodies/${bodyId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleViewBody = async (body: CollegialBody) => {
    setSelectedBody(body);
    await loadMembers(body.id);
    setShowDetailModal(true);
  };

  const getBodyTypeInfo = (type: string) => {
    return BODY_TYPES.find(t => t.value === type) || BODY_TYPES[0];
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
        <h1 className="text-3xl font-bold">Kollegial Organlar</h1>
        <p className="text-gray-400 mt-1">Bank komitetlari va kengashlari</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Jami organlar</div>
          <div className="text-4xl font-bold text-cyan-400">{bodies.length}</div>
          <div className="text-xs text-gray-500 mt-1">Faol</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Jami a'zolar</div>
          <div className="text-4xl font-bold text-green-400">
            {bodies.reduce((sum, b) => sum + (b._count?.members || 0), 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Barcha organlarda</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Yig'ilishlar</div>
          <div className="text-4xl font-bold text-purple-400">
            {bodies.reduce((sum, b) => sum + (b._count?.meetings || 0), 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Jami o'tkazilgan</div>
        </div>
      </div>

      {/* Список органов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bodies.length > 0 ? (
          bodies.map(body => {
            const typeInfo = getBodyTypeInfo(body.type);
            return (
              <div 
                key={body.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition cursor-pointer"
                onClick={() => handleViewBody(body)}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-5xl bg-${typeInfo.color}-600/20 p-4 rounded-lg`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{body.name}</h3>
                    {body.description && (
                      <p className="text-sm text-gray-400 mb-3">{body.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Rais:</span>
                        <span className="ml-2 text-white">{body.chairman?.name || 'Tayinlanmagan'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Kotib:</span>
                        <span className="ml-2 text-white">{body.secretary?.name || 'Tayinlanmagan'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">A'zolar:</span>
                        <span className="ml-2 text-white">{body._count?.members || 0} kishi</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Yig'ilishlar:</span>
                        <span className="ml-2 text-white">{body._count?.meetings || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500 bg-gray-800/30 rounded-lg">
            <p>Kollegial organlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Подсказка */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Kollegial organlar tizimi</p>
            <p>Bank faoliyatini boshqaruvchi 5 ta asosiy komitet va kengash. Har birining o'z a'zolari va yig'ilishlari mavjud.</p>
          </div>
        </div>
      </div>

      {/* Модальное окно детального просмотра */}
      {showDetailModal && selectedBody && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedBody.name}</h2>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 bg-${getBodyTypeInfo(selectedBody.type).color}-600/20 text-${getBodyTypeInfo(selectedBody.type).color}-400 rounded-full text-sm`}>
                      {getBodyTypeInfo(selectedBody.type).label}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Руководство */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Rais</div>
                  <div className="text-lg font-semibold">{selectedBody.chairman?.name || 'Tayinlanmagan'}</div>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Kotib</div>
                  <div className="text-lg font-semibold">{selectedBody.secretary?.name || 'Tayinlanmagan'}</div>
                </div>
              </div>

              {/* Члены */}
              <div>
                <h3 className="text-xl font-semibold mb-3">👥 A'zolar ({members.length})</h3>
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {members.map(member => (
                      <div key={member.id} className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{member.user.name}</div>
                            <div className="text-sm text-gray-400">{member.user.email}</div>
                            {member.role && (
                              <div className="text-xs text-blue-400 mt-1">{member.role}</div>
                            )}
                          </div>
                          {member.isVotingMember && (
                            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                              Ovoz beruvchi
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded-lg">
                    A'zolar hali qo'shilmagan
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
