import { DashboardData } from "./models";

export const FALLBACK_DASHBOARD_DATA: DashboardData = {
  menus: {
    Teacher: [
      { id: 'student-details', label: 'Student details', detail: 'View your class directory', icon: 'users', tone: 'orange', roles: ['Teacher'] },
      { id: 'attendance', label: 'Attendance', detail: 'Mark and review attendance', icon: 'calendar', tone: 'teal', roles: ['Teacher'] },
      { id: 'homework', label: 'Homework & classwork', detail: 'Share work with your class', icon: 'book', tone: 'gold', roles: ['Teacher', 'Student'] },
      { id: 'leave-management', label: 'Leave management', detail: 'Request and track leave', icon: 'leave', tone: 'coral', roles: ['Teacher'] },
      { id: 'announcements', label: 'Announcements', detail: 'Keep families informed', icon: 'announce', tone: 'blue', roles: ['Teacher', 'Student'] },
      { id: 'events', label: 'Events', detail: 'Share school event notices', icon: 'event', tone: 'violet', roles: ['Teacher'] },
      { id: 'exam-result', label: 'Exam result', detail: 'Publish student results', icon: 'result', tone: 'violet', roles: ['Teacher'] }
    ],
    Student: [
      { id: 'profile', label: 'My profile', detail: 'Your school identity', icon: 'profile', tone: 'teal', roles: ['Student'] },
      { id: 'attendance', label: 'My attendance', detail: 'See your attendance record', icon: 'calendar', tone: 'coral', roles: ['Student'] },
      { id: 'homework', label: 'Homework & classwork', detail: 'Your assigned work', icon: 'book', tone: 'teal', roles: ['Student', 'Teacher'] },
      { id: 'leave', label: 'Leave', detail: 'Apply for a day off', icon: 'leave', tone: 'gold', roles: ['Student'] },
      { id: 'fee', label: 'Fee', detail: 'View payment information', icon: 'fee', tone: 'orange', roles: ['Student'] },
      { id: 'classmates', label: 'My classmate', detail: 'Meet your class', icon: 'users', tone: 'coral', roles: ['Student'] },
      { id: 'teacher', label: 'My teacher', detail: 'Your teaching team', icon: 'teacher', tone: 'gold', roles: ['Student'] },
      { id: 'result', label: 'My result', detail: 'Your academic progress', icon: 'result', tone: 'blue', roles: ['Student'] },
      { id: 'datesheet', label: 'Exam datesheet', detail: 'Plan your exam days', icon: 'datesheet', tone: 'violet', roles: ['Student'] },
      { id: 'announcements', label: 'Announcements', detail: 'Latest school updates', icon: 'announce', tone: 'blue', roles: ['Student', 'Teacher'] },
      { id: 'events', label: 'Events', detail: 'What is happening next', icon: 'event', tone: 'violet', roles: ['Student'] }
    ],
    Admin: [
      { id: 'teachers', label: 'Manage teachers', detail: 'View and manage faculty', icon: 'teacher', tone: 'teal', roles: ['Admin'] },
      { id: 'class-teachers', label: 'Class teacher mapping', detail: 'Assign a teacher to a class and section', icon: 'teacher', tone: 'blue', roles: ['Admin'] },
      { id: 'students', label: 'Manage students', detail: 'Keep student records current', icon: 'users', tone: 'coral', roles: ['Admin'] },
      { id: 'fees', label: 'Fee management', detail: 'Track fees and payments', icon: 'fee', tone: 'gold', roles: ['Admin'] },
      { id: 'import-data', label: 'Import/Export Data', detail: 'Teachers, students, classes & sections', icon: 'import', tone: 'orange', roles: ['Admin'] },
      { id: 'announcements', label: 'Announcements', detail: 'Keep families informed', icon: 'announce', tone: 'blue', roles: ['Admin'] },
      { id: 'events', label: 'Events', detail: 'Share school event notices', icon: 'event', tone: 'violet', roles: ['Admin'] }
    ]
  }
};
