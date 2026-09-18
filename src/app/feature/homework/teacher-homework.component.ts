import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeworkService } from './homework.service';
import { ClassSectionService } from '../class-section/class-section.service';
import { PeopleService } from '../people/people.service';
import { ClassSectionOption, HomeworkRecord, Student } from '../../common/model/models';
import { ProfileService } from '../profile/profile.service';
import { toSignal } from '@angular/core/rxjs-interop';

type HomeworkTab = 'new' | 'list';

@Component({
  selector: 'app-teacher-homework',
  imports: [RouterLink],
  templateUrl: './teacher-homework.component.html',
  styleUrl: './teacher-homework.component.css'
})
export class TeacherHomeworkComponent {
  private readonly homeworkService = inject(HomeworkService);
  private readonly classSectionService = inject(ClassSectionService);
  private readonly peopleService = inject(PeopleService);
  protected readonly profileService = inject(ProfileService);

  protected readonly activeTab = signal<HomeworkTab>('new');
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly workType = signal<'CLASSWORK' | 'HOMEWORK'>('HOMEWORK');
  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly isUploading = signal(false);
  protected readonly uploadMessage = signal('');
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly selectedClass = signal('');
  protected readonly selectedSection = signal('');
  protected readonly sectionOptions = computed(() => this.classOptions().find(option => option.classId === this.selectedClass())?.sections ?? []);
  protected readonly students = signal<Student[]>([]);
  protected readonly assignments = signal<HomeworkRecord[]>([]);
  protected readonly groupedAssignments = computed(() => {
    const groups = new Map<string, { homework: HomeworkRecord[]; classwork: HomeworkRecord[] }>();

    this.assignments().forEach(assignment => {
      const date = assignment.dueDate || 'Unknown date';
      const bucket = groups.get(date) ?? { homework: [], classwork: [] };

      if (assignment.workType === 'HOMEWORK') {
        bucket.homework.push(assignment);
      } else {
        bucket.classwork.push(assignment);
      }

      groups.set(date, bucket);
    });

    return Array.from(groups.entries()).map(([date, value]) => ({
      date,
      homework: [...value.homework].sort((a, b) => a.title.localeCompare(b.title)),
      classwork: [...value.classwork].sort((a, b) => a.title.localeCompare(b.title))
    })).sort((a, b) => b.date.localeCompare(a.date));
  });
  protected readonly isLoadingStudents = signal(false);
  protected readonly isLoadingAssignments = signal(false);
  protected readonly profile = toSignal(this.profileService.getProfile());
  protected readonly teacherId = computed(() => this.profile()?.role === 'TEACHER' ? this.profile()?.id ?? null : null);

  constructor() {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.classSectionService.getAll().subscribe({
      next: options => {
        this.classOptions.set(options);
        this.classSectionService.getTeacherDefaultClassSection().subscribe(defaultSelection => {
          if (defaultSelection) {
            this.selectedClass.set(defaultSelection.classId);
            this.selectedSection.set(defaultSelection.sectionName);
          } else {
            const firstClass = options[0];
            this.selectedClass.set(firstClass?.classId ?? '');
            this.selectedSection.set(firstClass?.sections[0]?.sectionName ?? '');
          }
          this.loadStudents();
          this.loadAssignments();
        });
      },
      error: () => {
        this.uploadMessage.set('Unable to load classes and sections.');
      }
    });
  }

  protected onClassChange(event: Event): void {
    const className = (event.target as HTMLSelectElement).value;
    this.selectedClass.set(className);
    const firstSection = this.classOptions().find(option => option.classId === className)?.sections[0]?.sectionName ?? '';
    this.selectedSection.set(firstSection);
    this.loadStudents();
    this.loadAssignments();
  }

  protected onSectionChange(event: Event): void {
    this.selectedSection.set((event.target as HTMLSelectElement).value);
    this.loadStudents();
    this.loadAssignments();
  }

  protected switchTab(tab: HomeworkTab): void {
    this.activeTab.set(tab);
    this.uploadMessage.set('');
    if (tab === 'list') {
      this.loadAssignments();
    }
  }

  protected onTitleChange(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
    this.uploadMessage.set('');
  }

  protected onDescriptionChange(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
    this.uploadMessage.set('');
  }

  protected onWorkTypeChange(event: Event): void {
    this.workType.set((event.target as HTMLSelectElement).value as 'CLASSWORK' | 'HOMEWORK');
    this.uploadMessage.set('');
  }

  protected onFileChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.selectedFiles.set(files);
    this.uploadMessage.set('');
  }

  protected downloadAttachment(file: { fileName: string; downloadUrl?: string }): void {
    if (!file.downloadUrl) {
      return;
    }

    this.homeworkService.downloadFile(file.downloadUrl, file.fileName).subscribe();
  }

  protected uploadWork(): void {
    if (!this.title().trim() || !this.description().trim()) {
      this.uploadMessage.set('Enter a title and description before uploading.');
      return;
    }

    if (!this.selectedClass() || !this.selectedSection()) {
      this.uploadMessage.set('Select a class and section before uploading.');
      return;
    }

    this.isUploading.set(true);
    this.uploadMessage.set('');
    this.homeworkService.uploadWork({
      title: this.title().trim(),
      description: this.description().trim(),
      workType: this.workType(),
      classId: Number(this.selectedClass()),
      sectionName: this.selectedSection(),
      files: this.selectedFiles(),
      teacherId: this.profile()?.id ?? 0,
      dueDate: new Date().toISOString().split('T')[0]
    }).subscribe(response => {
      this.isUploading.set(false);
      this.uploadMessage.set(response.message);
      this.loadAssignments();
    });
  }

  private loadStudents(): void {
    const className = this.selectedClass();
    const section = this.selectedSection();

    if (!className || !section) {
      this.students.set([]);
      return;
    }

    this.isLoadingStudents.set(true);
    this.peopleService.getStudents(className, section).subscribe(res => {
      this.students.set(res.data ?? []);
      this.isLoadingStudents.set(false);
    });
  }

  private loadAssignments(): void {
    const className = this.selectedClass();
    const section = this.selectedSection();

    if (!className || !section) {
      this.assignments.set([]);
      return;
    }

    this.isLoadingAssignments.set(true);
    this.homeworkService.getByClassAndSection(className, section).subscribe(assignments => {
      this.assignments.set(assignments);
      this.isLoadingAssignments.set(false);
    });
  }
}