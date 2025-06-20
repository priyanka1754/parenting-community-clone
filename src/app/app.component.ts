import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'parents';
  constructor(public authService: AuthService) {}

  ngOnInit() {
    // this.authService.authLoading$.subscribe((loading) => {
    //   console.log('🟡 authLoading:', loading);
    // });
    console.log('AppComponent constructor');

    // this.authService.ensureAuthOnStartup();
  }
}
