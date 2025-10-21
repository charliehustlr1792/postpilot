export interface Post {
  id: string;
  content: string;
  images: string[];
  platform: string;
  account: {
    id: string;
    platform: string;
    username: string;
    accessToken: string;
    refreshToken: string | null;
  };
}

