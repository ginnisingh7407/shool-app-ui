import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventsService } from './events.service';
import { SchoolEvent } from '../../common/model/models';

@Component({
  selector: 'app-student-events',
  imports: [RouterLink],
  templateUrl: './student-events.component.html'
})
export class StudentEventsComponent {
  private readonly eventsService = inject(EventsService);
  protected readonly events = signal<SchoolEvent[]>([]);

  constructor() {
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.eventsService.getAll().subscribe(data => this.events.set(data));
  }

  protected mediaType(fileName: string): 'image' | 'video' | 'file' {
    const lower = fileName.toLowerCase();
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lower)) return 'image';
    if (/\.(mp4|webm|mov|avi|m4v)$/.test(lower)) return 'video';
    return 'file';
  }

  protected previewUrl(fileName: string): string {
    const type = this.mediaType(fileName);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stop-color="#dff3ef"/>
            <stop offset="100%" stop-color="#dfe7ff"/>
          </linearGradient>
        </defs>
        <rect width="640" height="420" rx="24" fill="url(#g)"/>
        <circle cx="120" cy="120" r="60" fill="#7fc7bc" opacity="0.75"/>
        <rect x="75" y="210" width="490" height="110" rx="18" fill="#ffffff" opacity="0.8"/>
        <text x="320" y="195" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="700" fill="#17383b">${type === 'video' ? 'Video' : type === 'image' ? 'Image' : 'File'}</text>
        <text x="320" y="278" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="#3d5e5c">${fileName}</text>
        ${type === 'video' ? '<path d="M260 150 L420 210 L260 270 Z" fill="#2e8581" opacity="0.9"/>' : ''}
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}
