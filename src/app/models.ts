import { BackendRole } from "./shared/role-tag.component";

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
  roles?: BackendRole[];
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
  postId?: string;
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

// Communities & Groups Models
export interface Community {
  id: string;
  communityId: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  image?: string;
  category: string;
  tagline?: string;
  icon?: string;
  createdBy: User;
  moderators: CommunityModerator[];
  experts: CommunityExpert[];
  isActive: boolean;
  memberCount: number;
  groupCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityModerator {
  userId: User;
  assignedAt: string;
  assignedBy: User;
}

export interface CommunityExpert {
  userId: User;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: User;
}

export interface CommunityData {
  title: string;
  shortDescription: string;
  longDescription: string;
  image?: string;
  category: string;
  tagline?: string;
  icon?: string;
}

export interface Group {
  id: string;
  groupId: string;
  title: string;
  intro: string;
  image?: string;
  category: string;
  type: 'Public' | 'Private' | 'Secret';
  status: 'active' | 'inactive' | 'archived';
  communityId: Community;
  createdBy: User;
  admins: GroupAdmin[];
  moderators: GroupModerator[];
  rules: GroupRule[];
  memberCount: number;
  postCount: number;
  isActive: boolean;
  userMembership?: UserMembership;
  createdAt: string;
  updatedAt: string;
}

export interface GroupAdmin {
  userId: User;
  assignedAt: string;
  assignedBy: User;
}

export interface GroupModerator {
  userId: User;
  assignedAt: string;
  assignedBy: User;
}

export interface GroupRule {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface UserMembership {
  status: 'active' | 'pending' | 'banned' | 'left';
  role: 'member' | 'moderator' |'groupAdmin' |'admin' | 'expert';
  joinedAt?: string;
}

export interface GroupData {
  title: string;
  intro: string;
  image?: string;
  category: string;
  type: 'Public' | 'Private' | 'Secret';
  communityId: string;
  rules?: { title: string; description: string }[];
}

export interface GroupMembership {
  id: string;
  groupId: Group;
  userId: User;
  status: 'active' | 'pending' | 'banned' | 'left';
  role: 'member' | 'moderator' | 'admin' | 'expert';
  joinedAt: string;
  approvedAt?: string;
  approvedBy?: User;
  bannedAt?: string;
  bannedBy?: User;
  banReason?: string;
  leftAt?: string;
  requestMessage?: string;
}

export interface GroupPost {
  id: string;
  postId: string;
  groupId: Group;
  authorId: User;
  content?: string;
  mediaUrls: MediaUrl[];
  tags: string[];
  isAnonymous: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  postType: 'general' | 'help' | 'question' | 'event' | 'poll';
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: User;
  likes: PostLike[];
  comments: PostComment[];
  bookmarks: PostBookmark[];
  reports: PostReport[];
  bestAnswer?: BestAnswer;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: User;
  editHistory: EditHistory[];
  likeCount?: number;
  commentCount?: number;
  bookmarkCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUrl {
mimeType: any;
  url: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
}

export interface PostLike {
  userId: User;
  createdAt: string;
}

export interface PostComment {
  _id: string;
  userId: User;
  content: string;
  likes: PostLike[];
  replies: PostReply[];
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface PostReply {
  _id: string;
  userId: User;
  content: string;
  likes: PostLike[];
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface PostBookmark {
  userId: User;
  createdAt: string;
}

export interface PostReport {
  reportedBy: User;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'misinformation' | 'violence' | 'hate_speech' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: User;
  reviewedAt?: string;
}

export interface BestAnswer {
  commentId: string;
  markedBy: User;
  markedAt: string;
}

export interface EditHistory {
  editedAt: string;
  editedBy: User;
  previousContent: string;
  reason?: string;
}

export interface GroupPostData {
  content?: string;
  mediaUrls?: MediaUrl[];
  tags?: string[];
  isAnonymous?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent';
  postType?: 'general' | 'help' | 'question' | 'event' | 'poll';
}

export interface UserRole {
  id: string;
  userId: User;
  role: 'admin' | 'expert' | 'user' | 'moderator';
  permissions: string[];
  assignedBy?: User;
  assignedAt: string;
  isActive: boolean;
  expertiseAreas?: string[];
  credentials?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: User;
}

