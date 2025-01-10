import React, { useState } from "react";
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
import { Layout, Menu, Breadcrumb, theme } from "antd";
import type { MenuProps } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
const { Header, Content, Footer, Sider } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

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
      label: "My Profile"
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

  const [selectedTab, setSelectedTab] = useState("dashboard");

  const contentMap: Record<string, React.ReactNode> = {
    // dashboard: <StudentDashboard />,
    // enrolled: <EnrolledCourses />,
    // available: <AvailableQuizzes />,
    // attempts: <QuizAttempts />,
    // results: <QuizResults />,
    // progress: <LearningProgress />,
    // practice: <PracticeTests />,
    // // Add other components as needed
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="flex justify-center items-center p-4">
            <img
              src="../src/assets/logo.jpeg"
              alt="Student"
              className="w-16 h-16 rounded-full border-2 border-white"
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
            onClick={({ key }) => setSelectedTab(key)}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Breadcrumb style={{ margin: "16px" }}>
              <Breadcrumb.Item>Student Portal</Breadcrumb.Item>
              <Breadcrumb.Item>
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content style={{ margin: "16px" }}>
            <div style={{ padding: 24, background: colorBgContainer }}>
              {contentMap[selectedTab]}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            LearnSmart Student Portal ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </QueryClientProvider>
  );
};

export default App;