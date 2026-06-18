// The shape handed to the social media publishing service: a single target
// (one platform/account) together with the content it should publish.
export interface PublishablePost {
  targetId: string;
  content: string;
  images: string[];
  account: {
    id: string;
    platform: string;
    username: string;
    accessToken: string;
    refreshToken: string | null;
  };
}
