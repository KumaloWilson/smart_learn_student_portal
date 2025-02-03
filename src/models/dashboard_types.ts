export interface CourseStats {
    totalStudents: number;
    averageGrade: number;
    completionRate: number;
    courseName: string;
    courseCode: string;
}

export interface UpcomingTask {
    id: string;
    title: string;
    dueDate: string;
    type: 'assignment' | 'quiz' | 'meeting' | 'deadline';
    courseCode: string;
    priority: 'high' | 'medium' | 'low';
}

export interface StudentActivity {
    type: string;
    count: number;
    percentage: number;
}

export interface DashboardStats {
    totalStudents: number;
    activeCourses: number;
    pendingAssignments: number;
    upcomingMeetings: number;
    averageAttendance: number;
    averagePerformance: number;
}