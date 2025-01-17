import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
  NotificationOutlined,
  MessageOutlined,
  TrophyOutlined,
  UserOutlined,
  FileProtectOutlined,
  QuestionCircleOutlined,
  BookFilled,
  ClockCircleOutlined,
  FormOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  HistoryOutlined,
  TeamOutlined,
  BellOutlined,
  ReadOutlined,
  ContainerOutlined,
  BulbOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { Layout, Menu, Breadcrumb, theme, Spin } from "antd";
import type { MenuProps } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import { QuizList } from "./views/quiz/quiz_list";
import AttemptedQuizResults from "./views/quiz/quiz_result";
import QuizSessionContainer from "./views/quiz/quiz_session_container";

const queryClient = new QueryClient();
const { Header, Content, Footer, Sider } = Layout;

const STUDENT_ID = "student-123";


const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [breadcrumbItems, setBreadcrumbItems] = useState(['Student Portal', 'Dashboard']);

  const items: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "My Courses",
      children: [
        { key: "enrolled", label: "Enrolled Courses", icon: <BookFilled /> },
        { key: "materials", label: "Course Materials", icon: <ContainerOutlined /> },
        { key: "assignments", label: "Assignments", icon: <FormOutlined /> }
      ]
    },
    {
      key: "quizzes",
      icon: <BulbOutlined />,
      label: "Quizzes & Tests",
      children: [
        { key: "available", label: "Available Quizzes", icon: <RocketOutlined /> },
        { key: "attempts", label: "My Attempts", icon: <HistoryOutlined /> },
        { key: "results", label: "Quiz Results", icon: <CheckCircleOutlined /> },
        { key: "progress", label: "Learning Progress", icon: <LineChartOutlined /> },
        { key: "practice", label: "Practice Tests", icon: <FormOutlined /> }
      ]
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: "Schedule",
      children: [
        { key: "timetable", label: "Class Timetable" },
        { key: "exams", label: "Exam Schedule", icon: <FileProtectOutlined /> },
        { key: "deadlines", label: "Assignment Deadlines" }
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
      label: "Resources",
      children: [
        { key: "library", label: "Digital Library" },
        { key: "pastpapers", label: "Past Papers" },
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
      key: "attendance",
      icon: <ClockCircleOutlined />,
      label: "Attendance"
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
      dashboard: <div>Dashboard Content</div>,
      profile: <div>Profile Content</div>,
      available: (
        <QuizList
          studentId={STUDENT_ID}
          onQuizStart={handleQuizStart}
        />
      ),
      attempts: <QuizList filterType="attempts" studentId={STUDENT_ID} />,
      results: <QuizList filterType="completed" studentId={STUDENT_ID} />,
      progress: <div>Learning Progress Content</div>,
      practice: <div>Practice Tests Content</div>,
      enrolled: <div>Enrolled Courses Content</div>,
      materials: <div>Course Materials Content</div>,
      assignments: <div>Assignments Content</div>,
      timetable: <div>Class Timetable Content</div>,
      exams: <div>Exam Schedule Content</div>,
      deadlines: <div>Assignment Deadlines Content</div>,
      grades: <div>Grades & Marks Content</div>,
      analytics: <div>Learning Analytics Content</div>,
      feedback: <div>Instructor Feedback Content</div>,
      library: <div>Digital Library Content</div>,
      pastpapers: <div>Past Papers Content</div>,
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

  const handleMenuClick: MenuProps['onClick'] = ({ key, keyPath }) => {
    const location = window.location.pathname;

    // If we're in a quiz session, don't allow menu navigation unless explicitly handling it
    if (location.includes('/quiz/session/')) {
      return;
    }

    setSelectedTab(key);

    // Update breadcrumb based on menu selection
    const newBreadcrumb = ['Student Portal'];

    // Handle parent menu items
    if (keyPath.length > 1) {
      const parentKey = keyPath[1];
      const parentItem = items.find(item => item?.key === parentKey);
      if (parentItem && 'label' in parentItem) {
        newBreadcrumb.push(parentItem.label as string);
      }
    }

    // Add current selection to breadcrumb
    const selectedItem = items.find(item => item?.key === key);
    if (selectedItem && 'label' in selectedItem) {
      newBreadcrumb.push(selectedItem.label as string);
    } else {
      newBreadcrumb.push(key.charAt(0).toUpperCase() + key.slice(1));
    }

    setBreadcrumbItems(newBreadcrumb);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
            <Header style={{
              padding: 0,
              background: colorBgContainer,
              position: 'sticky',
              top: 0,
              zIndex: 1,
              width: '100%'
            }}>
              <Breadcrumb style={{ margin: "16px 24px" }}>
                {breadcrumbItems.map((item) => (
                  <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </Header>
            <Content style={{ margin: "24px 16px 0", overflow: 'initial' }}>
              <div style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: 8,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                <Routes>
                  <Route
                    path="/quiz/session/:attempt_id"
                    element={
                      <QuizSessionContainer />
                    }
                  />

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

                  <Route path="/" element={<MainContent />} />
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
      </Router>
    </QueryClientProvider>
  );
};

export default App;