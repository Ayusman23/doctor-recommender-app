import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [diagnosisForm, setDiagnosisForm] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    tests: '',
    notes: ''
  });

  // Fetch doctor data on component mount
  useEffect(() => {
    fetchDoctorData();
    fetchNotifications();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user data from localStorage (set during login)
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        
        // Verify this is a doctor account
        if (parsedData.role !== 'doctor') {
          alert('Access denied. This is a doctor-only portal.');
          navigate('/dashboard'); // Redirect to user dashboard
          return;
        }
        
        const completeDoctorData = {
          id: parsedData.uid || parsedData.id || parsedData._id || 'doc123',
          name: parsedData.name || parsedData.displayName || parsedData.fullName || 'Dr. Smith',
          email: parsedData.email || 'doctor@example.com',
          photoURL: parsedData.photoURL || '',
          role: parsedData.role || 'doctor',
          specialty: parsedData.specialty || 'General Physician',
          license: parsedData.license || 'MD-123456',
          experience: parsedData.experience || '10 years',
          rating: parsedData.rating || 4.8,
          totalPatients: parsedData.totalPatients || 245,
          todayAppointments: parsedData.todayAppointments || [
            {
              id: 'apt1',
              patientName: 'John Doe',
              patientId: 'pat001',
              time: '09:00 AM',
              type: 'Consultation',
              status: 'scheduled',
              duration: '30 min',
              reason: 'Follow-up checkup'
            },
            {
              id: 'apt2',
              patientName: 'Sarah Johnson',
              patientId: 'pat002',
              time: '10:00 AM',
              type: 'New Patient',
              status: 'scheduled',
              duration: '45 min',
              reason: 'General checkup'
            },
            {
              id: 'apt3',
              patientName: 'Michael Chen',
              patientId: 'pat003',
              time: '11:30 AM',
              type: 'Follow-up',
              status: 'completed',
              duration: '30 min',
              reason: 'Medication review'
            }
          ],
          upcomingAppointments: parsedData.upcomingAppointments || [
            {
              id: 'apt4',
              patientName: 'Emma Wilson',
              patientId: 'pat004',
              date: 'Feb 7, 2026',
              time: '2:00 PM',
              type: 'Consultation',
              status: 'scheduled'
            },
            {
              id: 'apt5',
              patientName: 'David Brown',
              patientId: 'pat005',
              date: 'Feb 8, 2026',
              time: '9:30 AM',
              type: 'Follow-up',
              status: 'scheduled'
            }
          ],
          patients: parsedData.patients || [
            {
              id: 'pat001',
              name: 'John Doe',
              age: 45,
              gender: 'Male',
              lastVisit: 'Jan 28, 2026',
              condition: 'Hypertension',
              status: 'Stable',
              contact: 'john.doe@email.com',
              phone: '+1 234-567-8901'
            },
            {
              id: 'pat002',
              name: 'Sarah Johnson',
              age: 32,
              gender: 'Female',
              lastVisit: 'Jan 30, 2026',
              condition: 'Diabetes Type 2',
              status: 'Under Treatment',
              contact: 'sarah.j@email.com',
              phone: '+1 234-567-8902'
            },
            {
              id: 'pat003',
              name: 'Michael Chen',
              age: 58,
              gender: 'Male',
              lastVisit: 'Feb 6, 2026',
              condition: 'High Cholesterol',
              status: 'Improving',
              contact: 'mchen@email.com',
              phone: '+1 234-567-8903'
            },
            {
              id: 'pat004',
              name: 'Emma Wilson',
              age: 28,
              gender: 'Female',
              lastVisit: 'Jan 25, 2026',
              condition: 'Migraine',
              status: 'Stable',
              contact: 'emma.w@email.com',
              phone: '+1 234-567-8904'
            }
          ],
          prescriptions: parsedData.prescriptions || [
            {
              id: 'rx1',
              patientName: 'John Doe',
              patientId: 'pat001',
              medication: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              date: 'Feb 1, 2026',
              status: 'Active'
            },
            {
              id: 'rx2',
              patientName: 'Sarah Johnson',
              patientId: 'pat002',
              medication: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              date: 'Jan 30, 2026',
              status: 'Active'
            }
          ],
          recentDiagnoses: parsedData.recentDiagnoses || [
            {
              id: 'diag1',
              patientName: 'Michael Chen',
              diagnosis: 'Hyperlipidemia',
              date: 'Feb 6, 2026',
              severity: 'Moderate'
            },
            {
              id: 'diag2',
              patientName: 'Emma Wilson',
              diagnosis: 'Chronic Migraine',
              date: 'Feb 5, 2026',
              severity: 'Mild'
            }
          ],
          stats: parsedData.stats || {
            todayAppointments: 3,
            weeklyAppointments: 18,
            activePatients: 245,
            pendingReviews: 5
          }
        };
        
        setDoctorData(completeDoctorData);
        setLoading(false);
        return;
      }

      // If no stored data, try to fetch from API
      const response = await fetch('/api/doctor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor data');
      }

      const data = await response.json();
      
      const formattedData = {
        id: data.uid || data.id || data._id || 'doc123',
        name: data.name || data.displayName || data.fullName || 'Dr. Smith',
        email: data.email || 'doctor@example.com',
        photoURL: data.photoURL || '',
        role: data.role || 'doctor',
        specialty: data.specialty || 'General Physician',
        license: data.license || 'MD-123456',
        experience: data.experience || '10 years',
        rating: data.rating || 4.8,
        totalPatients: data.totalPatients || 245,
        todayAppointments: data.todayAppointments || [],
        upcomingAppointments: data.upcomingAppointments || [],
        patients: data.patients || [],
        prescriptions: data.prescriptions || [],
        recentDiagnoses: data.recentDiagnoses || [],
        stats: data.stats || {
          todayAppointments: 0,
          weeklyAppointments: 0,
          activePatients: 0,
          pendingReviews: 0
        }
      };
      
      setDoctorData(formattedData);
      // Don't overwrite userData in localStorage - keep the role info
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      
      // Fallback: check userData again
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        
        // Verify doctor role
        if (parsedData.role !== 'doctor') {
          alert('Access denied. This is a doctor-only portal.');
          navigate('/dashboard');
          return;
        }
        
        // Set basic doctor data with mock information
        const fallbackData = {
          id: parsedData.uid || 'doc123',
          name: parsedData.name || parsedData.displayName || 'Dr. Smith',
          email: parsedData.email || 'doctor@example.com',
          photoURL: parsedData.photoURL || '',
          role: parsedData.role || 'doctor',
          specialty: 'General Physician',
          license: 'MD-123456',
          experience: '10 years',
          rating: 4.8,
          totalPatients: 245,
          todayAppointments: [
            {
              id: 'apt1',
              patientName: 'John Doe',
              patientId: 'pat001',
              time: '09:00 AM',
              type: 'Consultation',
              status: 'scheduled',
              duration: '30 min',
              reason: 'Follow-up checkup'
            }
          ],
          upcomingAppointments: [],
          patients: [],
          prescriptions: [],
          recentDiagnoses: [],
          stats: {
            todayAppointments: 1,
            weeklyAppointments: 5,
            activePatients: 245,
            pendingReviews: 0
          }
        };
        setDoctorData(fallbackData);
      } else {
        console.error('No user data found, redirecting to login');
        navigate('/login');
      }
      
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/doctor/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setNotifications([
          {
            id: 'notif1',
            title: 'New Appointment Request',
            message: 'Emma Wilson requested an appointment for tomorrow',
            type: 'appointment',
            read: false,
            timestamp: new Date().toISOString()
          },
          {
            id: 'notif2',
            title: 'Lab Results Available',
            message: 'Blood test results for John Doe are ready for review',
            type: 'lab',
            read: false,
            timestamp: new Date().toISOString()
          },
          {
            id: 'notif3',
            title: 'Prescription Refill Request',
            message: 'Sarah Johnson requested a refill for Metformin',
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

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/prescriptions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionForm)
      });

      if (response.ok) {
        alert('Prescription created successfully!');
        setPrescriptionForm({
          patientId: '',
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        });
        fetchDoctorData();
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Prescription submitted! (Demo mode: Not saved to server)');
    }
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/diagnoses/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(diagnosisForm)
      });

      if (response.ok) {
        alert('Diagnosis recorded successfully!');
        setDiagnosisForm({
          patientId: '',
          diagnosis: '',
          symptoms: '',
          tests: '',
          notes: ''
        });
        fetchDoctorData();
      }
    } catch (error) {
      console.error('Error recording diagnosis:', error);
      alert('Diagnosis submitted! (Demo mode: Not saved to server)');
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      fetchDoctorData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Appointment updated! (Demo mode)');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'D';
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
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
        activeTab === tab
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
          : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        {sidebarOpen && <span className="font-semibold text-sm">{label}</span>}
      </div>
      {count !== undefined && count > 0 && sidebarOpen && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return null;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 text-slate-800 font-sans">
      
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            top: `${mousePosition.y / 30}px`,
            left: `${mousePosition.x / 30}px`,
          }}
        ></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        
        {/* Enhanced Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-slate-200/50 p-4 transition-all duration-500 flex flex-col shadow-xl`}>
          
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span className="font-bold text-white text-xl">⚕️</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-900">MediPredict</span>
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Doctor Portal</div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto">
                <span className="font-bold text-white text-xl">⚕️</span>
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
            <NavItem icon="📅" label="Appointments" tab="appointments" count={doctorData.stats?.todayAppointments} />
            <NavItem icon="👥" label="Patients" tab="patients" count={doctorData.patients?.length} />
            <NavItem icon="💊" label="Prescriptions" tab="prescriptions" />
            <NavItem icon="🔬" label="Diagnoses" tab="diagnoses" />
            <NavItem icon="📈" label="Analytics" tab="analytics" />
            <NavItem icon="⚙️" label="Settings" tab="settings" />
          </nav>

          {/* Doctor Profile */}
          {sidebarOpen && (
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {getInitials(doctorData.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate text-sm">
                      {doctorData.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {doctorData.specialty}
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
                  {activeTab === 'overview' && `Welcome, ${doctorData.name}! 👨‍⚕️`}
                  {activeTab === 'appointments' && 'Appointments 📅'}
                  {activeTab === 'patients' && 'Patient Records 👥'}
                  {activeTab === 'prescriptions' && 'Prescriptions 💊'}
                  {activeTab === 'diagnoses' && 'Diagnoses 🔬'}
                  {activeTab === 'analytics' && 'Analytics 📈'}
                  {activeTab === 'settings' && 'Settings ⚙️'}
                </h1>
                <p className="text-slate-600 font-medium text-sm">
                  {activeTab === 'overview' && "Here's your practice overview for today"}
                  {activeTab === 'appointments' && 'Manage your appointments and schedule'}
                  {activeTab === 'patients' && 'View and manage patient information'}
                  {activeTab === 'prescriptions' && 'Create and manage prescriptions'}
                  {activeTab === 'diagnoses' && 'Record and review diagnoses'}
                  {activeTab === 'analytics' && 'View practice statistics and insights'}
                  {activeTab === 'settings' && 'Customize your preferences'}
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
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
                                  {notif.type === 'appointment' ? '📅' : notif.type === 'lab' ? '🔬' : '💊'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-slate-900 text-sm mb-1">{notif.title}</div>
                                  <div className="text-xs text-slate-600">{notif.message}</div>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
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
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
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
                  icon="📅" 
                  label="Today's Appointments" 
                  value={doctorData.stats?.todayAppointments || 0} 
                  trend={5} 
                  color="bg-blue-50 text-blue-500" 
                />
                <StatCard 
                  icon="👥" 
                  label="Active Patients" 
                  value={doctorData.stats?.activePatients || 0} 
                  trend={8} 
                  color="bg-emerald-50 text-emerald-500" 
                />
                <StatCard 
                  icon="📊" 
                  label="Weekly Appointments" 
                  value={doctorData.stats?.weeklyAppointments || 0} 
                  color="bg-purple-50 text-purple-500" 
                />
                <StatCard 
                  icon="⭐" 
                  label="Rating" 
                  value={doctorData.rating || '4.8'} 
                  color="bg-yellow-50 text-yellow-500" 
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all text-white text-left group shadow-lg shadow-emerald-500/20"
                  >
                    <div className="text-3xl mb-2">📅</div>
                    <div className="font-semibold mb-1">View Schedule</div>
                    <div className="text-sm text-emerald-100">Today's appointments</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('patients')}
                    className="p-5 rounded-xl bg-white hover:shadow-md transition-all border border-slate-200 text-left group"
                  >
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-semibold text-slate-900 mb-1">Patient Records</div>
                    <div className="text-sm text-slate-600">Access patient data</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('prescriptions')}
                    className="p-5 rounded-xl bg-white hover:shadow-md transition-all border border-slate-200 text-left group"
                  >
                    <div className="text-3xl mb-2">💊</div>
                    <div className="font-semibold text-slate-900 mb-1">New Prescription</div>
                    <div className="text-sm text-slate-600">Create prescription</div>
                  </button>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(doctorData.todayAppointments || []).map((apt) => (
                      <div key={apt.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">{apt.patientName}</div>
                            <div className="text-sm text-slate-600">{apt.type} • {apt.duration}</div>
                            <div className="text-xs text-slate-500 mt-1">{apt.reason}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            apt.status === 'completed' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mt-3">
                          <span className="flex items-center gap-1.5">🕐 {apt.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Diagnoses */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Recent Diagnoses</h2>
                    <button 
                      onClick={() => setActiveTab('diagnoses')}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(doctorData.recentDiagnoses || []).map((diag) => (
                      <div key={diag.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">{diag.patientName}</div>
                            <div className="text-sm text-slate-600">{diag.diagnosis}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            diag.severity === 'Mild' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {diag.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{diag.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">All Appointments</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Today's Appointments</h3>
                    <div className="space-y-3">
                      {(doctorData.todayAppointments || []).map((apt) => (
                        <div key={apt.id} className="p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
                                👤
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 mb-1">{apt.patientName}</div>
                                <div className="text-sm text-slate-600 font-medium mb-1">{apt.type}</div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                  <span className="flex items-center gap-1.5">🕐 {apt.time}</span>
                                  <span className="flex items-center gap-1.5">⏱️ {apt.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                                apt.status === 'completed' 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {apt.status}
                              </span>
                              {apt.status !== 'completed' && (
                                <button 
                                  onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Upcoming Appointments</h3>
                    <div className="space-y-3">
                      {(doctorData.upcomingAppointments || []).map((apt) => (
                        <div key={apt.id} className="p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
                                👤
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 mb-1">{apt.patientName}</div>
                                <div className="text-sm text-slate-600 font-medium mb-1">{apt.type}</div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                  <span className="flex items-center gap-1.5">📅 {apt.date}</span>
                                  <span className="flex items-center gap-1.5">🕐 {apt.time}</span>
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Patient Records</h2>
                <button 
                  onClick={() => alert('Add new patient feature')}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm"
                >
                  + New Patient
                </button>
              </div>
              
              <div className="space-y-3">
                {(doctorData.patients || []).map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {getInitials(patient.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">{patient.name}</div>
                          <div className="text-sm text-slate-600 mb-1">{patient.age} years • {patient.gender}</div>
                          <div className="text-xs text-slate-500">Last visit: {patient.lastVisit}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900 mb-1">{patient.condition}</div>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                          patient.status === 'Stable' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : patient.status === 'Improving'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Prescription</h2>
                
                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
                      <select 
                        value={prescriptionForm.patientId}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, patientId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        required
                      >
                        <option value="">Select Patient</option>
                        {(doctorData.patients || []).map(patient => (
                          <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Medication</label>
                      <input 
                        type="text"
                        value={prescriptionForm.medication}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., Amoxicillin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Dosage</label>
                      <input 
                        type="text"
                        value={prescriptionForm.dosage}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                      <input 
                        type="text"
                        value={prescriptionForm.frequency}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., Twice daily"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                      <input 
                        type="text"
                        value={prescriptionForm.duration}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Instructions</label>
                      <input 
                        type="text"
                        value={prescriptionForm.instructions}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., Take with food"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    Create Prescription
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Prescriptions</h2>
                
                <div className="space-y-3">
                  {(doctorData.prescriptions || []).map((rx) => (
                    <div key={rx.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">{rx.patientName}</div>
                          <div className="text-sm text-slate-600">{rx.medication} - {rx.dosage}</div>
                          <div className="text-xs text-slate-500 mt-1">{rx.frequency}</div>
                        </div>
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          {rx.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{rx.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnoses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Record New Diagnosis</h2>
                
                <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
                      <select 
                        value={diagnosisForm.patientId}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, patientId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        required
                      >
                        <option value="">Select Patient</option>
                        {(doctorData.patients || []).map(patient => (
                          <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis</label>
                      <input 
                        type="text"
                        value={diagnosisForm.diagnosis}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., Hypertension"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
                      <textarea 
                        value={diagnosisForm.symptoms}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, symptoms: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        rows="3"
                        placeholder="List observed symptoms..."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tests Ordered</label>
                      <input 
                        type="text"
                        value={diagnosisForm.tests}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, tests: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder="e.g., Blood pressure, ECG"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                      <textarea 
                        value={diagnosisForm.notes}
                        onChange={(e) => setDiagnosisForm({...diagnosisForm, notes: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        rows="3"
                        placeholder="Any additional observations or recommendations..."
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    Record Diagnosis
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Diagnoses</h2>
                
                <div className="space-y-3">
                  {(doctorData.recentDiagnoses || []).map((diag) => (
                    <div key={diag.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">{diag.patientName}</div>
                          <div className="text-sm text-slate-600">{diag.diagnosis}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          diag.severity === 'Mild' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {diag.severity}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{diag.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Practice Analytics</h2>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📈</div>
                <div className="font-bold text-slate-900 text-lg mb-2">Analytics Dashboard</div>
                <div className="text-slate-600 text-sm mb-6">View detailed statistics and insights about your practice</div>
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
                  <div className="font-semibold text-slate-900 mb-4">Professional Information</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={doctorData.name || ''} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white" 
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={doctorData.email || ''} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white" 
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                      <input 
                        type="text" 
                        value={doctorData.specialty || ''} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white" 
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                      <input 
                        type="text" 
                        value={doctorData.license || ''} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white" 
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
                        <div className="font-medium text-slate-900 text-sm">Appointment Reminders</div>
                        <div className="text-xs text-slate-600">Get notified about upcoming appointments</div>
                      </div>
                      <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">Patient Updates</div>
                        <div className="text-xs text-slate-600">Receive notifications for patient status changes</div>
                      </div>
                      <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;