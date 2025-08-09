export interface SocialMediaPost {
    content: string;
    mediaUrls?: string[];
    scheduledTime?: Date;
    [key: string]: any;
}