import axios from 'axios';
import { PlatformPublishError } from '../../types/publishError';

// Shared Meta Graph API base + error handling for the Facebook and Instagram
// publish services.
export const GRAPH_API = 'https://graph.facebook.com/v21.0';

// Turns a Meta Graph API failure into a typed, recordable error. Meta auth
// failures surface as HTTP 401 or OAuth error code 190.
export function toGraphError(error: unknown, platform: string): PlatformPublishError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiError = (error.response?.data as { error?: { message?: string; code?: number } } | undefined)?.error;
    const isAuthError = status === 401 || apiError?.code === 190;
    if (apiError?.message) {
      return new PlatformPublishError(`${platform} API error: ${apiError.message}`, isAuthError);
    }
    return new PlatformPublishError(`${platform} API error${status ? ` (HTTP ${status})` : ''}`, isAuthError);
  }
  return new PlatformPublishError(
    error instanceof Error ? error.message : `Unknown ${platform} API error`
  );
}
