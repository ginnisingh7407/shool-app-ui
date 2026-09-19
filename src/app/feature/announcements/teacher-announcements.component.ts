import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AnnouncementsService } from './announcements.service';
import { ClassSectionService } from '../class-section/class-section.service';
import { Announcement, ClassSectionOption } from '../../common/model/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-announcements',
  imports: [RouterLink, FormsModule],
  templateUrl: './teacher-announcements.component.html'
})
export class TeacherAnnouncementsComponent {
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly classSectionService = inject(ClassSectionService);
  protected readonly announcements = signal<Announcement[]>([]);
  protected readonly activeTab = signal<'new' | 'published'>('new');
  protected readonly editingId = signal<number | null>(null);
  protected readonly classOptions = signal<ClassSectionOption[]>([]);
  protected readonly title = signal('');
  protected readonly message = signal('');
  protected readonly className = signal(this.classOptions().length > 0 ? this.classOptions()[0].classId : '');
  protected readonly section = signal('All');
  protected readonly published = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly sectionOptions = computed(() => this.classOptions().find(x => x.classId === this.className())?.sections ?? []);

  constructor() {
    this.loadClasses();
  }

  protected loadClasses(): void {
    this.classSectionService.getAllWithTeacherDefaultSelection().subscribe({
      next: ({ classOptions, defaultSelection }) => {
        this.classOptions.set(classOptions);
        const resolved = this.classSectionService.resolveDefaultClassSection(classOptions, defaultSelection);
        this.className.set(resolved.classId);
        this.section.set(defaultSelection ? resolved.sectionName : 'All');
        this.loadAnnouncements();
      },
      error: () => {
        this.statusMessage.set('Unable to load classes and sections.');
      }
    });
  }
  protected loadAnnouncements(): void {
    this.announcementsService.getAll(this.className(), this.section()).subscribe(data => this.announcements.set(data));
  }

  protected onTextChange(event: Event, field: 'title' | 'message'): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    field === 'title' ? this.title.set(value) : this.message.set(value);
    this.statusMessage.set('');
  }

  protected onSelectChange(event: Event, field: 'className' | 'section'): void {
    const value = (event.target as HTMLSelectElement).value;
    if (field === 'className') {
      this.className.set(value);
      this.section.set('All');
    } else {
      this.section.set(value);
    }
    this.statusMessage.set('');
    if (!this.editingId()) this.loadAnnouncements();
  }

  protected setPublished(event: Event): void { this.published.set((event.target as HTMLInputElement).checked); }

  protected edit(announcement: Announcement): void {
    this.editingId.set(announcement.id); 
    this.title.set(announcement.title); 
    this.message.set(announcement.content);
    this.className.set(announcement.classId.toString()); 
    this.section.set(announcement.sectionName); 
    this.published.set(announcement.active);
    this.statusMessage.set('');
    this.activeTab.set('new');
  }

  protected cancelEdit(): void { this.editingId.set(null); this.title.set(''); this.message.set(''); this.statusMessage.set(''); }

  protected save(): void {
    if (!this.title().trim() || !this.message().trim()) {
      this.statusMessage.set('Enter a title and message before saving.'); return;
    }
    const payload: Announcement = {
      id: this.editingId() ?? null,
      title: this.title().trim(),
      content: this.message().trim(),
      classId: parseInt(this.className()),
      sectionName: this.section().at(0) === 'All' ? '' : this.section(),
      postedDate: new Date().toISOString(),
      expiresDate: '',
      active: this.published(),
      createdBy: 0,
      fileUrl: ''
    };
    this.isSaving.set(true);

    const request = this.editingId() === null ?
      this.announcementsService.create(payload)
      : this.announcementsService.update(this.editingId()!, payload);
    request.subscribe(saved => {
      const wasEditing = this.editingId() !== null;
      this.isSaving.set(false);
      this.announcements.update(items => wasEditing ? items.map(item => item.id === saved.id ? saved : item) : [saved, ...items]);
      this.editingId.set(null); this.title.set(''); this.message.set('');
      this.statusMessage.set(wasEditing ? 'Announcement updated successfully.' : 'Announcement added successfully.');
    });
  }

  protected switchTab(tab: 'new' | 'published'): void {
    this.activeTab.set(tab);
    this.statusMessage.set('');
  }
}
