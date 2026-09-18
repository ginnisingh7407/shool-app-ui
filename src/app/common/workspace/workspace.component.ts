import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MenuItem, Role } from '../model/models';

@Component({
  selector: 'app-workspace',
  imports: [RouterLink],
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent {
  @Input({ required: true }) role!: Role;
  @Input({ required: true }) menus!: Record<Role, MenuItem[]>;
  @Output() roleChange = new EventEmitter<Role>();

  protected get roles(): Role[] {
    return [this.role];
  }

  protected selectRole(role: Role): void {
    this.roleChange.emit(role);
  }

  protected routeFor(item: MenuItem, role: Role): string[] {
    if (role === 'Teacher' && item.id === 'announcements') return ['/workspace/announcements'];
    if (role === 'Teacher' && item.id === 'events') return ['/workspace/events'];
    if (role === 'Teacher' && item.id === 'exam-result') return ['/workspace/exam-result'];
    if (role === 'Student' && item.id === 'announcements') return ['/student/announcements'];
    if (role === 'Student' && item.id === 'events') return ['/student/events'];
    if (role === 'Student' && item.id === 'result') return ['/student/result'];
    return role === 'Student' ? ['/student', item.id] : ['/workspace', item.id];
  }
}
