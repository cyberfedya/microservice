import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Meeting {
  id: number;
  type: string;
  title: string;
  scheduledDate: string;
  location: string;
  isOnline: boolean;
  status: string;
  createdBy?: {
    id: number;
    name: string;
  };
  _count?: {
    attendees: number;
    agenda: number;
    decisions: number;
  };
}

interface MeetingDetail extends Meeting {
  attendees: Array<{
    id: number;
    userId: number;
    role?: string;
    isRequired: boolean;
    attended: boolean;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  agenda: Array<{
    id: number;
    orderNumber: number;
    topic: string;
    description?: string;
    duration?: number;
    presenter?: {
      id: number;
      name: string;
    };
  }>;
  decisions: Array<{
    id: number;
    decision: string;
    votesFor?: number;
    votesAgainst?: number;
    votesAbstain?: number;
  }>;
}

const API_URL = 'http://localhost:5000/api';

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [users, setUsers] = useState<Array<{id: number; name: string; email: string}>>([]);
  
  const [agendaForm, setAgendaForm] = useState({
    topic: '',
    description: '',
    duration: 15,
    presenterId: 0
  });
  
  const [attendeeForm, setAttendeeForm] = useState({
    userId: 0,
    role: '',
    isRequired: true
  });
  
  const [decisionForm, setDecisionForm] = useState({
    decision: '',
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0
  });
  
  const [formData, setFormData] = useState({
    type: 'BOSHQARUV',
    title: '',
    date: '',
    time: '',
    location: '',
    isOnline: false
  });

  // Загрузка заседаний и пользователей из API
  useEffect(() => {
    loadMeetings();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    setShowCreateModal(true);
  };

  const handleSaveMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Объединяем дату и время
      const scheduledDate = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch(`${API_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          scheduledDate: scheduledDate.toISOString(),
          location: formData.location,
          isOnline: formData.isOnline
        })
      });
      
      if (response.ok) {
        const newMeeting = await response.json();
        setMeetings([...meetings, newMeeting]);
        setShowCreateModal(false);
        
        // Сброс формы
        setFormData({
          type: 'BOSHQARUV',
          title: '',
          date: '',
          time: '',
          location: '',
          isOnline: false
        });
        
        // Перезагрузить список
        loadMeetings();
      } else {
        alert('Xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Xatolik yuz berdi!');
    }
  };

  const handleViewMeeting = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/meetings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedMeeting(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading meeting details:', error);
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    if (!confirm('Yig\'ilishni o\'chirmoqchimisiz?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/meetings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMeetings(meetings.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Yig'ilishlar va Protokollar</h1>
          <p className="text-gray-400 mt-1">Boshqaruv va Kollegial organlar yig'ilishlari</p>
        </div>
        <button 
          onClick={handleCreateMeeting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          + Yangi yig'ilish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Rejalashtirilgan</div>
          <div className="text-3xl font-bold">{meetings.length}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Bugun</div>
          <div className="text-3xl font-bold">{meetings.filter(m => new Date(m.scheduledDate).toDateString() === new Date().toDateString()).length}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Onlayn</div>
          <div className="text-3xl font-bold">{meetings.filter(m => m.isOnline).length}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Oflayn</div>
          <div className="text-3xl font-bold">{meetings.filter(m => !m.isOnline).length}</div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Yaqinlashayotgan yig'ilishlar</h2>
        {meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map(meeting => (
              <div key={meeting.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-blue-500/50 transition cursor-pointer"
                   onClick={() => handleViewMeeting(meeting.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                        {meeting.type}
                      </span>
                      {meeting.isOnline && (
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                          Onlayn
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        meeting.status === 'PLANNED' ? 'bg-yellow-600/20 text-yellow-400' :
                        meeting.status === 'IN_PROGRESS' ? 'bg-green-600/20 text-green-400' :
                        meeting.status === 'COMPLETED' ? 'bg-gray-600/20 text-gray-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {meeting.status === 'PLANNED' ? 'Rejalashtirilgan' :
                         meeting.status === 'IN_PROGRESS' ? 'Davom etmoqda' :
                         meeting.status === 'COMPLETED' ? 'Yakunlangan' : 'Bekor qilingan'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{meeting.title}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Sana:</span>
                        <span className="ml-2 text-white">📅 {new Date(meeting.scheduledDate).toLocaleDateString('uz-UZ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Vaqt:</span>
                        <span className="ml-2 text-white">🕐 {new Date(meeting.scheduledDate).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Joy:</span>
                        <span className="ml-2 text-white">📍 {meeting.location || 'Ko\'rsatilmagan'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ishtirokchilar:</span>
                        <span className="ml-2 text-white">👥 {meeting._count?.attendees || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMeeting(meeting.id);
                      }}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded transition"
                    >
                      Ko'rish
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMeeting(meeting.id);
                      }}
                      className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Hozircha yig'ilishlar yo'q</p>
            <p className="text-sm mt-2">Yangi yig'ilish yarating</p>
          </div>
        )}
      </div>

      {/* Подсказка для пользователя */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Bu sahifa to'liq ishlaydi!</p>
            <p>Yig'ilishlar yaratish, protokollar tuzish va qarorlar qabul qilish uchun "Yangi yig'ilish" tugmasini bosing.</p>
          </div>
        </div>
      </div>

      {/* Модальное окно детального просмотра */}
      {showDetailModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Заголовок */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedMeeting.title}</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                      {selectedMeeting.type}
                    </span>
                    {selectedMeeting.isOnline && (
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                        Onlayn
                      </span>
                    )}
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

            {/* Основная информация */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Sana va vaqt</div>
                  <div className="text-white">📅 {new Date(selectedMeeting.scheduledDate).toLocaleString('uz-UZ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Joylashuv</div>
                  <div className="text-white">📍 {selectedMeeting.location || 'Ko\'rsatilmagan'}</div>
                </div>
              </div>

              {/* Повестка дня */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">📋 Kun tartibi</h3>
                  <button
                    onClick={() => setShowAgendaForm(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                  >
                    + Qo'shish
                  </button>
                </div>
                {selectedMeeting.agenda && selectedMeeting.agenda.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMeeting.agenda.map((item, index) => (
                      <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.topic}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-400">
                              {item.presenter && (
                                <span>👤 {item.presenter.name}</span>
                              )}
                              {item.duration && (
                                <span>⏱️ {item.duration} daqiqa</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded-lg">
                    Kun tartibi hali qo'shilmagan
                  </div>
                )}
              </div>

              {/* Участники */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">👥 Ishtirokchilar ({selectedMeeting.attendees?.length || 0})</h3>
                  <button
                    onClick={() => setShowAttendeeForm(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                  >
                    + Qo'shish
                  </button>
                </div>
                {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMeeting.attendees.map((attendee) => (
                      <div key={attendee.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{attendee.user.name}</div>
                          <div className="text-sm text-gray-400">{attendee.user.email}</div>
                          {attendee.role && (
                            <div className="text-xs text-blue-400 mt-1">{attendee.role}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {attendee.isRequired && (
                            <span className="text-xs px-2 py-1 bg-orange-600/20 text-orange-400 rounded">Majburiy</span>
                          )}
                          {attendee.attended ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-gray-500">○</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded-lg">
                    Ishtirokchilar hali qo'shilmagan
                  </div>
                )}
              </div>

              {/* Решения */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">📝 Qarorlar</h3>
                  <button
                    onClick={() => setShowDecisionForm(true)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
                  >
                    + Qo'shish
                  </button>
                </div>
                {selectedMeeting.decisions && selectedMeeting.decisions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMeeting.decisions.map((decision, index) => (
                      <div key={decision.id} className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="mb-2">{decision.decision}</p>
                            {(decision.votesFor !== undefined || decision.votesAgainst !== undefined) && (
                              <div className="flex gap-4 text-sm">
                                <span className="text-green-400">✓ {decision.votesFor || 0}</span>
                                <span className="text-red-400">✗ {decision.votesAgainst || 0}</span>
                                <span className="text-gray-400">○ {decision.votesAbstain || 0}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-700/30 rounded-lg">
                    Qarorlar hali qabul qilinmagan
                  </div>
                )}
              </div>
            </div>

            {/* Футер с кнопками */}
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

      {/* Модальное окно создания заседания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Yangi yig'ilish yaratish</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Yig'ilish turi</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="BOSHQARUV">Boshqaruv yig'ilishi</option>
                  <option value="KOLLEGIAL">Kollegial organ</option>
                  <option value="KENGASH">Kengash</option>
                  <option value="AKSIYADORLAR">Aksiyadorlar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mavzu</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  placeholder="Yig'ilish mavzusi" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sana</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vaqt</label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Joylashuv</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  placeholder="Yig'ilish joyi" 
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="online" 
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({...formData, isOnline: e.target.checked})}
                  className="w-4 h-4" 
                />
                <label htmlFor="online" className="text-sm">Onlayn yig'ilish</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveMeeting} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                Saqlash
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно добавления повестки дня */}
      {showAgendaForm && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Kun tartibi qo'shish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mavzu *</label>
                <input
                  type="text"
                  value={agendaForm.topic}
                  onChange={(e) => setAgendaForm({...agendaForm, topic: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  placeholder="Muhokama qilinadigan mavzu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <textarea
                  value={agendaForm.description}
                  onChange={(e) => setAgendaForm({...agendaForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  rows={3}
                  placeholder="Qo'shimcha ma'lumot"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Davomiyligi (daqiqa)</label>
                  <input
                    type="number"
                    value={agendaForm.duration}
                    onChange={(e) => setAgendaForm({...agendaForm, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    min="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ma'ruzachi</label>
                  <select
                    value={agendaForm.presenterId}
                    onChange={(e) => setAgendaForm({...agendaForm, presenterId: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  >
                    <option value="0">Tanlanmagan</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!agendaForm.topic) {
                    alert('Mavzu kiritilishi shart!');
                    return;
                  }
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/meetings/${selectedMeeting.id}/agenda`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        topic: agendaForm.topic,
                        description: agendaForm.description || undefined,
                        duration: agendaForm.duration,
                        presenterId: agendaForm.presenterId || undefined
                      })
                    });
                    if (response.ok) {
                      setShowAgendaForm(false);
                      setAgendaForm({ topic: '', description: '', duration: 15, presenterId: 0 });
                      handleViewMeeting(selectedMeeting.id);
                    }
                  } catch (error) {
                    console.error('Error adding agenda:', error);
                  }
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Saqlash
              </button>
              <button
                onClick={() => {
                  setShowAgendaForm(false);
                  setAgendaForm({ topic: '', description: '', duration: 15, presenterId: 0 });
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления участника */}
      {showAttendeeForm && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Ishtirokchi qo'shish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Foydalanuvchi *</label>
                <select
                  value={attendeeForm.userId}
                  onChange={(e) => setAttendeeForm({...attendeeForm, userId: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="0">Tanlang</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Roli</label>
                <input
                  type="text"
                  value={attendeeForm.role}
                  onChange={(e) => setAttendeeForm({...attendeeForm, role: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  placeholder="Masalan: Rais, Kotib, A'zo"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={attendeeForm.isRequired}
                  onChange={(e) => setAttendeeForm({...attendeeForm, isRequired: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="isRequired" className="text-sm">Majburiy ishtirokchi</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!attendeeForm.userId) {
                    alert('Foydalanuvchi tanlanishi shart!');
                    return;
                  }
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/meetings/${selectedMeeting.id}/attendees`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        userId: attendeeForm.userId,
                        role: attendeeForm.role || undefined,
                        isRequired: attendeeForm.isRequired
                      })
                    });
                    if (response.ok) {
                      setShowAttendeeForm(false);
                      setAttendeeForm({ userId: 0, role: '', isRequired: true });
                      handleViewMeeting(selectedMeeting.id);
                    }
                  } catch (error) {
                    console.error('Error adding attendee:', error);
                  }
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Saqlash
              </button>
              <button
                onClick={() => {
                  setShowAttendeeForm(false);
                  setAttendeeForm({ userId: 0, role: '', isRequired: true });
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления решения */}
      {showDecisionForm && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Qaror qo'shish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Qaror matni *</label>
                <textarea
                  value={decisionForm.decision}
                  onChange={(e) => setDecisionForm({...decisionForm, decision: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  rows={4}
                  placeholder="Qabul qilingan qaror matni"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ovoz berish natijalari</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Taraf</label>
                    <input
                      type="number"
                      value={decisionForm.votesFor}
                      onChange={(e) => setDecisionForm({...decisionForm, votesFor: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Qarshi</label>
                    <input
                      type="number"
                      value={decisionForm.votesAgainst}
                      onChange={(e) => setDecisionForm({...decisionForm, votesAgainst: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Betaraf</label>
                    <input
                      type="number"
                      value={decisionForm.votesAbstain}
                      onChange={(e) => setDecisionForm({...decisionForm, votesAbstain: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!decisionForm.decision) {
                    alert('Qaror matni kiritilishi shart!');
                    return;
                  }
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/meetings/${selectedMeeting.id}/decisions`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        decision: decisionForm.decision,
                        votesFor: decisionForm.votesFor || undefined,
                        votesAgainst: decisionForm.votesAgainst || undefined,
                        votesAbstain: decisionForm.votesAbstain || undefined
                      })
                    });
                    if (response.ok) {
                      setShowDecisionForm(false);
                      setDecisionForm({ decision: '', votesFor: 0, votesAgainst: 0, votesAbstain: 0 });
                      handleViewMeeting(selectedMeeting.id);
                    }
                  } catch (error) {
                    console.error('Error adding decision:', error);
                  }
                }}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                Saqlash
              </button>
              <button
                onClick={() => {
                  setShowDecisionForm(false);
                  setDecisionForm({ decision: '', votesFor: 0, votesAgainst: 0, votesAbstain: 0 });
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
