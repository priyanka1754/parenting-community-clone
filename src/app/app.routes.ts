import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path:'createPost',
    loadComponent: () => import('./post-creation/post-creation.component').then(m => m.PostCreationComponent)
  },
  {
    path: 'feed',
    loadComponent: () => import('./feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'feed-details/:id',
    loadComponent: () => import('./feed-details/feed-details.component').then(m => m.FeedDetailsComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
