import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeworkService } from './homework.service';

@Component({
  selector: 'app-teacher-homework',
  imports: [RouterLink],
  templateUrl: './teacher-homework.component.html'
})
export class TeacherHomeworkComponent {
  private readonly homeworkService = inject(HomeworkService);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly workType = signal<'CLASSWORK' | 'HOMEWORK'>('HOMEWORK');
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isUploading = signal(false);
  protected readonly uploadMessage = signal('');

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
    this.selectedFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
    this.uploadMessage.set('');
  }

  protected uploadWork(): void {
    if (!this.title().trim() || !this.description().trim()) {
      this.uploadMessage.set('Enter a title and description before uploading.');
      return;
    }

    this.isUploading.set(true);
    this.uploadMessage.set('');
    this.homeworkService.uploadWork(
      this.title().trim(), this.description().trim(), this.workType(), this.selectedFile()
    ).subscribe(response => {
      this.isUploading.set(false);
      this.uploadMessage.set(response.message);
    });
  }
}