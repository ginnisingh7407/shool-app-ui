import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './common/header/header.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  encapsulation: ViewEncapsulation.None
})
export class App {}