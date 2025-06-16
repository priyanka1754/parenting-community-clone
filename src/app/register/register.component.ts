// register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../auth.service';
import { Child } from '../models';
import { PostService } from '../post-creation/postCreation.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule],
  standalone: true,
  templateUrl: './register.component.html',
  providers: []
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showSuccessModal = false;
  errorMessage = '';
  avatarPreview: string = '';
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private postService: PostService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatar: [''],
      bio: [''],
      role: ['parent'],
      location: [''],
      children: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  get children(): FormArray {
    return this.registerForm.get('children') as FormArray;
  }

  get childrenFormGroups(): FormGroup[] {
    return (this.registerForm.get('children') as FormArray).controls as FormGroup[];
  }

  addChild(): void {
    const childForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      interests: [[]]
    });
    this.children.push(childForm);
  }

  removeChild(index: number): void {
    this.children.removeAt(index);
  }

  addInterest(childIndex: number, interest: string): void {
    if (interest.trim()) {
      const childControl = this.children.at(childIndex);
      const interests = childControl.get('interests')?.value || [];
      if (!interests.includes(interest.trim())) {
        interests.push(interest.trim());
        childControl.get('interests')?.setValue(interests);
      }
    }
  }

  removeInterest(childIndex: number, interestIndex: number): void {
    const childControl = this.children.at(childIndex);
    const interests = childControl.get('interests')?.value || [];
    interests.splice(interestIndex, 1);
    childControl.get('interests')?.setValue(interests);
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData: RegisterRequest = this.registerForm.value;
      
      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccessModal = true;
          
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            this.showSuccessModal = false;
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    this.children.controls.forEach(child => {
      const childGroup = child as FormGroup;
      Object.keys(childGroup.controls).forEach(field => {
        const control = childGroup.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  getChildFieldError(childIndex: number, fieldName: string): string {
    const field = this.children.at(childIndex).get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `Age must be 0 or greater`;
    }
    return '';
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.postService.uploadAvatar(file).subscribe({
        next: (res) => {
          this.registerForm.get('avatar')?.setValue(res.url);
          this.avatarPreview = res.url;
        },
        error: () => {
          this.errorMessage = 'Failed to upload avatar. Please try again.';
        }
      });
    }
  }

  getAvatarPreviewUrl(): string {
    if (this.avatarPreview) {
      if (this.avatarPreview.startsWith('/uploads/avatar')) {
        return `http://localhost:3000${this.avatarPreview}`;
      }
      if (this.avatarPreview.startsWith('uploads/avatar')) {
        return `http://localhost:3000/${this.avatarPreview}`;
      }
      if (this.avatarPreview.startsWith('http')) {
        return this.avatarPreview;
      }
    }
    return '';
  }
}