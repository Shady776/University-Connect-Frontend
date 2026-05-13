import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Settings, 
  ChevronRight, 
  UserPlus, 
  AlertCircle,
  X,
  Save,
  Loader2,
  FileText,
  Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BASE_URL } from "@/components/api/api";

const USER_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' }
];

const DEPARTMENTS = [
  { value: 'CSC', label: 'Computer Science (CSC)' },
  { value: 'SEN', label: 'Software Engineering (SEN)' },
  { value: 'IFT', label: 'Information Technology (IFT)' },
  { value: 'CYB', label: 'Cybersecurity (CYB)' }
];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: '',
    department: ''
  });

  const [courseForm, setCourseForm] = useState({
    course_code: '',
    title: '',
    department: '',
    semester: '',
    description: '',
    location: '',
    schedule: '',
    credits: 3
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    target_role: 'all'
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminName(data.full_name || data.username);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch dashboard stats
      const dashboardRes = await fetch(`${BASE_URL}/admin/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await dashboardRes.json();
      setDashboardData(data);
      
      // Fetch recent users
      const usersRes = await fetch(`${BASE_URL}/admin/users/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData);
      }

      // Fetch system alerts
      const alertsRes = await fetch(`${BASE_URL}/admin/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setError('');
    
    if (type === 'user') {
      setUserForm({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: '',
        department: ''
      });
    } else if (type === 'course') {
      setCourseForm({
        course_code: '',
        title: '',
        department: '',
        semester: '',
        description: '',
        location: '',
        schedule: '',
        credits: 3
      });
    } else if (type === 'announcement') {
      setAnnouncementForm({
        title: '',
        message: '',
        target_role: 'all'
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setError('');
  };

  const handleCreateUser = async () => {
    if (!userForm.username || !userForm.email || !userForm.password || !userForm.role) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }

      await fetchDashboardData();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.course_code || !courseForm.title || !courseForm.department || !courseForm.semester) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/admin/courses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create course');
      }

      await fetchDashboardData();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/admin/announcements/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcementForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send announcement');
      }

      await fetchDashboardData();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={adminName}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {
    total_students: 0,
    total_teachers: 0,
    active_courses: 0,
    platform_growth: 0
  };

  const systemStats = dashboardData?.system_stats || [
    { label: "Active Sessions", value: 0, change: "0%" },
    { label: "Server Uptime", value: "0%", change: "0%" },
    { label: "Avg Response Time", value: "0ms", change: "0%" },
  ];

  const quickActions = [
    { 
      icon: UserPlus, 
      label: "Add User", 
      description: "Create new student or teacher account",
      action: () => openModal('user')
    },
    { 
      icon: BookOpen, 
      label: "New Course", 
      description: "Set up a new course module",
      action: () => openModal('course')
    },
    { 
      icon: Bell, 
      label: "Send Announcement", 
      description: "Broadcast to all users",
      action: () => openModal('announcement')
    },
    { 
      icon: Settings, 
      label: "System Settings", 
      description: "Configure platform settings",
      action: () => {} // Add navigation or modal
    },
  ];

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard 🛡️</h1>
            <p className="text-muted-foreground">Monitor and manage the entire KDU NACOS CONNECT platform.</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => openModal('announcement')}>
            <Bell className="w-4 h-4 mr-2" />
            Send Announcement
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.total_students}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            delay={0.1}
            variant="glow"
          />
          <StatCard
            title="Total Teachers"
            value={stats.total_teachers}
            icon={Users}
            trend={{ value: 5, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Active Courses"
            value={stats.active_courses}
            icon={BookOpen}
            delay={0.3}
          />
          <StatCard
            title="Platform Growth"
            value={`+${stats.platform_growth}%`}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
            delay={0.4}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(142_76%_45%_/_0.1)] transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_hsl(142_76%_45%_/_0.2)] transition-all duration-300">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:col-span-2 p-6 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Users
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              {recentUsers.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                              {user.full_name?.charAt(0) || user.username?.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{user.full_name || user.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            user.role === "teacher"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatTimeAgo(user.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No recent users</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                System Alerts
              </h2>
            </div>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.type === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : alert.type === "success"
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/50 border-border"
                    }`}
                  >
                    <p className="text-sm text-foreground mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(alert.created_at)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No alerts</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-6 rounded-xl bg-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              System Performance
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {systemStats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-secondary/30">
                <p className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <span className={`text-xs font-medium ${
                  stat.change.startsWith("+") ? "text-primary" :
                  stat.change.startsWith("-") ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add User Modal */}
      {modalType === 'user' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border"
          >
            <div className="sticky top-0 bg-card p-6 border-b border-border flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Create New User</h3>
                <p className="text-sm text-muted-foreground mt-1">Add a new student, teacher, or admin</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-destructive flex-shrink-0" size={20} />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. john_doe"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. john@university.edu"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Password <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="">Select Role...</option>
                    {USER_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Department
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  >
                    <option value="">Select Department...</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Course Modal */}
      {modalType === 'course' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-border"
          >
            <div className="sticky top-0 bg-card p-6 border-b border-border flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Create New Course</h3>
                <p className="text-sm text-muted-foreground mt-1">Fill in the course details below</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-destructive flex-shrink-0" size={20} />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Department <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  >
                    <option value="">Select Department...</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Semester <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  >
                    <option value="">Select Semester...</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Course Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
placeholder="e.g. CSC 301"
value={courseForm.course_code}
onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
/>
</div>
<div>
<label className="block text-sm font-bold text-foreground mb-2">
Credits <span className="text-destructive">*</span>
</label>
<input
type="number"
min="1"
max="6"
className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
value={courseForm.credits}
onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
/>
</div>
</div>
<div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Course Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Data Structures and Algorithms"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
              placeholder="Brief course description..."
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Schedule</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Mon/Wed 10:00 AM"
                value={courseForm.schedule}
                onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Location</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Room 201"
                value={courseForm.location}
                onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )}

  {/* Send Announcement Modal */}
  {modalType === 'announcement' && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-border"
      >
        <div className="sticky top-0 bg-card p-6 border-b border-border flex justify-between items-center rounded-t-3xl z-10">
          <div>
            <h3 className="text-xl font-bold text-foreground">Send Announcement</h3>
            <p className="text-sm text-muted-foreground mt-1">Broadcast message to users</p>
          </div>
          <button 
            onClick={closeModal} 
            className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0" size={20} />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Target Audience <span className="text-destructive">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={announcementForm.target_role}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })}
            >
              <option value="all">All Users</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Important System Update"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
              placeholder="Write your announcement here..."
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendAnnouncement}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Sending...
                </>
              ) : (
                <>
                  <Bell size={18} />
                  Send Announcement
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</DashboardLayout>
);
};
export default AdminDashboard;