/**
 * Meta (Facebook + Instagram) API integration
 * Handles posting to Facebook Pages and Instagram Business accounts
 */

const META_GRAPH_API = "https://graph.facebook.com/v21.0";

function getConfig() {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  const igAccountId = process.env.META_IG_ACCOUNT_ID;

  return { pageAccessToken, pageId, igAccountId };
}

export function isMetaConfigured(): boolean {
  const { pageAccessToken, pageId } = getConfig();
  return !!(pageAccessToken && pageId);
}

export function isInstagramConfigured(): boolean {
  const { pageAccessToken, igAccountId } = getConfig();
  return !!(pageAccessToken && igAccountId);
}

interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Post a text + optional photo to a Facebook Page
 */
export async function postToFacebook(params: {
  message: string;
  imageUrl?: string;
  link?: string;
}): Promise<PostResult> {
  const { pageAccessToken, pageId } = getConfig();
  if (!pageAccessToken || !pageId) {
    return { success: false, error: "Facebook not configured. Set META_PAGE_ACCESS_TOKEN and META_PAGE_ID." };
  }

  try {
    let endpoint: string;
    let body: Record<string, string>;

    if (params.imageUrl) {
      // Photo post
      endpoint = `${META_GRAPH_API}/${pageId}/photos`;
      body = {
        url: params.imageUrl,
        message: params.message,
        access_token: pageAccessToken,
      };
    } else if (params.link) {
      // Link share post
      endpoint = `${META_GRAPH_API}/${pageId}/feed`;
      body = {
        message: params.message,
        link: params.link,
        access_token: pageAccessToken,
      };
    } else {
      // Text-only post
      endpoint = `${META_GRAPH_API}/${pageId}/feed`;
      body = {
        message: params.message,
        access_token: pageAccessToken,
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });

    const data = await response.json();

    if (data.error) {
      console.error("[MetaAPI] Facebook post error:", data.error);
      return { success: false, error: data.error.message || "Unknown Facebook API error" };
    }

    const postId = data.id || data.post_id;
    console.log(`[MetaAPI] Facebook post created: ${postId}`);
    return { success: true, postId };
  } catch (err: any) {
    console.error("[MetaAPI] Facebook post failed:", err);
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Post a photo to Instagram Business account
 * Instagram requires a public image URL — text-only posts are not supported
 */
export async function postToInstagram(params: {
  caption: string;
  imageUrl: string;
}): Promise<PostResult> {
  const { pageAccessToken, igAccountId } = getConfig();
  if (!pageAccessToken || !igAccountId) {
    return { success: false, error: "Instagram not configured. Set META_PAGE_ACCESS_TOKEN and META_IG_ACCOUNT_ID." };
  }

  if (!params.imageUrl) {
    return { success: false, error: "Instagram requires an image URL for posts." };
  }

  try {
    // Step 1: Create a media container
    const containerResponse = await fetch(
      `${META_GRAPH_API}/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          image_url: params.imageUrl,
          caption: params.caption,
          access_token: pageAccessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (containerData.error) {
      console.error("[MetaAPI] Instagram container error:", containerData.error);
      return { success: false, error: containerData.error.message || "Failed to create Instagram media container" };
    }

    const containerId = containerData.id;

    // Step 2: Wait for the container to be ready (poll status)
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const statusResponse = await fetch(
        `${META_GRAPH_API}/${containerId}?fields=status_code&access_token=${pageAccessToken}`
      );
      const statusData = await statusResponse.json();

      if (statusData.status_code === "FINISHED") {
        ready = true;
      } else if (statusData.status_code === "ERROR") {
        return { success: false, error: "Instagram media processing failed" };
      }
      // IN_PROGRESS — keep waiting
    }

    if (!ready) {
      return { success: false, error: "Instagram media processing timed out" };
    }

    // Step 3: Publish the container
    const publishResponse = await fetch(
      `${META_GRAPH_API}/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: pageAccessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      console.error("[MetaAPI] Instagram publish error:", publishData.error);
      return { success: false, error: publishData.error.message || "Failed to publish Instagram post" };
    }

    console.log(`[MetaAPI] Instagram post published: ${publishData.id}`);
    return { success: true, postId: publishData.id };
  } catch (err: any) {
    console.error("[MetaAPI] Instagram post failed:", err);
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Post to both Facebook and Instagram simultaneously
 */
export async function postToBothPlatforms(params: {
  caption: string;
  imageUrl?: string;
  link?: string;
}): Promise<{ facebook: PostResult; instagram: PostResult }> {
  const fbResult = await postToFacebook({
    message: params.caption,
    imageUrl: params.imageUrl,
    link: params.link,
  });

  let igResult: PostResult = { success: false, error: "Skipped — no image provided" };
  if (params.imageUrl && isInstagramConfigured()) {
    igResult = await postToInstagram({
      caption: params.caption,
      imageUrl: params.imageUrl,
    });
  } else if (!isInstagramConfigured()) {
    igResult = { success: false, error: "Instagram not configured" };
  }

  return { facebook: fbResult, instagram: igResult };
}

/**
 * Generate hashtags for a concreting post
 */
export function generateHashtags(service?: string, suburb?: string): string {
  const base = [
    "#ConcreteConceptsGroup",
    "#BrisbaneConcreter",
    "#ConcreteBrisbane",
    "#SEQConcreting",
    "#QBCCLicensed",
  ];

  const serviceHashtags: Record<string, string[]> = {
    driveway: ["#ConcreteDriveway", "#DrivewayBrisbane", "#ExposedAggregate"],
    slab: ["#ConcreteSlab", "#HouseSlab", "#ShedSlab"],
    retaining: ["#RetainingWall", "#RetainingWallBrisbane", "#Landscaping"],
    patio: ["#ConcretePatio", "#OutdoorLiving", "#EntertainingArea"],
    pool: ["#PoolSurround", "#PoolDeck", "#BackyardGoals"],
    exposed: ["#ExposedAggregate", "#DecorativeConcrete", "#ExposedConcreteBrisbane"],
  };

  if (service) {
    const key = Object.keys(serviceHashtags).find(k => service.toLowerCase().includes(k));
    if (key) base.push(...serviceHashtags[key]);
  }

  if (suburb) {
    const cleanSuburb = suburb.replace(/\s+/g, "");
    base.push(`#${cleanSuburb}`, `#Concreter${cleanSuburb}`);
  }

  return base.join(" ");
}
