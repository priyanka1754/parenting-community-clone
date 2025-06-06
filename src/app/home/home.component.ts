import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
// import { FeedComponent } from "../feed/feed.component";
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FeedComponent } from "../feed/feed.component";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [HeaderComponent, BottomNavComponent, RouterModule, FeedComponent]
})
export class HomeComponent {
  constructor(
      private router: Router
    ) {}
  navigateToCreatePost() {
    this.router.navigate(['/createPost']);
  }
  // Add any properties or methods for the home page here
}
