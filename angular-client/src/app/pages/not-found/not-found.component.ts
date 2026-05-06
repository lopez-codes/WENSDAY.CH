import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/layout/header.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, HeaderComponent],
  template: `
    <app-header></app-header>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem">
      <div style="font-size:5rem;margin-bottom:1.5rem">404</div>
      <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:0.75rem">Seite nicht gefunden</h1>
      <p style="color:var(--swiss-gray);margin-bottom:2rem">Diese Seite existiert nicht.</p>
      <a routerLink="/" class="btn btn-primary">Zur Startseite</a>
    </div>
  `
})
export class NotFoundComponent {}
