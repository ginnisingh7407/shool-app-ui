export const REST_API_BASE_URL = '/rest';
export const API_V1_BASE_URL = '/api/v1';

export const USER_SERVICE_API_BASE_URL = REST_API_BASE_URL + '/user-service' + API_V1_BASE_URL;
export const ACADEMIC_SERVICE_BASE_URL = REST_API_BASE_URL + '/academic-service' + API_V1_BASE_URL;
export const UTILITY_SERVICE_API_URL =  REST_API_BASE_URL+ '/utility-service' + API_V1_BASE_URL
export const COMMUNICATION_SERVICE_API_BASE_URL = REST_API_BASE_URL + '/communication-service' + API_V1_BASE_URL;
export const PAYMENT_SERVICE_API_BASE_URL = REST_API_BASE_URL + '/payment-service' + API_V1_BASE_URL;
export const NOTIFICATION_SERVICE_API_BASE_URL = REST_API_BASE_URL + '/notification-service' + API_V1_BASE_URL;

// user_service api end points
export const LOGIN_URL = USER_SERVICE_API_BASE_URL + '/auth/login';
export const CLASS_TEACHER_BASE_URL = USER_SERVICE_API_BASE_URL + '/class-teachers';
export const CLASSES_BASE_URL = USER_SERVICE_API_BASE_URL + '/classes';
export const CLASS_SECTION_BASE_URL = USER_SERVICE_API_BASE_URL + '/sections';
export const IMPORT_EXPORT_BASE_URL = USER_SERVICE_API_BASE_URL + '/bulk';
export const SCHOOLS_BASE_URL = USER_SERVICE_API_BASE_URL + '/schools';
export const SECTIONS_BASE_URL = USER_SERVICE_API_BASE_URL + '/sections';
export const TEACHERS_BASE_URL = USER_SERVICE_API_BASE_URL + '/teachers';
export const STUDENTS_BASE_URL = USER_SERVICE_API_BASE_URL + '/students';
export const USERS_MNGT_BASE_URL = USER_SERVICE_API_BASE_URL + '/users';

// academic_service api endpoints
export const ATTENDANCE_BASE_URL = ACADEMIC_SERVICE_BASE_URL + '/attendance';
export const HOMEWORK_BASE_URL = ACADEMIC_SERVICE_BASE_URL + '/homework';

export const ANNOUNCEMENTS_BASE_BASE_URL = COMMUNICATION_SERVICE_API_BASE_URL+'/announcements'
export const EVENT_BASE_BASE_URL = COMMUNICATION_SERVICE_API_BASE_URL+'/events'
export const LEAVE_BASE_BASE_URL = COMMUNICATION_SERVICE_API_BASE_URL+'/leave-applications'


export const FILES_BASE_URL = UTILITY_SERVICE_API_URL+'/files'
export const REPORT_BASE_URL = UTILITY_SERVICE_API_URL+'/reports'

export const apiUrl = (path: string): string => `${USER_SERVICE_API_BASE_URL}${path}`;
export const loginApiUrl = (path: string): string => `${LOGIN_URL}${path}`;
export const usersApiUrl = (path: string): string => `${USERS_MNGT_BASE_URL}${path}`;
export const studentsApiUrl = (path: string): string => `${STUDENTS_BASE_URL}${path}`;
export const teachersApiUrl = (path: string): string => `${TEACHERS_BASE_URL}${path}`;
export const schoolsApiUrl = (path: string): string => `${SCHOOLS_BASE_URL}${path}`;
export const sectionApiUrl = (path: string): string => `${SECTIONS_BASE_URL}${path}`;
export const bulkApiUrl = (path: string): string => `${IMPORT_EXPORT_BASE_URL}${path}`;
export const classesApiUrl = (path: string): string => `${CLASSES_BASE_URL}${path}`;
export const classSectionApiUrl = (path: string): string => `${CLASS_SECTION_BASE_URL}${path}`;
export const classTeacherApiUrl = (path: string): string => `${CLASS_TEACHER_BASE_URL}${path}`;

export const academicApiUrl = (path: string): string => `${ACADEMIC_SERVICE_BASE_URL}${path}`;
export const attendanceApiUrl = (path: string): string => `${ATTENDANCE_BASE_URL}${path}`;
export const homeworkApiUrl = (path: string): string => `${HOMEWORK_BASE_URL}${path}`;

export const communicationApiUrl = (path: string): string => `${COMMUNICATION_SERVICE_API_BASE_URL}${path}`;
export const announcementApiUrl = (path: string): string => `${ANNOUNCEMENTS_BASE_BASE_URL}${path}`;
export const eventApiUrl = (path: string): string => `${EVENT_BASE_BASE_URL}${path}`;
export const leaveApiUrl = (path: string): string => `${LEAVE_BASE_BASE_URL}${path}`;

export const utilityApiUrl = (path: string): string => `${UTILITY_SERVICE_API_URL}${path}`;
export const filesApiUrl = (path: string): string => `${FILES_BASE_URL}${path}`;
export const reportApiUrl = (path: string): string => `${REPORT_BASE_URL}${path}`;

export const paymentServiceApiUrl = (path: string): string => `${PAYMENT_SERVICE_API_BASE_URL}${path}`;
export const notificationApiUrl = (path: string): string => `${NOTIFICATION_SERVICE_API_BASE_URL}${path}`;
