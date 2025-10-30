import React, { useState, useEffect } from 'react';

interface Schedule {
  id: number;
  type: string;
  date: string;
  maxSlots: number;
  startTime: string;
  endTime: string;
  location: string;
  slotDuration: number;
  receiver?: {
    id: number;
    name: string;
  };
  _count?: {
    appointments: number;
  };
}

interface Appointment {
  id: number;
  scheduleId: number;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  citizenAddress?: string;
  topic: string;
  description?: string;
  timeSlot: string;
  status: string;
  notes?: string;
  createdAt: string;
  schedule?: {
    type: string;
    date: string;
    location: string;
    receiver: {
      id: number;
      name: string;
    };
  };
}

const API_URL = 'http://localhost:5000/api';

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments'>('schedule');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  const [appointmentForm, setAppointmentForm] = useState({
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    citizenAddress: '',
    topic: '',
    description: '',
    timeSlot: ''
  });
  
  const [formData, setFormData] = useState({
    type: 'SHAXSIY',
    date: '',
    maxSlots: 10,
    startTime: '',
    endTime: '',
    location: '',
    slotDuration: 15
  });

  // Загрузка графиков и записей из API
  useEffect(() => {
    loadSchedules();
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reception/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
      currentMinutes += duration;
    }
    
    return slots;
  };

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    const slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration);
    setTimeSlots(slots);
    setShowDetailModal(true);
  };

  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reception/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const handleCreateSchedule = () => {
    setShowCreateModal(true);
  };

  const handleSaveSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/reception/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: formData.type,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          maxSlots: formData.maxSlots,
          slotDuration: formData.slotDuration
        })
      });
      
      if (response.ok) {
        const newSchedule = await response.json();
        setSchedules([...schedules, newSchedule]);
        setShowCreateModal(false);
        
        // Сброс формы
        setFormData({
          type: 'SHAXSIY',
          date: '',
          maxSlots: 10,
          startTime: '',
          endTime: '',
          location: '',
          slotDuration: 15
        });
        
        // Перезагрузить список
        loadSchedules();
      } else {
        alert('Xatolik yuz berdi!');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Xatolik yuz berdi!');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reception/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fuqarolarni Qabul Qilish</h1>
          <p className="text-gray-400 mt-1">Shaxsiy, ommaviy va sayyor qabullar</p>
        </div>
        <button 
          onClick={handleCreateSchedule}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          + Qabul jadvali yaratish
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-600">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'schedule'
              ? 'border-b-2 border-green-400 text-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Qabul jadvali
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'appointments'
              ? 'border-b-2 border-green-400 text-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Yozilganlar
        </button>
      </div>

      {activeTab === 'schedule' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Shaxsiy qabul</div>
              <div className="text-3xl font-bold">{schedules.filter(s => s.type === 'SHAXSIY').length}</div>
              <div className="text-xs text-gray-500 mt-1">Jadvallashtirilgan</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Ommaviy qabul</div>
              <div className="text-3xl font-bold">{schedules.filter(s => s.type === 'OMMAVIY').length}</div>
              <div className="text-xs text-gray-500 mt-1">Jadvallashtirilgan</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Sayyor qabul</div>
              <div className="text-3xl font-bold">{schedules.filter(s => s.type === 'SAYYOR').length}</div>
              <div className="text-xs text-gray-500 mt-1">Jadvallashtirilgan</div>
            </div>
          </div>

          {/* Список графиков */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">Qabul jadvallari</h2>
            {schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.map(schedule => (
                  <div key={schedule.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                            {schedule.type}
                          </span>
                          <span className="text-gray-400 text-sm">
                            📅 {schedule.date}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Vaqt:</span>
                            <span className="ml-2 text-white">{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Joy:</span>
                            <span className="ml-2 text-white">{schedule.location || 'Ko\'rsatilmagan'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Maksimal:</span>
                            <span className="ml-2 text-white">{schedule.maxSlots} kishi</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Davomiyligi:</span>
                            <span className="ml-2 text-white">{schedule.slotDuration} daqiqa</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewSchedule(schedule)}
                          className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded transition"
                        >
                          Ko'rish
                        </button>
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)}
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
              <div className="text-center py-8 text-gray-500">
                <p>Hozircha qabul jadvallari yo'q</p>
                <p className="text-sm mt-2">Yangi jadval yaratish uchun yuqoridagi tugmani bosing</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Yozilgan fuqarolar ({appointments.length})</h2>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map(appointment => (
                <div key={appointment.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          appointment.status === 'SCHEDULED' ? 'bg-yellow-600/20 text-yellow-400' :
                          appointment.status === 'COMPLETED' ? 'bg-green-600/20 text-green-400' :
                          appointment.status === 'CANCELLED' ? 'bg-red-600/20 text-red-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {appointment.status === 'SCHEDULED' ? 'Rejalashtirilgan' :
                           appointment.status === 'COMPLETED' ? 'Yakunlangan' :
                           appointment.status === 'CANCELLED' ? 'Bekor qilingan' : 'Kutilmoqda'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {appointment.schedule?.date} | {appointment.timeSlot}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{appointment.citizenName}</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Telefon:</span>
                          <span className="ml-2 text-white">{appointment.citizenPhone}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Mavzu:</span>
                          <span className="ml-2 text-white">{appointment.topic}</span>
                        </div>
                        {appointment.citizenEmail && (
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="ml-2 text-white">{appointment.citizenEmail}</span>
                          </div>
                        )}
                        {appointment.schedule?.receiver && (
                          <div>
                            <span className="text-gray-400">Qabul qiluvchi:</span>
                            <span className="ml-2 text-white">{appointment.schedule.receiver.name}</span>
                          </div>
                        )}
                      </div>
                      {appointment.description && (
                        <p className="text-sm text-gray-400 mt-2">{appointment.description}</p>
                      )}
                    </div>
                    {appointment.status === 'SCHEDULED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`${API_URL}/reception/appointments/${appointment.id}/status`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: 'COMPLETED' })
                              });
                              loadAppointments();
                            } catch (error) {
                              console.error('Error:', error);
                            }
                          }}
                          className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition text-sm"
                        >
                          Yakunlash
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`${API_URL}/reception/appointments/${appointment.id}/status`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: 'CANCELLED' })
                              });
                              loadAppointments();
                            } catch (error) {
                              console.error('Error:', error);
                            }
                          }}
                          className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition text-sm"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Hozircha yozilganlar yo'q</p>
            </div>
          )}
        </div>
      )}

      {/* Подсказка */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Fuqarolarni qabul qilish tizimi tayyor!</p>
            <p>Shaxsiy, ommaviy va sayyor qabullar uchun jadval yarating. Fuqarolar onlayn yozilishlari mumkin.</p>
          </div>
        </div>
      </div>

      {/* Модальное окно создания графика приема */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Qabul jadvali yaratish</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Qabul turi</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="SHAXSIY">Shaxsiy qabul</option>
                  <option value="OMMAVIY">Ommaviy qabul</option>
                  <option value="SAYYOR">Sayyor qabul</option>
                  <option value="ONLINE">Onlayn qabul</option>
                </select>
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
                  <label className="block text-sm font-medium mb-2">Maksimal odamlar soni</label>
                  <input 
                    type="number" 
                    value={formData.maxSlots}
                    onChange={(e) => setFormData({...formData, maxSlots: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                    placeholder="10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Boshlanish vaqti</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tugash vaqti</label>
                  <input 
                    type="time" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
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
                  placeholder="Qabul xonasi" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bir kishiga vaqt (daqiqa)</label>
                <input 
                  type="number" 
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" 
                  placeholder="15" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveSchedule} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition">
                Saqlash
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно детального просмотра графика */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Qabul jadvali</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                      {selectedSchedule.type}
                    </span>
                    <span className="text-gray-400">📅 {selectedSchedule.date}</span>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Vaqt</div>
                  <div className="text-white">🕐 {selectedSchedule.startTime} - {selectedSchedule.endTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Joylashuv</div>
                  <div className="text-white">📍 {selectedSchedule.location}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">⏰ Vaqt slotlari</h3>
                  <button
                    onClick={() => setShowAppointmentForm(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    + Yozilish
                  </button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((slot, index) => {
                    const isBooked = appointments.some(
                      a => a.scheduleId === selectedSchedule.id && a.timeSlot === slot && a.status === 'SCHEDULED'
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isBooked) {
                            setAppointmentForm({...appointmentForm, timeSlot: slot});
                            setShowAppointmentForm(true);
                          }
                        }}
                        disabled={isBooked}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          isBooked 
                            ? 'bg-red-600/20 text-red-400 cursor-not-allowed' 
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 cursor-pointer'
                        }`}
                      >
                        {slot} {isBooked && '✓'}
                      </button>
                    );
                  })}
                </div>
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

      {/* Модальное окно формы записи */}
      {showAppointmentForm && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Qabulga yozilish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">F.I.O. *</label>
                <input
                  type="text"
                  value={appointmentForm.citizenName}
                  onChange={(e) => setAppointmentForm({...appointmentForm, citizenName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  placeholder="To'liq ism"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon *</label>
                  <input
                    type="tel"
                    value={appointmentForm.citizenPhone}
                    onChange={(e) => setAppointmentForm({...appointmentForm, citizenPhone: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={appointmentForm.citizenEmail}
                    onChange={(e) => setAppointmentForm({...appointmentForm, citizenEmail: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Manzil</label>
                <input
                  type="text"
                  value={appointmentForm.citizenAddress}
                  onChange={(e) => setAppointmentForm({...appointmentForm, citizenAddress: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  placeholder="Yashash manzili"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Murojaat mavzusi *</label>
                <input
                  type="text"
                  value={appointmentForm.topic}
                  onChange={(e) => setAppointmentForm({...appointmentForm, topic: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  placeholder="Qisqacha mavzu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Batafsil</label>
                <textarea
                  value={appointmentForm.description}
                  onChange={(e) => setAppointmentForm({...appointmentForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  rows={3}
                  placeholder="Murojaat haqida batafsil ma'lumot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vaqt *</label>
                <select
                  value={appointmentForm.timeSlot}
                  onChange={(e) => setAppointmentForm({...appointmentForm, timeSlot: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <option value="">Tanlang</option>
                  {timeSlots.map((slot, index) => {
                    const isBooked = appointments.some(
                      a => a.scheduleId === selectedSchedule.id && a.timeSlot === slot && a.status === 'SCHEDULED'
                    );
                    return (
                      <option key={index} value={slot} disabled={isBooked}>
                        {slot} {isBooked ? '(Band)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!appointmentForm.citizenName || !appointmentForm.citizenPhone || !appointmentForm.topic || !appointmentForm.timeSlot) {
                    alert('Barcha majburiy maydonlarni to\'ldiring!');
                    return;
                  }
                  try {
                    const response = await fetch(`${API_URL}/reception/appointments`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        scheduleId: selectedSchedule.id,
                        citizenName: appointmentForm.citizenName,
                        citizenPhone: appointmentForm.citizenPhone,
                        citizenEmail: appointmentForm.citizenEmail || undefined,
                        citizenAddress: appointmentForm.citizenAddress || undefined,
                        topic: appointmentForm.topic,
                        description: appointmentForm.description || undefined,
                        timeSlot: appointmentForm.timeSlot
                      })
                    });
                    if (response.ok) {
                      setShowAppointmentForm(false);
                      setAppointmentForm({
                        citizenName: '',
                        citizenPhone: '',
                        citizenEmail: '',
                        citizenAddress: '',
                        topic: '',
                        description: '',
                        timeSlot: ''
                      });
                      loadAppointments();
                      alert('Muvaffaqiyatli yozildingiz!');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Xatolik yuz berdi!');
                  }
                }}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                Yozilish
              </button>
              <button
                onClick={() => {
                  setShowAppointmentForm(false);
                  setAppointmentForm({
                    citizenName: '',
                    citizenPhone: '',
                    citizenEmail: '',
                    citizenAddress: '',
                    topic: '',
                    description: '',
                    timeSlot: ''
                  });
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
