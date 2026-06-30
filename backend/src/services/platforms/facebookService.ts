import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { GRAPH_API, toGraphError } from './graph';

// Publishes to a Facebook Page via the Graph API using the stored Page token and
// Page id. Text-only goes to the Page feed; a single image posts to /photos;
// multiple images are uploaded unpublished and attached to one feed post.
export const publishToFacebook = async (post: PublishablePost): Promise<PublishResult> => {
  if (!post.account.platformAccountId) {
    throw new Error('Facebook account is missing its Page id; reconnect the account');
  }
  const images = post.images ?? [];
  if (images.length > 0 && !images.every((url) => /^https?:\/\//i.test(url))) {
    throw new Error('Facebook requires publicly accessible image URLs');
  }

  const pageId = post.account.platformAccountId;
  const accessToken = post.account.accessToken;

  try {
    // Single photo: post directly to /photos with the caption.
    if (images.length === 1) {
      const { data } = await axios.post<{ id: string; post_id?: string }>(
        `${GRAPH_API}/${pageId}/photos`,
        null,
        { params: { url: images[0], caption: post.content, access_token: accessToken } }
      );
      const id = data.post_id ?? data.id;
      return facebookResult(id);
    }

    // Multiple photos: upload each as unpublished to get media ids, then attach
    // them all to a single feed post.
    const params: Record<string, string> = {
      message: post.content,
      access_token: accessToken,
    };
    if (images.length > 1) {
      const mediaIds = await Promise.all(
        images.map(async (url) => {
          const { data } = await axios.post<{ id: string }>(
            `${GRAPH_API}/${pageId}/photos`,
            null,
            { params: { url, published: false, access_token: accessToken } }
          );
          return data.id;
        })
      );
      mediaIds.forEach((id, i) => {
        params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
      });
    }

    // Text-only or multi-photo feed post.
    const { data } = await axios.post<{ id: string }>(
      `${GRAPH_API}/${pageId}/feed`,
      null,
      { params }
    );
    return facebookResult(data.id);
  } catch (error) {
    throw toGraphError(error, 'Facebook');
  }
};

function facebookResult(postId: string): PublishResult {
  return {
    platformPostId: postId,
    url: `https://www.facebook.com/${postId}`,
    success: true,
    message: 'Successfully posted to Facebook',
  };
}
