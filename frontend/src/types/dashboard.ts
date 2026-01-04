export interface DashboardStats {
  totalPosts: number;
  totalReach: number;
  engagementRate: string;
  scheduledPosts: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}


