import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { schoolsApiUrl } from '../config/api.config';
import { School } from '../../common/model/models';

const DEFAULT_LOGO = '/image/default-logo.svg';
const DEFAULT_WELCOME_BACKGROUND = '/image/school-welcom-background.svg';
const DEFAULT_WELCOME_MESSAGE = 'Welcom to the school management application, Please contact +91-8130579771 to get onBoarded as a school.';
const DEFAULT_SCHOOL: School = {
  schoolName: 'School Management Application',
  schoolCode: 'School Management',
  logo: DEFAULT_LOGO,
  favicon: DEFAULT_LOGO,
  banner: DEFAULT_WELCOME_BACKGROUND,
  id: 0,
};

const DUMMY_SCHOOLS: School[] = [
];


interface SchoolResponse {
  status: string;
  code: number;
  message: string;
  data: School[];
  timestamp: string;
}
@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly http = inject(HttpClient);
  private readonly schools = signal<School[]>(DUMMY_SCHOOLS);

  getSchools(): Observable<School[]> {
    return this.http.get<SchoolResponse>(schoolsApiUrl('/public/all')).pipe(
      map(response => response.data.map(school => this.withBranding(school))),
      tap(schools => this.schools.set(schools)),
      catchError(() => of(DUMMY_SCHOOLS))
    );
  }

  getSchoolByCode(schoolCode: string): Observable<School> {
    return this.http.get<{ data: School }>(schoolsApiUrl(`/public/code/${schoolCode}`)).pipe(
      map(response => this.withBranding(response.data)),
      catchError(() => of(this.withBranding(DEFAULT_SCHOOL)))
    );
  }

  private setSchoolData(code: string): void {
    this.getSchoolByCode(code).subscribe({
      next: school => {
        this.schools.set([...this.schools(), school]);
      },
      error: () => {
        console.error(`Failed to fetch school data for code: ${code}`);
      }
    });
  }

  getBranding(schoolCode: string | null): School {
    if (schoolCode === null) return this.withBranding(DEFAULT_SCHOOL);

    var school = this.schools().find(school => String(school.schoolCode) === String(schoolCode));
    if (!school) {
      this.setSchoolData(schoolCode);
      school = this.schools().find(school => String(school.schoolCode) === String(schoolCode));
    }

    return school ?? this.withBranding({ schoolCode, schoolName: schoolCode });
  }

  private withBranding(school: Partial<School>): School {
    const branding = DUMMY_SCHOOLS.find(candidate => String(candidate.id) === String(school.id)) ?? DEFAULT_SCHOOL;
    return {
      ...branding,
      ...school,
      logo: school.logo?.trim() || branding.logo || DEFAULT_LOGO,
      banner: school.banner?.trim() || branding.banner || DEFAULT_LOGO,
    };
  }
}

export { DEFAULT_LOGO, DEFAULT_WELCOME_BACKGROUND, DEFAULT_WELCOME_MESSAGE };
