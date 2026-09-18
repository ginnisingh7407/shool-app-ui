import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { AuthSessionService } from './core/auth/auth-session.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the teacher workspace by default', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(AuthSessionService).setSession('test-token', 'Teacher');
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Make today');
    expect(compiled.textContent).toContain('Attendance');
    expect(compiled.textContent).toContain('Student details');
  });
});
