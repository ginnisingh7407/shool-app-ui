export type Role = 'Teacher' | 'Student' | 'Admin';

export interface MenuItem {
  id: string;
  label: string;
  detail: string;
  icon: string;
  tone: string;
  roles: Role[];
}

export interface DashboardData {
  menus: Record<Role, MenuItem[]>;
}

export interface ClassSectionApiResponse {
  status: string;
  code: number;
  message: string;
  data: {
    id: number;
    classId: string;
    sectionName: string;
    capacity: number;
    isActive: boolean;
  }[];
  timestamp: string;
};

export interface Section {
  sectionId: number;
  sectionName: string;
  capacity: number;
}

export interface ClassSectionOption {
  classId: string;
  sections: Section[];
}

export interface ClassTeacherAssignment {
  id: number | null;
  classId: number;
  sectionName: string;
  teacherId: number;
}

export interface ClassTeacherApiResponse {
  status: string;
  code: number;
  message: string;
  data: ClassTeacherAssignment[];
  timestamp: string;
}

export interface AttendanceSummary { present: number; absent: number; late: number; }

export interface AttendanceStudent {
  id: number | null;
  name: string;
  rollNumber: string;
  present?: boolean;
  onLeave?: boolean;
  admissionNumber: number;
  classId?: number;
  sectionName?: string;
  attendanceId?: number;
}

export interface AttendanceRecord { date: string; present: boolean; onLeave?: boolean; }
export interface ClassAttendanceDay { date: string; present: number; absent: number; onLeave: number; }

export interface StudentRosterEntry {
  id: number;
  name: string;
  rollNumber: number;
  admissionNumber: number;
  classId: number;
  sectionName: string;
}

export interface AttendanceApiRecord {
  id: number | null;
  admissionNumber: number;
  teacherId: number;
  classId: number;
  sectionName: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | string;
  remarks: string;
}

export interface AttendanceApiResponse { data: AttendanceApiRecord[]; }

export interface AttendanceSubmission {
  id: number | null;
  admissionNumber: number;
  teacherId: number;
  classId: number;
  sectionName: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  onLeave: boolean;
  remarks: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserRegistrationRequest {
  username: string;
  password: string;
  phoneNumber?: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export interface UserRegistrationResponse {
  status: string;
  code: 200,
  message: string;
  data: {
    id: number;
    username: string;
    token: string;
    refreshToken?: string;
    roles: string[];
    active: boolean;
  },
  timestamp: Date;
}
export interface LoginResponse {
  status: string;
  code: number;
  message: string;
  data: {
    id: number;
    username: string;
    token: string;
    refreshToken: string | null;
    roles: string[];
    active: boolean;
  };
  timestamp: string;
}

export interface School {
  id: number;
  schoolName: string;
  schoolCode: string;
  address?: String;
  phone?: String;
  email?: String;
  website?: String;
  principalName?: String;
  announcement?: String;
  logo?: String;
  favicon?: String;
  banner?: String;
}

export interface PeopleSummary { students: number; teachers: number; classmates: number; }

export interface CalendarDay {
  date: string;
  day: number;
  inRange: boolean;
  present: boolean | null;
  onLeave: boolean;
}

export interface CalendarMonth {
  key: string;
  label: string;
  days: (CalendarDay | null)[];
}
export interface AdminTeacher {
  id: number | null;
  name: string;
  gender: string;
  email: string;
  username: string;
  employeeId: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  experienceYears: number;
  address: string;
  phone: string;
  dateOfJoining?: string;
  experience?: number;
}
export interface StudentResponse {
  status: string;
  code: number;
  message: string;
  data: Student[];
}
export interface TeacherResponse {
  status: string;
  code: number;
  message: string;
  data: AdminTeacher[];
}
export interface TeacherDetailResponse {
  status: string;
  code: number;
  message: string;
  data: AdminTeacher;
}
export interface Classmate { id: number; name: string; rollNumber: string; photoUrl: string; }
export interface TeacherContact { id: number; name: string; subject: string; phone: string; email: string; isClassTeacher: boolean; photoUrl: string; }



export interface ProfileSummary {
  id: number;
  name: string;
  username: string;
  className: string;
  email: string;
  mobile: string;
  role: string;
  active: boolean;
  photoUrl: string | null;
}

export interface ProfilePayload {
  id: number | null;
  name?: string;
  username?: string;
  className?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  photoUrl?: string;
  profilePic?: string;
  profileImage?: string;
  role?: string;
  active?: boolean;
}

export interface ProfileApiResponse {
  status: string;
  code: number;
  message: string;
  data: ResponseData;
  timestamp: string; // or Date if you parse it
}

export interface ResponseData {
  student: Student;
  teacher: Teacher;
  admin: boolean;
}

export interface Student {
  id: number | null;
  name: string;
  gender: string;
  email: string;
  admissionNumber: number;
  rollNumber: number;
  classId: number;
  sectionName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: string;
  parentPhone: string;
}


export interface Teacher {
  id: number;
  name: string;
  gender: string;
  email: string;
  username: string;
  employeeId: string;
  qualification: string;
  specialization: string;
  joiningDate: string; // Format: "YYYY-MM-DD"
  experienceYears: number;
  address: string;
  phone: string;
}

export interface ProfileResponse extends ProfilePayload {
  data?: ProfilePayload;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  className: string;
  section: string;
  published: boolean;
}

export interface AnnouncementPayload {
  title: string;
  message: string;
  className: string;
  section: string;
  published: boolean;
}


export interface SchoolEvent {
  id?: number;
  title: string;
  date: string;
  attachments?: string[];
}

export interface EventPayload {
  title: string;
  date: string;
  files: File[];
}


export interface ExamSummary { nextExam: string; subject: string; resultStatus: string; }

export interface ExamResultRow {
  id: number;
  studentName: string;
  rollNumber: string;
  admissionNumber: string;
  subject: string;
  obtainedMark: number;
  totalMarks: number;
  paperFileName?: string;
  paperUrl?: string;
}

export interface ResultFilter { className: string; section: string; academicYear: string; studentName?: string; }
export interface ResultPayload extends ResultFilter { rows: ExamResultRow[]; finalResultFile?: File | null; }
export interface ResultUploadResponse { success: boolean; message: string; }

export interface FeesSummary { outstanding: number; paid: number; dueDate: string; }


export interface HomeworkSummary { pending: number; submitted: number; nextDue: string; }
export interface HomeworkUploadResponse { success: boolean; message: string; }
export interface HomeworkAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  fileData: string[];
}
export interface HomeworkUploadPayload {
  id?: number;
  teacherId: number;
  classId: number;
  sectionName: string;
  subjectId: number;
  title: string;
  description: string;
  fileUrl: string;
  dueDate: string;
  workType: 'CLASSWORK' | 'HOMEWORK';
  files: HomeworkAttachment[];
}
export interface HomeworkFileItem {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  filePath?: string;
  downloadUrl?: string;
}
export interface HomeworkRecord {
  id: number;
  teacherId: number;
  classId: number;
  sectionName: string;
  subjectId: number;
  title: string;
  description: string;
  fileUrl: string;
  dueDate: string;
  workType: 'CLASSWORK' | 'HOMEWORK';
  files: HomeworkFileItem[];
}
export interface HomeworkApiResponse {
  status: string;
  code: number;
  message: string;
  data: HomeworkRecord[];
  timestamp: string;
}
export interface Homework {
  id?: number | null;
  teacherId: number;
  classId: number;
  sectionName?: string;
  subjectId?: number;
  title: string;
  description: string;
  fileUrl?: string;
  dueDate: string;
  files: File[] | null;
   // ISO date format (yyyy-MM-dd)
  workType: "CLASSWORK" | "HOMEWORK"; // extend with other types if needed
}
export interface StudentWorkItem { id: number; type: 'CLASSWORK' | 'HOMEWORK'; date: string; title: string; description: string; fileName: string; fileUrl: string; }

export interface LeaveSummary { pending: number; approved: number; remaining: number; }
export interface LeaveStudent { id: number; name: string; className: string; section: string; }
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface LeaveApplication {
  id?: number;
  admissionNumber: number;
  reason: string;
  fromDate: string; // ISO date format (YYYY-MM-DD)
  toDate: string;   // ISO date format (YYYY-MM-DD)
  totalDays?: number;
  status: "PENDING" | "APPROVED" | "REJECTED"; // example enum values
  approvedBy?: string;
  approvalDate?: string; // ISO date-time format
  remarks?: string;
  leaveType: string; // e.g., "Sick Leave", "Casual Leave", etc.
}


export interface StudentLeaveApplication extends LeaveApplication { }

export interface NotificationSummary { unread: number; latest: string; }