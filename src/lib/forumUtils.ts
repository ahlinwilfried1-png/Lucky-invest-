/**
 * Forum utilities for anonymous user ID generation and post deduplication.
 */

/**
 * Deterministically generates a masked 3-digit anonymous user ID (e.g. "1★7")
 * for the forum, ensuring the real name is never displayed and the ID is
 * stable and identical for the same user across all visits and posts.
 */
export function getMaskedAnonymousId(userOrIdentifier: any): string {
  if (!userOrIdentifier) return "1★7";

  let seed = "";
  if (typeof userOrIdentifier === "string") {
    seed = userOrIdentifier.trim();
  } else if (typeof userOrIdentifier === "object") {
    seed = (
      userOrIdentifier.authorId ||
      userOrIdentifier.userId ||
      userOrIdentifier.authorPhone ||
      userOrIdentifier.whatsapp ||
      userOrIdentifier.id ||
      userOrIdentifier.authorName ||
      "user"
    ).toString().trim();
  }

  // Strip prefixes to access core user uniqueness
  seed = seed.replace(/^f-user-/, '').replace(/^u-/, '');
  if (!seed) seed = "member-anon";

  // FNV-1a 32-bit hash algorithm for uniform deterministic distribution
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positive = Math.abs(hash >>> 0);

  // Generate 3-digit number strictly between 100 and 999
  const num = 100 + (positive % 900);
  const numStr = String(num);

  // Mask the middle digit with a star, e.g. "1★7"
  return `${numStr[0]}★${numStr[2]}`;
}

/**
 * Deduplicates forum posts by ID and content time window,
 * ensuring no duplicate posts appear in the UI or store.
 */
export function deduplicateForumPosts(posts: any[]): any[] {
  if (!Array.isArray(posts)) return [];
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: any[] = [];

  for (const post of posts) {
    if (!post || !post.id) continue;
    const idStr = String(post.id);
    if (seenIds.has(idStr)) continue;

    // Content signature to guard against accidental double submissions
    const textNorm = (post.text || '').trim().toLowerCase();
    const author = String(post.authorId || post.authorPhone || post.authorName || '');
    const timeBucket = Math.floor(new Date(post.createdAt || 0).getTime() / 20000); // 20s window
    const contentKey = `${author}_${textNorm}_${timeBucket}`;

    if (textNorm && textNorm.length > 5 && seenContent.has(contentKey)) {
      continue;
    }

    seenIds.add(idStr);
    if (textNorm && textNorm.length > 5) {
      seenContent.add(contentKey);
    }
    result.push(post);
  }

  // Sort descending by creation date (newest first)
  return result.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.lastModified || 0).getTime();
    const timeB = new Date(b.createdAt || b.lastModified || 0).getTime();
    return timeB - timeA;
  });
}
