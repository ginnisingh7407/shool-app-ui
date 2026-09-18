import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AnnouncementsService } from './announcements.service';
import { Announcement } from '../../common/model/models';

@Component({
  selector: 'app-student-announcements',
  imports: [RouterLink],
  templateUrl: './student-announcements.component.html'
})
export class StudentAnnouncementsComponent {
  private readonly announcementsService = inject(AnnouncementsService);
  protected readonly announcements = signal<Announcement[]>([]);
  protected readonly selectedAnnouncement = signal<Announcement | null>(null);

  constructor() {
    this.loadAnnouncements();
  }

  protected loadAnnouncements(): void {
    this.announcementsService.getAll('', '').subscribe(data => {
      this.announcements.set(data);
      this.selectedAnnouncement.set(data[0] ?? null);
    });
  }

  protected selectAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement.set(announcement);
  }
}
