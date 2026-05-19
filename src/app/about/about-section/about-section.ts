import { Component, input, output } from '@angular/core';
import { AboutContent } from '../about-content/about-content';

@Component({
  selector: 'app-about-section',
  imports: [AboutContent],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  readonly open = input.required<boolean>();

  readonly closed = output<void>();
  readonly toggled = output<void>();
}
