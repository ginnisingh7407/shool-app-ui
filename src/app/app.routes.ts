import { Routes } from '@angular/router';

import { DashboardPageComponent } from './feature/dashboard/dashboard-page.component';
import { TeacherAttendanceComponent } from './feature/attendance/teacher-attendance.component';
import { TeacherHomeworkComponent } from './feature/homework/teacher-homework.component';
import { TeacherLeaveComponent } from './feature/leave/teacher-leave.component';
import { TeacherStudentsComponent } from './feature/people/teacher-students.component';
import { StudentAttendanceComponent } from './feature/attendance/student-attendance.component';
import { StudentLeaveComponent } from './feature/leave/student-leave.component';
import { StudentClassmatesComponent } from './feature/people/student-classmates.component';
import { StudentTeachersComponent } from './feature/people/student-teachers.component';
import { StudentHomeworkComponent } from './feature/homework/student-homework.component';
import { TeacherAnnouncementsComponent } from './feature/announcements/teacher-announcements.component';
import { TeacherExamResultsComponent } from './feature/exams/teacher-exam-results.component';
import { TeacherEventsComponent } from './feature/events/teacher-events.component';
import { StudentAnnouncementsComponent } from './feature/announcements/student-announcements.component';
import { StudentEventsComponent } from './feature/events/student-events.component';
import { StudentResultComponent } from './feature/exams/student-result.component';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './feature/auth/login.component';
import { AdminTeachersComponent } from './feature/people/admin-teachers.component';
import { AdminStudentsComponent } from './feature/people/admin-students.component';
import { AdminClassTeacherComponent } from './feature/people/admin-class-teacher.component';
import { AdminFeesComponent } from './feature/fees/admin-fees.component';
import { AdminDataComponent } from './feature/main/admin-data.component';
import { adminGuard } from './core/auth/admin.guard';
import { ProfilePageComponent } from './feature/profile/profile-page.component';
import { NotificationsPageComponent } from './feature/notifications/notifications-page.component';
import { StudentFeeComponent } from './feature/fees/student-fee.component';
import { StudentDatesheetComponent } from './feature/exams/student-datesheet.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', component: DashboardPageComponent, canActivate: [authGuard] },
	{ path: 'workspace/attendance', component: TeacherAttendanceComponent, canActivate: [authGuard] },
	{ path: 'workspace/homework', component: TeacherHomeworkComponent, canActivate: [authGuard] },
	{ path: 'workspace/leave-management', component: TeacherLeaveComponent, canActivate: [authGuard] },
	{ path: 'workspace/student-details', component: TeacherStudentsComponent, canActivate: [authGuard] },
	{ path: 'workspace/announcements', component: TeacherAnnouncementsComponent, canActivate: [authGuard] },
	{ path: 'workspace/events', component: TeacherEventsComponent, canActivate: [authGuard] },
	{ path: 'workspace/exam-result', component: TeacherExamResultsComponent, canActivate: [authGuard] },
	{ path: 'workspace/teachers', component: AdminTeachersComponent, canActivate: [authGuard] },
	{ path: 'workspace/class-teachers', component: AdminClassTeacherComponent, canActivate: [authGuard] },
	{ path: 'workspace/students', component: AdminStudentsComponent, canActivate: [authGuard] },
	{ path: 'workspace/fees', component: AdminFeesComponent, canActivate: [authGuard] },
	{ path: 'workspace/import-data', component: AdminDataComponent, canActivate: [authGuard, adminGuard] },
	{ path: 'student/attendance', component: StudentAttendanceComponent, canActivate: [authGuard] },
	{ path: 'student/announcements', component: StudentAnnouncementsComponent, canActivate: [authGuard] },
	{ path: 'student/events', component: StudentEventsComponent, canActivate: [authGuard] },
	{ path: 'student/result', component: StudentResultComponent, canActivate: [authGuard] },
	{ path: 'student/leave', component: StudentLeaveComponent, canActivate: [authGuard] },
	{ path: 'student/classmates', component: StudentClassmatesComponent, canActivate: [authGuard] },
	{ path: 'student/teacher', component: StudentTeachersComponent, canActivate: [authGuard] },
	{ path: 'student/homework', component: StudentHomeworkComponent, canActivate: [authGuard] },
	{ path: 'student/profile', component: ProfilePageComponent, canActivate: [authGuard] },
	{ path: 'student/fee', component: StudentFeeComponent, canActivate: [authGuard] },
	{ path: 'student/datesheet', component: StudentDatesheetComponent, canActivate: [authGuard] },
	{ path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
	{ path: 'notifications', component: NotificationsPageComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' }
];
