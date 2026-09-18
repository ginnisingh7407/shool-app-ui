import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { classSectionApiUrl, classTeacherApiUrl } from '../../core/config/api.config';
import { ClassSectionApiResponse, ClassSectionOption, ClassTeacherApiResponse, ClassTeacherAssignment } from '../../common/model/models';
import { ProfileService } from '../profile/profile.service';

@Injectable({ providedIn: 'root' })
export class ClassSectionService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);

  getAll(): Observable<ClassSectionOption[]> {
    return this.http.get<ClassSectionApiResponse>(classSectionApiUrl('')).pipe(
      map(response => {
        const classSections = new Map<string, ClassSectionOption>();

        response.data.forEach(classSection => {
          const classId = String(classSection.classId);
          const option = classSections.get(classId);
          const section = {
            sectionId: classSection.id,
            sectionName: classSection.sectionName,
            capacity: classSection.capacity
          };

          if (option) {
            option.sections.push(section);
          } else {
            classSections.set(classId, {
              classId,
              sections: [section]
            });
          }
        });
        const sorted = [...classSections.values()].sort((a,b) => Number(a.classId) - Number(b.classId));
        return sorted;
      })
    );
  }

  getClassTeacherAssignments(): Observable<ClassTeacherAssignment[]> {
    return this.http.get<ClassTeacherApiResponse>(classTeacherApiUrl('')).pipe(
      map(response => response.data ?? []),
      catchError(() => of([]))
    );
  }

  getTeacherDefaultClassSection(): Observable<{ classId: string; sectionName: string } | null> {
    return this.profileService.getProfile().pipe(
      switchMap(profile => this.getClassTeacherAssignments().pipe(
        map(assignments => {
          const assignment = assignments.find(item => item.teacherId === profile.id);
          if (!assignment) return null;
          return { classId: String(assignment.classId), sectionName: assignment.sectionName };
        })
      )),
      catchError(() => of(null))
    );
  }

  getAllWithTeacherDefaultSelection(): Observable<{ classOptions: ClassSectionOption[]; defaultSelection: { classId: string; sectionName: string } | null }> {
    return this.getAll().pipe(
      switchMap(classOptions => this.getTeacherDefaultClassSection().pipe(
        map(defaultSelection => ({ classOptions, defaultSelection }))
      ))
    );
  }

  resolveDefaultClassSection(
    options: ClassSectionOption[],
    defaultSelection: { classId: string; sectionName: string } | null
  ): { classId: string; sectionName: string } {
    const fallbackClass = options[0]?.classId ?? '';
    const fallbackSection = options[0]?.sections[0]?.sectionName ?? '';

    if (!defaultSelection) {
      return { classId: fallbackClass, sectionName: fallbackSection };
    }

    const matchedClass = options.find(option => option.classId === defaultSelection.classId);
    if (!matchedClass) {
      return { classId: fallbackClass, sectionName: fallbackSection };
    }

    const matchedSection = matchedClass.sections.find(section => section.sectionName === defaultSelection.sectionName);
    return {
      classId: matchedClass.classId,
      sectionName: matchedSection?.sectionName ?? matchedClass.sections[0]?.sectionName ?? fallbackSection
    };
  }
}
