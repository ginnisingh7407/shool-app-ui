import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { usersApiUrl } from '../../core/config/api.config';
import { ProfileApiResponse, ProfilePayload, ProfileSummary } from '../../common/model/models';


@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  getProfile(): Observable<ProfileSummary> {
    return this.http.get<ProfileApiResponse>(usersApiUrl('/profile')).pipe(
      map(response => {
        var teacherProfile = response.data?.teacher;
        var studentProfile = response.data?.student;
        var adminProfile = response.data?.admin;

        if (teacherProfile) {
          const profile: ProfilePayload = {
            id: teacherProfile.id,
            name: teacherProfile.name,
            username: teacherProfile.username,
            email: teacherProfile.email,
            mobile: teacherProfile.phone,
            phone: teacherProfile.phone,
            role: 'Teacher',
          }
          return this.toProfile(profile);
        }
        else if (studentProfile) {
          const profile: ProfilePayload = {
            id: studentProfile.id,
            name: studentProfile.name,
            username: studentProfile.admissionNumber.toString(),
            email: studentProfile.email,
            mobile: studentProfile.parentPhone,
            phone: studentProfile.parentPhone,
            className: studentProfile.classId?.toString(),
            sectionName: studentProfile.sectionName,
            role: 'Student',
          }
          return this.toProfile(profile);
        } else if (adminProfile) {
          const profile: ProfilePayload = {
            id: 0,
            name: 'Admin User',
            username: 'NA',
            email: 'admin@xxxx.xx',
            mobile: 'Not available',
            phone: 'Not available',
            role: 'Admin',
          }
          return this.toProfile(profile);
        } else {
          throw new Error('Profile data is not available.');
        }
      }),
      catchError(() => of({
        id: 0,
        name: 'Jordan Davis',
        username: 'jordan.davis',
        className: 'Class 8A',
        email: 'jordan.davis@oakridge.edu',
        mobile: 'Not available',
        role: 'Student',
        active: true,
        photoUrl: null
      }))
    );
  }

  private toProfile(profile: ProfilePayload): ProfileSummary {
    return {
      id: profile.id ?? 0,
      name: profile.name ?? 'Not available',
      username: profile.username ?? 'Not available',
      className: profile.className ?? 'Not available',
      sectionName: profile.sectionName ?? 'Not available',
      email: profile.email ?? 'Not available',
      mobile: profile.mobile ?? profile.phone ?? 'Not available',
      role: profile.role ?? 'Not available',
      active: profile.active ?? true,
      photoUrl: profile.photoUrl ?? profile.profilePic ?? profile.profileImage ?? null
    };
  }
}
