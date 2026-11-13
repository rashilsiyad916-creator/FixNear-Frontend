
export interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export interface ProviderServiceSummary {
  id: number;
  categoryId: number;
  category: string;
  serviceName: string;
  description: string;
  imageUrl?: string | null;
  basePrice: number;
}

export interface Provider {
  id: number;
  name: string;
  category: string;
  area: string;
  experience: number;
  rating: number;
  price: number;
  image: string;
  description: string;
  available: boolean;
  verified?: boolean;
  services?: ProviderServiceSummary[];
  /** Every category this provider has an active service in. */
  categories?: string[];
}

export interface Booking {
  id: number;
  providerId: number;
  providerName: string;
  service: string;
  date: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  hasReview?: boolean;
}

export interface Review {
  id: number;
  providerId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProviderServiceOffering {
  id: number;
  categoryId: number;
  categoryName: string;
  serviceName: string;
  description: string;
  imageUrl?: string | null;
  basePrice: number;
  isActive: boolean;
  bookingCount: number;
}

export interface ProviderServiceRequest {
  categoryId: number;
  serviceName: string;
  description: string;
  imageUrl?: string | null;
  basePrice: number;
  isActive: boolean;
}

export interface ProviderProfile {
  id: number;
  userId: number;
  businessName: string;
  description: string;
  serviceArea: string;
  address: string;
  image: string;
  email: string;
  phone: string;
  experience: number;
  verified: boolean;
  available: boolean;
  rating: number;
  reviewCount: number;
  activeServices: number;
}

export interface ProviderProfileRequest {
  businessName: string;
  description: string;
  serviceArea: string;
  address: string;
  image?: string;
  phone?: string;
  experience: number;
  available?: boolean;
  categoryId?: number;
  serviceName?: string;
  serviceDescription?: string;
  basePrice?: number;
}

export interface ProviderBooking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  price: number;
  date: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  problem: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface ProviderStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  totalEarnings: number;
  activeServices: number;
  totalServices: number;
  averageRating: number;
  reviewCount: number;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

/** Response contract shared by every Cloudinary-backed upload endpoint. */
export interface ImageUploadResponse {
  imageUrl: string;
  url?: string;
  secureUrl?: string;
  publicId: string;
  format: string;
  resourceType?: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  success?: boolean;
  message?: string;
  createdAt?: string;
}

export type CategoryRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CategoryRequest {
  id: number;
  providerId: number;
  providerName: string;
  name: string;
  description: string;
  status: CategoryRequestStatus;
  adminNote: string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

