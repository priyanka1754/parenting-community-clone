export interface User {
  id: string; // MongoDB _id (use this everywhere for backend API calls)
  userId: string; // Custom userId (legacy, do not use for backend calls)
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  children?: Child[];
  joinedGroups?: any[];
  followers?: any[];
  following?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Add to models.ts
export interface Comment {
  _id: string;
  comment: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
}

export interface Child {
  name: string;
  age: number;
  interests: string[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
  images?: string[];
  likes?: string[];
  comments?: Comment[];
  category?: string;
  mediaType?: string;
  mediaUrl?: string;
  mediaSize?: number;
  postType?: string;
  postId?:string;
}

export interface PostData {
  authorId: string;
  content: string;
  category: string;
  mediaType: string;
  mediaUrl: string;
  mediaSize: number;
  postType: string;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  postId: string;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  message: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  time: string; // e.g. '14:00'
  coverImageUrl?: string;
  eventType: 'Online' | 'Offline';
  location?: string;
  meetingLink?: string;
  category: string;
  maxAttendees?: number;
  visibility: 'Public' | 'Private' | 'Group-only';
  host: User;
  attendees: RSVP[];
  createdAt: string;
  updatedAt: string;
  isCancelled?: boolean;
  rsvpCount?: number;
  comments?: EventComment[];
  duration: number;
}

export interface EventData {
  title: string;
  description: string;
  date: string;
  time: string;
  coverImageUrl?: string;
  eventType: 'Online' | 'Offline';
  location?: string;
  meetingLink?: string;
  category: string;
  maxAttendees?: number;
  visibility: 'Public' | 'Private' | 'Group-only';
}

export interface RSVP {
  userId: string;
  status: 'Going' | 'Interested' | 'Not Going';
  respondedAt: string;
}

export interface EventComment {
  _id: string;
  eventId: string;
  userId: string;
  comment: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  replies?: EventComment[];
  likes?: string[];
}
