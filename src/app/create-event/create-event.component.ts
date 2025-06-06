import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" *ngIf="isOpen">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create Event</h3>
          <form [formGroup]="eventForm" (ngSubmit)="createEvent()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <input type="text" formControlName="title" 
                     class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea formControlName="description" rows="3"
                        class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" formControlName="date" 
                     class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input type="time" formControlName="time" 
                     class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" formControlName="location" 
                     class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" (click)="close()" 
                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                Cancel
              </button>
              <button type="submit" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-md">
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CreateEventComponent {
  @Input() isOpen = false;
  @Output() eventCreated = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  eventForm: FormGroup;

  constructor(private fb: FormBuilder, private eventService: EventService) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  createEvent() {
    if (this.eventForm.valid) {
      this.eventService.createEvent(this.eventForm.value).subscribe(event => {
        this.eventCreated.emit(event);
        this.close();
      });
    }
  }

  close() {
    this.modalClosed.emit();
  }
}