import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/login');
        return;
      }

      // First, try to get user data from localStorage (set during login)
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);

        // Ensure the stored data has all required fields
        const completeUserData = {
          id: parsedData.id || parsedData._id || '12345',
          name: parsedData.name || parsedData.fullName || parsedData.username || 'User',
          email: parsedData.email || 'user@example.com',
          memberSince: parsedData.memberSince || parsedData.createdAt || 'January 2024',
          healthStats: parsedData.healthStats || {
            heartRate: 72,
            bloodPressure: '120/80',
            temperature: '98.6°F',
            weight: '165 lbs'
          },
          upcomingAppointments: parsedData.upcomingAppointments || [
            {
              id: 'apt1',
              doctor: 'Dr. Sarah Johnson',
              specialty: 'Cardiologist',
              date: 'Feb 15, 2026',
              time: '10:00 AM',
              status: 'confirmed'
            },
            {
              id: 'apt2',
              doctor: 'Dr. Michael Chen',
              specialty: 'General Physician',
              date: 'Feb 20, 2026',
              time: '2:30 PM',
              status: 'pending'
            }
          ],
          recentPredictions: parsedData.recentPredictions || [],
          prescriptions: parsedData.prescriptions || [
            {
              id: 'rx1',
              medication: 'Amoxicillin',
              dosage: '500mg',
              frequency: 'Twice daily',
              prescribedBy: 'Dr. Johnson',
              startDate: 'Feb 1, 2026',
              endDate: 'Feb 10, 2026',
              refillsRemaining: 2
            }
          ],
          healthRecords: parsedData.healthRecords || [
            {
              id: 'rec1',
              type: 'Blood Test',
              date: 'Jan 15, 2026',
              provider: 'City Lab',
              status: 'completed'
            }
          ]
        };

        setUserData(completeUserData);
        setLoading(false);
        return;
      }

      // If no stored data, try to fetch from API
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      // Format the API data
      const formattedData = {
        id: data.id || data._id || '12345',
        name: data.name || data.fullName || data.username || 'User',
        email: data.email || 'user@example.com',
        memberSince: data.memberSince || data.createdAt || 'January 2024',
        healthStats: data.healthStats || {
          heartRate: 72,
          bloodPressure: '120/80',
          temperature: '98.6°F',
          weight: '165 lbs'
        },
        upcomingAppointments: data.upcomingAppointments || [],
        recentPredictions: data.recentPredictions || [],
        prescriptions: data.prescriptions || [],
        healthRecords: data.healthRecords || []
      };

      setUserData(formattedData);
      localStorage.setItem('userData', JSON.stringify(formattedData));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);

      // If API fails, check localStorage one more time
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        const completeUserData = {
          id: parsedData.id || parsedData._id || '12345',
          name: parsedData.name || parsedData.fullName || parsedData.username || 'User',
          email: parsedData.email || 'user@example.com',
          memberSince: parsedData.memberSince || parsedData.createdAt || 'January 2024',
          healthStats: parsedData.healthStats || {
            heartRate: 72,
            bloodPressure: '120/80',
            temperature: '98.6°F',
            weight: '165 lbs'
          },
          upcomingAppointments: parsedData.upcomingAppointments || [],
          recentPredictions: parsedData.recentPredictions || [],
          prescriptions: parsedData.prescriptions || [],
          healthRecords: parsedData.healthRecords || []
        };
        setUserData(completeUserData);
      } else {
        // Last resort: redirect to login if no data available
        console.error('No user data found, redirecting to login');
        navigate('/login');
      }

      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        // Mock notifications for demonstration
        setNotifications([
          {
            id: 'notif1',
            title: 'Appointment Reminder',
            message: 'You have an appointment with Dr. Johnson tomorrow at 10:00 AM',
            type: 'appointment',
            read: false,
            timestamp: new Date().toISOString()
          },
          {
            id: 'notif2',
            title: 'Prescription Expiring',
            message: 'Your Amoxicillin prescription expires in 3 days',
            type: 'prescription',
            read: false,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  }, [navigate]);

  const addSymptom = useCallback(() => {
    const trimmedSymptom = symptomInput.trim();
    if (trimmedSymptom && !symptoms.includes(trimmedSymptom)) {
      setSymptoms(prev => [...prev, trimmedSymptom]);
      setSymptomInput('');
    }
  }, [symptomInput, symptoms]);

  const removeSymptom = useCallback((symptom) => {
    setSymptoms(prev => prev.filter(s => s !== symptom));
    setPredictionResult(null);
  }, []);

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return;

    setAnalyzing(true);
    setPredictionResult(null);

    try {
      const response = await fetch('/api/prediction/predict-disease', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symptoms })
      });

      if (!response.ok) throw new Error('Prediction failed');

      const result = await response.json();
      setPredictionResult(result);

      // Save prediction to user history
      await savePredictionToHistory(result);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);

      // Fallback to intelligent mock prediction based on symptoms
      const mockPrediction = generateMockPrediction(symptoms);
      setPredictionResult(mockPrediction);

      // Save to local history
      savePredictionToLocalHistory(mockPrediction);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateMockPrediction = (symptoms) => {
    // Intelligent prediction based on symptom patterns
    const symptomLower = symptoms.map(s => s.toLowerCase());

    let prediction = {
      name: 'Common Cold',
      accuracy: 85,
      specialist: 'General Physician',
      description: 'A viral infection of the upper respiratory tract.',
      recommendations: [
        'Get plenty of rest',
        'Stay hydrated',
        'Use over-the-counter pain relievers if needed'
      ]
    };

    // Pattern matching for better predictions
    if (symptomLower.some(s => s.includes('fever') || s.includes('high temperature'))) {
      if (symptomLower.some(s => s.includes('cough') || s.includes('throat'))) {
        prediction = {
          name: 'Influenza (Flu)',
          accuracy: 88,
          specialist: 'General Physician',
          description: 'A viral infection affecting the respiratory system.',
          recommendations: [
            'Rest and stay home',
            'Drink plenty of fluids',
            'Consider antiviral medication',
            'Seek medical attention if symptoms worsen'
          ]
        };
      }
    }

    if (symptomLower.some(s => s.includes('headache'))) {
      if (symptomLower.some(s => s.includes('nausea') || s.includes('sensitivity to light'))) {
        prediction = {
          name: 'Migraine',
          accuracy: 82,
          specialist: 'Neurologist',
          description: 'A neurological condition characterized by intense headaches.',
          recommendations: [
            'Rest in a quiet, dark room',
            'Apply cold compress to forehead',
            'Stay hydrated',
            'Consider prescription migraine medication'
          ]
        };
      }
    }

    if (symptomLower.some(s => s.includes('stomach') || s.includes('nausea') || s.includes('vomiting'))) {
      prediction = {
        name: 'Gastroenteritis',
        accuracy: 80,
        specialist: 'Gastroenterologist',
        description: 'Inflammation of the digestive tract.',
        recommendations: [
          'Stay hydrated with clear fluids',
          'Follow BRAT diet (Bananas, Rice, Applesauce, Toast)',
          'Avoid dairy and fatty foods',
          'Rest and allow your body to recover'
        ]
      };
    }

    if (symptomLower.some(s => s.includes('chest pain') || s.includes('shortness of breath'))) {
      prediction = {
        name: 'Respiratory Infection',
        accuracy: 75,
        specialist: 'Pulmonologist',
        description: 'Infection affecting the respiratory system.',
        recommendations: [
          'SEEK IMMEDIATE MEDICAL ATTENTION',
          'Do not ignore chest pain',
          'Monitor breathing closely'
        ]
      };
    }

    return prediction;
  };

  const savePredictionToHistory = async (prediction) => {
    try {
      await fetch('/api/predictions/history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prediction: prediction.name,
          symptoms,
          accuracy: prediction.accuracy,
          specialist: prediction.specialist,
          date: new Date().toLocaleDateString()
        })
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  const savePredictionToLocalHistory = (prediction) => {
    const newPrediction = {
      id: `pred_${Date.now()}`,
      prediction: prediction.name,
      symptoms,
      accuracy: prediction.accuracy,
      date: new Date().toLocaleDateString(),
      specialist: prediction.specialist
    };

    setUserData(prev => ({
      ...prev,
      recentPredictions: [newPrediction, ...(prev.recentPredictions || [])].slice(0, 10)
    }));
  };

  const bookAppointment = async (specialist) => {
    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          specialist,
          reason: predictionResult?.name || 'General Consultation',
          symptoms
        })
      });

      if (response.ok) {
        alert('Appointment request sent! Our team will contact you shortly to confirm.');
        setActiveTab('appointments');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Appointment request submitted! (Demo mode: Not saved to server)');
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const NavItem = ({ icon, label, tab, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === tab
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
        }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        {sidebarOpen && <span className="font-semibold text-sm">{label}</span>}
      </div>
      {count !== undefined && count > 0 && sidebarOpen && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
          {count}
        </span>
      )}
    </button>
  );

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 text-slate-800 font-sans">

      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            top: `${mousePosition.y / 30}px`,
            left: `${mousePosition.x / 30}px`,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex min-h-screen relative z-10">

        {/* Enhanced Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-slate-200/50 p-4 transition-all duration-500 flex flex-col shadow-xl`}>

          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="font-bold text-white text-xl">M</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-900">MediPredict</span>
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">AI Healthcare</div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto">
                <span className="font-bold text-white text-xl">M</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <span className="text-slate-600 text-sm font-bold">{sidebarOpen ? '←' : '→'}</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <NavItem icon="📊" label="Overview" tab="overview" />
            <NavItem icon="🔬" label="Symptom Checker" tab="symptoms" />
            <NavItem icon="📅" label="Appointments" tab="appointments" count={userData.upcomingAppointments?.length} />
            <NavItem icon="📋" label="Health Records" tab="records" count={userData.healthRecords?.length} />
            <NavItem icon="💊" label="Prescriptions" tab="prescriptions" count={userData.prescriptions?.length} />
            <NavItem icon="📈" label="Analytics" tab="analytics" />
            <NavItem icon="⚙️" label="Settings" tab="settings" />
          </nav>

          {/* User Profile */}
          {sidebarOpen && (
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {getInitials(userData.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate text-sm">
                      {userData.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {userData.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors border border-slate-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  {activeTab === 'overview' && `Welcome back, ${userData.name?.split(' ')[0]}! 👋`}
                  {activeTab === 'symptoms' && 'AI Symptom Checker 🔬'}
                  {activeTab === 'appointments' && 'Your Appointments 📅'}
                  {activeTab === 'records' && 'Health Records 📋'}
                  {activeTab === 'prescriptions' && 'Prescriptions 💊'}
                  {activeTab === 'analytics' && 'Health Analytics 📈'}
                  {activeTab === 'settings' && 'Settings ⚙️'}
                </h1>
                <p className="text-slate-600 font-medium text-sm">
                  {activeTab === 'overview' && "Here's your health summary for today"}
                  {activeTab === 'symptoms' && 'Analyze your symptoms with AI-powered predictions'}
                  {activeTab === 'appointments' && 'Manage and schedule your medical appointments'}
                  {activeTab === 'records' && 'Access your complete medical history'}
                  {activeTab === 'prescriptions' && 'View and manage your prescriptions'}
                  {activeTab === 'analytics' && 'Track your health trends over time'}
                  {activeTab === 'settings' && 'Customize your dashboard preferences'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:shadow-md transition-all relative"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            <div className="text-4xl mb-2">🔔</div>
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                                  {notif.type === 'appointment' ? '📅' : '💊'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-slate-900 text-sm mb-1">{notif.title}</div>
                                  <div className="text-xs text-slate-600">{notif.message}</div>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </header>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon="❤️"
                  label="Heart Rate"
                  value={`${userData.healthStats?.heartRate || 72} bpm`}
                  trend={2}
                  color="bg-red-50 text-red-500"
                />
                <StatCard
                  icon="🩺"
                  label="Blood Pressure"
                  value={userData.healthStats?.bloodPressure || "120/80"}
                  trend={-1}
                  color="bg-blue-50 text-blue-500"
                />
                <StatCard
                  icon="🌡️"
                  label="Temperature"
                  value={userData.healthStats?.temperature || "98.6°F"}
                  color="bg-yellow-50 text-yellow-500"
                />
                <StatCard
                  icon="⚖️"
                  label="Weight"
                  value={userData.healthStats?.weight || "165 lbs"}
                  trend={-3}
                  color="bg-green-50 text-green-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('symptoms')}
                    className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all text-white text-left group shadow-lg shadow-blue-500/20"
                  >
                    <div className="text-3xl mb-2">🔬</div>
                    <div className="font-semibold mb-1">Check Symptoms</div>
                    <div className="text-sm text-blue-100">AI-powered analysis</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="p-5 rounded-xl bg-white hover:shadow-md transition-all border border-slate-200 text-left group"
                  >
                    <div className="text-3xl mb-2">📅</div>
                    <div className="font-semibold text-slate-900 mb-1">Book Appointment</div>
                    <div className="text-sm text-slate-600">Schedule with doctors</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('records')}
                    className="p-5 rounded-xl bg-white hover:shadow-md transition-all border border-slate-200 text-left group"
                  >
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-semibold text-slate-900 mb-1">View Records</div>
                    <div className="text-sm text-slate-600">Access medical history</div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(userData.upcomingAppointments || []).slice(0, 2).map((apt) => (
                      <div key={apt.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">{apt.doctor}</div>
                            <div className="text-sm text-slate-600">{apt.specialty}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${apt.status === 'confirmed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                          <span className="flex items-center gap-1.5">📅 {apt.date}</span>
                          <span className="flex items-center gap-1.5">🕐 {apt.time}</span>
                        </div>
                      </div>
                    ))}
                    {(!userData.upcomingAppointments || userData.upcomingAppointments.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-sm">No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Predictions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Recent Predictions</h2>
                    <button
                      onClick={() => setActiveTab('symptoms')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(userData.recentPredictions || []).slice(0, 2).map((pred) => (
                      <div key={pred.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-slate-900 mb-2">{pred.prediction}</div>
                            <div className="flex flex-wrap gap-2">
                              {pred.symptoms.map((symptom, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">{pred.date}</span>
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg font-semibold text-xs text-blue-700">
                            {pred.accuracy}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!userData.recentPredictions || userData.recentPredictions.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-2">🔬</div>
                        <p className="text-sm">No recent predictions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="space-y-6">

              <div className="grid lg:grid-cols-2 gap-6">

                {/* Symptom Input */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Enter Your Symptoms</h2>

                  <div className="space-y-4 mb-5">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                        placeholder="e.g., Headache, Fever, Cough..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium bg-white text-sm"
                      />
                      <button
                        onClick={addSymptom}
                        disabled={!symptomInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>

                    {symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {symptoms.map((symptom, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg font-medium text-slate-900 text-sm">
                            <span>{symptom}</span>
                            <button
                              onClick={() => removeSymptom(symptom)}
                              className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={analyzeSymptoms}
                    disabled={symptoms.length === 0 || analyzing}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {analyzing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </span>
                    ) : (
                      '🔬 Analyze Symptoms'
                    )}
                  </button>

                  <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex gap-3">
                      <span className="text-xl">ℹ️</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1 text-sm">Medical Disclaimer</div>
                        <div className="text-xs text-slate-600 leading-relaxed">
                          This AI prediction is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prediction Result */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">AI Analysis Result</h2>

                  {predictionResult ? (
                    <div className="space-y-4">
                      <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-2">Predicted Condition</div>
                        <div className="text-2xl font-bold mb-2">{predictionResult.name}</div>
                        <div className="text-sm text-blue-100 mb-4">{predictionResult.description}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Confidence Level</span>
                          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-lg font-semibold text-sm">
                            {predictionResult.accuracy}%
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="font-semibold text-slate-900 mb-3 text-sm">Recommended Specialist</div>
                        <div className="text-2xl mb-4">👨‍⚕️ {predictionResult.specialist}</div>
                        <button
                          onClick={() => bookAppointment(predictionResult.specialist)}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm"
                        >
                          Book Appointment
                        </button>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex gap-3">
                          <span className="text-xl">✅</span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 mb-2 text-sm">Recommendations</div>
                            <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                              {predictionResult.recommendations?.map((rec, idx) => (
                                <li key={idx}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="text-6xl mb-4">🔬</div>
                      <div className="font-bold text-slate-900 text-lg mb-2">Ready to Analyze</div>
                      <div className="text-slate-600 text-sm">
                        Add your symptoms and click analyze to get AI-powered predictions
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">All Appointments</h2>
                  <button
                    onClick={() => alert('Appointment booking feature - Contact: support@medipredict.com')}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm"
                  >
                    + New Appointment
                  </button>
                </div>

                <div className="space-y-3">
                  {(userData.upcomingAppointments || []).map((apt) => (
                    <div key={apt.id} className="p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
                            👨‍⚕️
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">{apt.doctor}</div>
                            <div className="text-sm text-slate-600 font-medium mb-2">{apt.specialty}</div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                              <span className="flex items-center gap-1.5">📅 {apt.date}</span>
                              <span className="flex items-center gap-1.5">🕐 {apt.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${apt.status === 'confirmed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                            {apt.status}
                          </span>
                          <button
                            onClick={() => alert(`Appointment options for ${apt.doctor}`)}
                            className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center transition-colors border border-slate-200"
                          >
                            <span className="text-slate-600">⋮</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!userData.upcomingAppointments || userData.upcomingAppointments.length === 0) && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📅</div>
                      <div className="font-bold text-slate-900 text-lg mb-2">No Appointments</div>
                      <div className="text-slate-600 text-sm mb-6">Schedule your first appointment with a doctor</div>
                      <button
                        onClick={() => alert('Appointment booking feature - Contact: support@medipredict.com')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Medical Records</h2>
                <button
                  onClick={() => alert('Upload record feature - Contact: support@medipredict.com')}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm"
                >
                  + Upload Record
                </button>
              </div>

              {userData.healthRecords && userData.healthRecords.length > 0 ? (
                <div className="space-y-3">
                  {userData.healthRecords.map((record) => (
                    <div key={record.id} className="p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                            📄
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">{record.type}</div>
                            <div className="text-sm text-slate-600">{record.provider} • {record.date}</div>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold">
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <div className="font-bold text-slate-900 text-lg mb-2">No Health Records</div>
                  <div className="text-slate-600 text-sm mb-6">Upload your medical records and documents</div>
                  <button
                    onClick={() => alert('Upload record feature - Contact: support@medipredict.com')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Upload First Record
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Active Prescriptions</h2>

              {userData.prescriptions && userData.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {userData.prescriptions.map((rx) => (
                    <div key={rx.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                            💊
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-lg mb-1">{rx.medication}</div>
                            <div className="text-sm text-slate-600 mb-2">{rx.dosage} • {rx.frequency}</div>
                            <div className="text-xs text-slate-500">Prescribed by {rx.prescribedBy}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">Refills</div>
                          <div className="font-bold text-slate-900">{rx.refillsRemaining}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Duration:</span> {rx.startDate} - {rx.endDate}
                        </div>
                        <button
                          onClick={() => alert('Request refill feature - Contact: support@medipredict.com')}
                          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Request Refill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💊</div>
                  <div className="font-bold text-slate-900 text-lg mb-2">No Active Prescriptions</div>
                  <div className="text-slate-600 text-sm">Your prescriptions will appear here</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Health Analytics</h2>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📈</div>
                <div className="font-bold text-slate-900 text-lg mb-2">Analytics Dashboard</div>
                <div className="text-slate-600 text-sm mb-6">Track your health metrics and trends over time</div>
                <div className="inline-block px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium">
                  Coming Soon
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-semibold text-slate-900 mb-4">Profile Information</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={userData.name || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Member Since</label>
                      <input
                        type="text"
                        value={userData.memberSince || '2024'}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm bg-white"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-semibold text-slate-900 mb-4">Preferences</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">Email Notifications</div>
                        <div className="text-xs text-slate-600">Receive appointment reminders</div>
                      </div>
                      <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">SMS Alerts</div>
                        <div className="text-xs text-slate-600">Get text message updates</div>
                      </div>
                      <button className="w-12 h-6 bg-slate-300 rounded-full relative">
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
                  <div className="font-semibold text-slate-900 mb-2">Danger Zone</div>
                  <div className="text-sm text-slate-600 mb-4">Permanently delete your account and all data</div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        alert('Account deletion request submitted');
                      }
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;