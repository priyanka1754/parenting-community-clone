export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  children?: Child[];
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
  comments?: { userId: string; comment: string; }[];
  category?: string;
  mediaType?: string;
  mediaUrl?: string;
  mediaSize?: number;
  postType?: string;
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
