import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  NotificationOutlined,
  MessageOutlined,
  TrophyOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  FormOutlined,
  LineChartOutlined,
  HistoryOutlined,
  TeamOutlined,
  BellOutlined,
  ReadOutlined,
  BulbOutlined,
  RocketOutlined,
  VideoCameraFilled
} from "@ant-design/icons";
import { Layout, Menu, theme, Spin } from "antd";
import type { MenuProps } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import AttemptedQuizResults from "./views/quiz/quiz_result";
import QuizSessionContainer from "./views/quiz/quiz_session_container";
import Dashboard from "./views/dashboard/dashboard.tsx";
import ProfileHeader from "./components/profile/profile_header.tsx";
import LoginPage from "./views/auth/login_page.tsx";
import { useAuth } from "./hooks/auth/auth.ts";
import { CourseDashboard } from "./views/my_courses/my_courses.tsx";
import StudentQuizList from "./views/quiz/quiz_list.tsx";
import LearningAnalytics from "./views/perfomance/learning_analyics.tsx";
import { VirtualClasses } from "./views/virtual_classes/virtual_class.tsx";
import { LiveClass } from "./components/virtual_classes/live_class.tsx";
import QuizAttempts from "./views/quiz/quiz_attempts.tsx";


const queryClient = new QueryClient();
const { Content, Footer, Sider } = Layout;


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};


const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [breadcrumbItems, setBreadcrumbItems] = useState(['Student Portal', 'Dashboard']);
  const { loading, student } = useAuth();

  console.log(student);


  const items: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "courses",
      label: "My Courses",
      icon: <BookOutlined />,
    },
    {
      key: "quizzes",
      icon: <BulbOutlined />,
      label: "Quizzes & Tests",
      children: [
        { key: "available", label: "Available Quizzes", icon: <RocketOutlined /> },
        { key: "attempts", label: "My Attempts", icon: <HistoryOutlined /> },
        { key: "progress", label: "Learning Progress", icon: <LineChartOutlined /> },
        { key: "practice", label: "Practice Tests", icon: <FormOutlined /> }
      ]
    },
    {
      key: "performance",
      icon: <TrophyOutlined />,
      label: "Performance",
      children: [
        { key: "grades", label: "Grades & Marks" },
        { key: "analytics", label: "Learning Analytics" },
        { key: "feedback", label: "Instructor Feedback" }
      ]
    },
    {
      key: "resources",
      icon: <ReadOutlined />,
      label: "Meetings",
      children: [
        { key: "virtual_class", label: "Virtual Classrooms", icon: <VideoCameraFilled /> },
        { key: "studygroups", label: "Study Groups", icon: <TeamOutlined /> }
      ]
    },
    {
      key: "communication",
      icon: <MessageOutlined />,
      label: "Communication",
      children: [
        { key: "announcements", label: "Announcements", icon: <NotificationOutlined /> },
        { key: "messages", label: "Messages" },
        { key: "discussions", label: "Discussion Forums" }
      ]
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Notifications"
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile"
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help & Support"
    }
  ];


  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const MainContent: React.FC = () => {
    const navigate = useNavigate();

    const handleQuizStart = (attempt_id: string) => {
      navigate(`/quiz/session/${attempt_id}`, {
        state: { fromQuizList: true }
      });
      setBreadcrumbItems(['Student Portal', 'Quizzes', 'Active Session']);
    };

    const contentMap: Record<string, React.ReactNode> = {
      dashboard: <Dashboard />,
      courses: <CourseDashboard />,
      available: (
        <StudentQuizList
          studentId={student!.student_id!}
          onQuizStart={handleQuizStart}
        />
      ),
      attempts: <QuizAttempts
        studentId={student!.student_id!}
      />,
      progress: <div>Learning Progress Content</div>,
      assignments: <div>Assignments Content</div>,
      timetable: <div>Class Timetable Content</div>,
      exams: <div>Exam Schedule Content</div>,
      deadlines: <div>Assignment Deadlines Content</div>,
      grades: <div>Grades & Marks Content</div>,
      analytics: <LearningAnalytics />,
      feedback: <div>Instructor Feedback Content</div>,
      virtual_class: <VirtualClasses studentId={student!.student_id!} />,
      studygroups: <div>Study Groups Content</div>,
      announcements: <div>Announcements Content</div>,
      messages: <div>Messages Content</div>,
      discussions: <div>Discussion Forums Content</div>,
      attendance: <div>Attendance Content</div>,
      notifications: <div>Notifications Content</div>,
      help: <div>Help & Support Content</div>
    };

    const isQuizSession = location.pathname.includes('/quiz/session/');

    if (isQuizSession) {
      return null;
    }

    return contentMap[selectedTab] || <Spin size="large" />;
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key, keyPath }) => {
    if (window.location.pathname.includes('/quiz/session/')) {
      return; // Prevent navigation during active quiz session
    }

    setSelectedTab(key);

    // Update breadcrumb
    const newBreadcrumb = ["Student Portal"];
    if (keyPath.length > 1) {
      const parentKey = keyPath[1];
      const parentItem = items.find((item) => item?.key === parentKey);
      if (parentItem && "label" in parentItem) {
        newBreadcrumb.push(parentItem.label as string);
      }
    }

    const selectedItem = items.find((item) => item?.key === key);
    if (selectedItem && "label" in selectedItem) {
      newBreadcrumb.push(selectedItem.label as string);
    }

    setBreadcrumbItems(newBreadcrumb);


    // Handle navigation based on the clicked menu item
    // switch (key) {
    //   case 'dashboard':
    //     navigate('/dashboard');
    //     break;
    //   case 'courses':
    //     navigate('/courses');
    //     break;
    //   case 'available':
    //     navigate('/quiz/available');
    //     break;
    //   case 'attempts':
    //     navigate('/quiz/attempts');
    //     break;
    //   case 'results':
    //     navigate('/quiz/results');
    //     break;
    //   default:
    //     // For other menu items, use the key as the path
    //     navigate(`/${key}`);
    // }

  };


  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }


  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout style={{ minHeight: "100vh" }}>
                  <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    style={{
                      overflow: 'auto',
                      height: '100vh',
                      position: 'fixed',
                      left: 0,
                      zIndex: 999
                    }}
                  >
                    <div className="flex justify-center items-center p-4">
                      <img
                        src="/src/assets/logo.jpeg"
                        alt="Student"
                        className="w-20 h-20 rounded-full border-2 border-white"
                      />
                    </div>
                    <div className="text-white text-center py-2 font-semibold">
                      {!collapsed && "Student Portal"}
                    </div>
                    <Menu
                      theme="dark"
                      defaultSelectedKeys={["dashboard"]}
                      mode="inline"
                      items={items}
                      onClick={handleMenuClick}
                      selectedKeys={[selectedTab]}
                    />
                  </Sider>
                  <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                    <ProfileHeader breadcrumbItems={breadcrumbItems} />
                    <Content style={{ margin: "24px 16px 0", overflow: 'initial' }}>
                      <div style={{
                        padding: 24,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: 8,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Routes>
                          <Route path="/dashboard" element={<MainContent />} />
                          <Route path="/courses" element={<CourseDashboard />} />
                          <Route path="/quiz/available" element={<MainContent />} />
                          <Route path="/quiz/attempts" element={<QuizAttempts />} />
                          <Route path="/quiz/results" element={<MainContent />} />
                          <Route path="/quiz/session/:attempt_id" element={<QuizSessionContainer />} />
                          <Route
                            path="/quiz/result/:attempt_id"
                            element={
                              <AttemptedQuizResults
                                onBackToList={() => {
                                  setSelectedTab('available');
                                  setBreadcrumbItems(['Student Portal', 'Quizzes', 'Available Quizzes']);
                                }}
                              />
                            }
                          />
                          {/* Add routes for other menu items */}
                          <Route path="/:tab" element={<MainContent />} />
                          <Route path="/virtual/live/:classId" element={<LiveClass />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </div>
                    </Content>
                    <Footer style={{
                      textAlign: "center",
                      background: colorBgContainer
                    }}>
                      LearnSmart Student Portal ©{new Date().getFullYear()}
                    </Footer>
                  </Layout>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;