import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { AppInitGuard } from './app-init.guard'; // create this file

export const routes: Routes = [
  {
    path: '',
    canActivate: [AppInitGuard], // 🔒 wait until auth check completes
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component').then((m) => m.LoginComponent),
        canActivate: [LoginGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'createPost',
        loadComponent: () =>
          import('./post-creation/post-creation.component').then(
            (m) => m.PostCreationComponent,
          ),
      },
      {
        path: 'feed',
        loadComponent: () =>
          import('./feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        path: 'feed-details/:id',
        loadComponent: () =>
          import('./feed-details/feed-details.component').then(
            (m) => m.FeedDetailsComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./events-feed/events-feed.component').then(
            (m) => m.EventsFeedComponent,
          ),
      },
      {
        path: 'events/:id',
        loadComponent: () =>
          import('./event-details/event-details.component').then(
            (m) => m.EventDetailsComponent,
          ),
      },
      {
        path: 'my-events',
        loadComponent: () =>
          import('./my-events/my-events.component').then(
            (m) => m.MyEventsComponent,
          ),
      },
      {
        path: 'edit-event/:id',
        loadComponent: () =>
          import('./edit-event/edit-event.component').then(
            (m) => m.EditEventComponent,
          ),
      },
      {
        path: 'create-event',
        loadComponent: () =>
          import('./create-event/create-event.component').then(
            (m) => m.CreateEventComponent,
          ),
        // canActivate: [AuthGuard]
      },
      {
        path: 'communities',
        loadComponent: () =>
          import('./communities/community-list.componenet').then(
            (m) => m.CommunityListComponent,
          ),
      },
      {
        path: 'communities/:id',
        loadComponent: () =>
          import('./communities/community-details.component').then(
            (m) => m.CommunityDetailComponent,
          ),
      },
      {
        path: 'create-community',
        loadComponent: () =>
          import('./communities/create-community.component').then(
            (m) => m.CreateCommunityComponent,
          ),
      },
      {
        path: 'communities/:id/edit',
        loadComponent: () =>
          import('./communities/edit-community.component').then(
            (m) => m.EditCommunityComponent,
          ),
      },
      {
        path: 'groups/create',
        loadComponent: () =>
          import('./groups/create-group.component').then(
            (m) => m.CreateGroupComponent,
          ),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./groups/group-detail.component').then(
            (m) => m.GroupDetailComponent,
          ),
      },
      {
        path:'expert-application-form',
        loadComponent: () =>
          import('./expert-applications/expert-application-form.component').then(
            (m) => m.ExpertApplicationFormComponent,
          ),  
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
