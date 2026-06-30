import axios from 'axios';
import { PublishablePost } from '../../types/post';
import { PublishResult } from '../../types/publishResult';
import { GRAPH_API, toGraphError } from './graph';

const IG_CAROUSEL_MAX = 10;

// Creates a media container and returns its id.
async function createIgContainer(
  igUserId: string,
  accessToken: string,
  params: Record<string, string | boolean>
): Promise<string> {
  const { data } = await axios.post<{ id: string }>(
    `${GRAPH_API}/${igUserId}/media`,
    null,
    { params: { ...params, access_token: accessToken } }
  );
  return data.id;
}

// Publishes to an Instagram Business account via the Graph API. A single image
// is a media container that gets published directly; 2–10 images become a
// carousel (one child container per image, then a CAROUSEL parent). Uses the
// linked Facebook Page's access token (stored at connect time) and the IG
// Business account id (platformAccountId).
export const publishToInstagram = async (post: PublishablePost): Promise<PublishResult> => {
  // Instagram requires at least one image, and every image must be a public URL
  // the Graph API can fetch (not a local blob).
  if (!post.images || post.images.length === 0) {
    throw new Error('Instagram posts require at least one image');
  }
  if (post.images.length > IG_CAROUSEL_MAX) {
    throw new Error(`Instagram posts cannot have more than ${IG_CAROUSEL_MAX} images`);
  }
  if (!post.images.every((url) => /^https?:\/\//i.test(url))) {
    throw new Error('Instagram requires publicly accessible image URLs');
  }
  if (!post.account.platformAccountId) {
    throw new Error('Instagram account is missing its business account id; reconnect the account');
  }

  const igUserId = post.account.platformAccountId;
  const accessToken = post.account.accessToken;

  try {
    let creationId: string;

    if (post.images.length === 1) {
      // Single image: one container carries the caption.
      creationId = await createIgContainer(igUserId, accessToken, {
        image_url: post.images[0],
        caption: post.content,
      });
    } else {
      // Carousel: a child container per image, then a CAROUSEL parent that
      // holds the caption and references the children.
      const childIds = await Promise.all(
        post.images.map((url) =>
          createIgContainer(igUserId, accessToken, {
            image_url: url,
            is_carousel_item: true,
          })
        )
      );
      creationId = await createIgContainer(igUserId, accessToken, {
        media_type: 'CAROUSEL',
        caption: post.content,
        children: childIds.join(','),
      });
    }

    // Publish the (single or carousel) container.
    const { data: published } = await axios.post<{ id: string }>(
      `${GRAPH_API}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        },
      }
    );

    return {
      platformPostId: published.id,
      url: `https://www.instagram.com/${post.account.username}`,
      success: true,
      message: 'Successfully posted to Instagram',
    };
  } catch (error) {
    throw toGraphError(error, 'Instagram');
  }
};
