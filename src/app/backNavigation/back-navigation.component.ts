import { Location } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-back-header',
  standalone: true,
  template:`<div
  class="flex items-center bg-[#F4F4F4] p-3 border-b fixed top-0 left-0 w-full z-50"
>
  <!-- Back Button -->
  @if (!isSearch) {
  <button
    (click)="goBack()"
    class="flex items-center justify-center w-10 h-10 bg-[#E1E1E1] rounded-full text-[#6B6B6B] text-xl"
  >
    <i class="fas fa-arrow-left"></i>
  </button>
  } @else {
  <button
    (click)="goBack()"
    class="flex items-center justify-center w-10 h-10 bg-[#E1E1E1] rounded-full text-[#6B6B6B] text-xl"
  >
    <i class="fa-solid fa-times text-xl"></i>
  </button>
  }

  <!-- Header Title (Centered) -->
  <span
    class="text-lg font-semibold text-[#6B6B6B] flex-grow text-left truncate px-3"
  >
    {{ title }}
  </span>

  <!-- Right Icons -->
  <div class="flex items-center gap-2">
    @if (!isSearch) {
    <button
      (click)="onSearchClick()"
      class="flex items-center justify-center w-10 h-10 bg-[#E1E1E1] rounded-full text-[#6B6B6B] text-xl"
    >
      <i class="fas fa-search"></i>
    </button>
    }
    <button
      (click)="goHome()"
      class="flex items-center justify-center w-10 h-10 bg-[#E1E1E1] rounded-full text-[#6B6B6B] text-xl"
    >
      <i class="fas fa-home"></i>
    </button>
  </div>
</div>
`
})
export class BackHeaderComponent {

  @Input()
  public title = '';

  public isSearch = false;

  constructor(private location: Location, private router: Router) {
    this.isSearch = this.router.url === '/search' || this.router.url === '/login' || this.router.url === '/signup' || this.router.url === '/seller';
  }

  goBack() {
    this.location.back();
  }

  onSearchClick() {
    this.router.navigate(['search']);
  }

  goHome() {
    console.log('Navigating to home', sessionStorage.getItem('popupShown'));
    this.router.navigate(['home']);
  }

}
