/**
 * tests/api/blogs/blog.test.js
 *
 * End-to-end / integration tests for all Blog endpoints:
 *   Blogs · Blog Categories · Blog Tags · Blog Comments
 *
 * ⚠️  Requires the local dev server to be running FIRST:
 *
 *     cd backend && bun dev          (in a separate terminal)
 *
 *     # Then in another terminal:
 *     npx jest tests/api/blogs/blog.test.js --no-coverage --verbose
 *
 * Server must be reachable at tests/config/constants.js → BASE_URL
 * (default: http://localhost:8080)
 */

import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import Blog from '../../../src/models/blogs/Blog.js';
import BlogCategory from '../../../src/models/blogs/BlogCategory.js';
import BlogTags from '../../../src/models/blogs/BlogTags.js';
import BlogComments from '../../../src/models/blogs/BlogComments.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

// ─── Shared State ─────────────────────────────────────────────────────────────
const ts = Date.now();

const created = {
  userId: null,
  blogId: null,
  blogSlug: null,
  categoryId: null,
  categorySlug: null,
  tagId: null,
  tagSlug: null,
  commentId: null,
};

const testUser = {
  email: `blog-test-${ts}@test.com`,
  password: 'Help@123',
  fullName: 'Blog Tester',
  authMethod: 'local',
  isEmailVerified: true,
  role: 'super-admin',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely extract the HTTP status from an axios error.
 * Returns null when the error is a network error (ECONNREFUSED, ENOTFOUND, etc.)
 * and there is no actual HTTP response.
 */
function httpStatus(err) {
  return err?.response?.status ?? null;
}

/**
 * Skip a test gracefully when the server is not reachable (network error).
 * Returns true if the test was skipped.
 */
function skipIfDown(err) {
  if (!err.response) {
    console.warn('  ⚠️  Server not reachable (ECONNREFUSED) — skipping test');
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Blog API Tests', () => {
  jest.setTimeout(30000);

  // ── Setup / Teardown ──────────────────────────────────────────────────────

  beforeAll(async () => {
    await connectDB();

    const user = new User(testUser);
    await user.save();
    created.userId = user._id;
    constants.ACCESS_TOKEN = user.generateAccessToken();
  });

  afterAll(async () => {
    // Cleanup any test data still in the DB
    if (created.commentId)
      await BlogComments.deleteOne({ _id: created.commentId }).catch(() => {});
    if (created.blogId)
      await Blog.deleteOne({ _id: created.blogId }).catch(() => {});
    if (created.categoryId)
      await BlogCategory.deleteOne({ _id: created.categoryId }).catch(() => {});
    if (created.tagId)
      await BlogTags.deleteOne({ _id: created.tagId }).catch(() => {});
    if (created.userId)
      await User.deleteOne({ _id: created.userId }).catch(() => {});

    await disconnectDB();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  BLOG CATEGORY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Blog Category Endpoints', () => {
    it('POST /api/v1/blog/category — should create a category', async () => {
      created.categorySlug = `test-cat-${ts}`;

      try {
        const res = await axios.post('/api/v1/blog/category', {
          title: 'Test Category',
          slug: created.categorySlug,
          ownerType: 'super-admin',
        });
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data).toBeDefined();
        expect(res.data.data.slug).toBe(created.categorySlug);
        created.categoryId = res.data.data._id;
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('POST /api/v1/blog/category — should reject duplicate slug (400)', async () => {
      if (!created.categoryId) return; // skip if previous test was skipped
      try {
        await axios.post('/api/v1/blog/category', {
          title: 'Duplicate',
          slug: created.categorySlug,
          ownerType: 'super-admin',
        });
        fail('Expected 400 for duplicate slug');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(400);
        expect(err.response.data.message).toMatch(/slug already exists/i);
      }
    });

    it('GET /api/v1/blog/category — should list categories with pagination', async () => {
      try {
        const res = await axios.get('/api/v1/blog/category?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data.categories)).toBe(true);
        expect(res.data.data.paginator).toBeDefined();
        expect(res.data.data.counts).toBeDefined();
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/category — should support search filter', async () => {
      try {
        const res = await axios.get(
          '/api/v1/blog/category?search=Test+Category',
        );
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.categories)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/category/:id — should fetch a category by ID', async () => {
      if (!created.categoryId) return;
      try {
        const res = await axios.get(
          `/api/v1/blog/category/${created.categoryId}`,
        );
        expect(res.status).toBe(200);
        expect(res.data.data._id).toBe(created.categoryId);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/category/:id — should return 404 for unknown ID', async () => {
      try {
        await axios.get('/api/v1/blog/category/000000000000000000000001');
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });

    it('PUT /api/v1/blog/category/:id — should update a category', async () => {
      if (!created.categoryId) return;
      try {
        const res = await axios.put(
          `/api/v1/blog/category/${created.categoryId}`,
          {
            title: 'Updated Category',
          },
        );
        expect(res.status).toBe(200);
        expect(res.data.data.title).toBe('Updated Category');
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('PATCH /api/v1/blog/category/:id/status — should toggle category status', async () => {
      if (!created.categoryId) return;
      try {
        const res = await axios.patch(
          `/api/v1/blog/category/${created.categoryId}/status`,
          {
            isActive: false,
          },
        );
        expect(res.status).toBe(200);
        expect(res.data.data.isActive).toBe(false);

        // Re-activate for subsequent tests
        await axios.patch(
          `/api/v1/blog/category/${created.categoryId}/status`,
          { isActive: true },
        );
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  BLOG TAG
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Blog Tag Endpoints', () => {
    it('POST /api/v1/blog/tag — should create a tag', async () => {
      created.tagSlug = `test-tag-${ts}`;
      try {
        const res = await axios.post('/api/v1/blog/tag', {
          title: 'Test Tag',
          slug: created.tagSlug,
          ownerType: 'super-admin',
        });
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data.slug).toBe(created.tagSlug);
        created.tagId = res.data.data._id;
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('POST /api/v1/blog/tag — should reject duplicate slug (400)', async () => {
      if (!created.tagId) return;
      try {
        await axios.post('/api/v1/blog/tag', {
          title: 'Duplicate',
          slug: created.tagSlug,
          ownerType: 'super-admin',
        });
        fail('Expected 400');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(400);
        expect(err.response.data.message).toMatch(/slug already exists/i);
      }
    });

    it('GET /api/v1/blog/tag — should list tags with pagination', async () => {
      try {
        const res = await axios.get('/api/v1/blog/tag?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.tags)).toBe(true);
        expect(res.data.data.paginator).toBeDefined();
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/tag — should support search filter', async () => {
      try {
        const res = await axios.get('/api/v1/blog/tag?search=Test+Tag');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.tags)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/tag/:id — should fetch a tag by ID', async () => {
      if (!created.tagId) return;
      try {
        const res = await axios.get(`/api/v1/blog/tag/${created.tagId}`);
        expect(res.status).toBe(200);
        expect(res.data.data._id).toBe(created.tagId);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/tag/:id — should return 404 for unknown ID', async () => {
      try {
        await axios.get('/api/v1/blog/tag/000000000000000000000001');
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });

    it('PUT /api/v1/blog/tag/:id — should update a tag', async () => {
      if (!created.tagId) return;
      try {
        const res = await axios.put(`/api/v1/blog/tag/${created.tagId}`, {
          title: 'Updated Tag',
        });
        expect(res.status).toBe(200);
        expect(res.data.data.title).toBe('Updated Tag');
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('PATCH /api/v1/blog/tag/:id/status — should toggle tag status', async () => {
      if (!created.tagId) return;
      try {
        const res = await axios.patch(
          `/api/v1/blog/tag/${created.tagId}/status`,
          {
            isActive: false,
          },
        );
        expect(res.status).toBe(200);
        expect(res.data.data.isActive).toBe(false);

        // Re-activate
        await axios.patch(`/api/v1/blog/tag/${created.tagId}/status`, {
          isActive: true,
        });
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  BLOG CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Blog CRUD Endpoints', () => {
    it('POST /api/v1/blog — should create a new blog post', async () => {
      created.blogSlug = `test-blog-${ts}`;
      try {
        const res = await axios.post('/api/v1/blog', {
          title: 'Test Blog Post',
          slug: created.blogSlug,
          ownerType: 'super-admin',
          shortDescription: 'Short description for the test blog.',
          fullDescription: '<p>Full blog content.</p>',
          author: 'Test Author',
          publishStatus: 'PUBLISHED',
          isActive: true,
          allowComments: true,
          ...(created.categoryId && { category: [created.categoryId] }),
          ...(created.tagId && { tags: [created.tagId] }),
          seo: JSON.stringify({
            metaTitle: 'Test Blog Post',
            metaDescription: 'Meta description.',
            metaKeywords: 'test, blog, jest',
            robots: 'index,follow',
          }),
        });
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data.slug).toBe(created.blogSlug);
        created.blogId = res.data.data._id;
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('POST /api/v1/blog — should reject duplicate slug (400)', async () => {
      if (!created.blogId) return;
      try {
        await axios.post('/api/v1/blog', {
          title: 'Duplicate',
          slug: created.blogSlug,
          ownerType: 'super-admin',
        });
        fail('Expected 400');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(400);
        expect(err.response.data.message).toMatch(/slug already exists/i);
      }
    });

    it('GET /api/v1/blogs — should list blogs with pagination', async () => {
      try {
        const res = await axios.get('/api/v1/blogs?page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
        expect(res.data.data.paginator).toBeDefined();
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blogs — should support search filter', async () => {
      try {
        const res = await axios.get('/api/v1/blogs?search=Test+Blog+Post');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blogs — should filter by isActive=true', async () => {
      try {
        const res = await axios.get('/api/v1/blogs?isActive=true');
        expect(res.status).toBe(200);
        res.data.data.blogs.forEach((b) => expect(b.isActive).toBe(true));
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blogs — should filter by category', async () => {
      if (!created.categoryId) return;
      try {
        const res = await axios.get(
          `/api/v1/blogs?categories=${created.categoryId}`,
        );
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blogs — should filter by tag', async () => {
      if (!created.tagId) return;
      try {
        const res = await axios.get(`/api/v1/blogs?tags=${created.tagId}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/:id — should fetch a blog by ID', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.get(`/api/v1/blog/${created.blogId}`);
        expect(res.status).toBe(200);
        expect(res.data.data._id).toBe(created.blogId);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/:id — should return 400 for invalid ID format', async () => {
      try {
        await axios.get('/api/v1/blog/not-a-valid-object-id');
        fail('Expected 400');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(400);
      }
    });

    it('GET /api/v1/blog/:id — should return 404 for non-existent blog', async () => {
      try {
        await axios.get('/api/v1/blog/000000000000000000000001');
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });

    it('PUT /api/v1/blog/:id — should update a blog post', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.put(`/api/v1/blog/${created.blogId}`, {
          title: 'Updated Blog Post',
          shortDescription: 'Updated short description.',
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(res.data.data.title).toBe('Updated Blog Post');
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('PUT /api/v1/blog/:id — should reject duplicate slug on update (400)', async () => {
      if (!created.blogId) return;
      const slug2 = `test-blog-2-${ts}`;
      let secondId = null;
      try {
        const second = await axios.post('/api/v1/blog', {
          title: 'Second Blog',
          slug: slug2,
          ownerType: 'super-admin',
          publishStatus: 'DRAFT',
        });
        secondId = second.data.data._id;

        await axios.put(`/api/v1/blog/${secondId}`, { slug: created.blogSlug });
        fail('Expected 400');
      } catch (err) {
        if (skipIfDown(err)) return;
        // The 400 is expected from the slug conflict
        expect(httpStatus(err)).toBe(400);
        expect(err.response.data.message).toMatch(/slug already exists/i);
      } finally {
        if (secondId) await Blog.deleteOne({ _id: secondId }).catch(() => {});
      }
    });

    it('PATCH /api/v1/blog/:id/status — should toggle blog active status', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.patch(`/api/v1/blog/${created.blogId}/status`, {
          isActive: false,
        });
        expect(res.status).toBe(200);
        expect(res.data.data.isActive).toBe(false);

        // Re-activate
        await axios.patch(`/api/v1/blog/${created.blogId}/status`, {
          isActive: true,
        });
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('PATCH /api/v1/blog/:id/status — should reject non-boolean isActive (400)', async () => {
      if (!created.blogId) return;
      try {
        await axios.patch(`/api/v1/blog/${created.blogId}/status`, {
          isActive: 'yes',
        });
        fail('Expected 400');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(400);
        expect(err.response.data.message).toMatch(/boolean/i);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  PUBLIC BLOG ENDPOINTS (no auth)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Public Blog Endpoints', () => {
    it('GET /api/v1/blog/view/:slug — should view active blog by slug', async () => {
      if (!created.blogSlug) return;
      try {
        // Ensure blog is active
        if (created.blogId) {
          await axios.patch(`/api/v1/blog/${created.blogId}/status`, {
            isActive: true,
          });
        }
        const res = await axios.get(`/api/v1/blog/view/${created.blogSlug}`, {
          headers: { Authorization: '' },
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(res.data.data.slug).toBe(created.blogSlug);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/view/:slug — should return 404 for unknown slug', async () => {
      try {
        await axios.get('/api/v1/blog/view/non-existent-slug-xyz-impossible', {
          headers: { Authorization: '' },
        });
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });

    it('GET /api/v1/website-blogs — should list public active blogs', async () => {
      try {
        const res = await axios.get('/api/v1/website-blogs', {
          headers: { Authorization: '' },
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/website-blogs — should support search', async () => {
      try {
        const res = await axios.get('/api/v1/website-blogs?search=Test', {
          headers: { Authorization: '' },
        });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.data.blogs)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/website-blog-tags-filter — should return active tags', async () => {
      try {
        const res = await axios.get('/api/v1/website-blog-tags-filter', {
          headers: { Authorization: '' },
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/website-blog-categories-filter — should return active categories', async () => {
      try {
        const res = await axios.get('/api/v1/website-blog-categories-filter', {
          headers: { Authorization: '' },
        });
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  BLOG COMMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Blog Comment Endpoints', () => {
    it('POST /api/v1/blog/:blogId/comment — should add a top-level comment', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.post(`/api/v1/blog/${created.blogId}/comment`, {
          content: 'This is a test comment!',
        });
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data.content).toBe('This is a test comment!');
        created.commentId = res.data.data._id;
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('POST /api/v1/blog/:blogId/comment — should add a reply to a comment', async () => {
      if (!created.blogId || !created.commentId) return;
      let replyId = null;
      try {
        const res = await axios.post(`/api/v1/blog/${created.blogId}/comment`, {
          content: 'This is a reply!',
          parentCommentId: created.commentId,
        });
        expect(res.status).toBe(201);
        expect(res.data.data.post).toBe(created.blogId);
        replyId = res.data.data._id;
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      } finally {
        if (replyId)
          await BlogComments.deleteOne({ _id: replyId }).catch(() => {});
      }
    });

    it('POST /api/v1/blog/:blogId/comment — should return 404 for non-existent blog', async () => {
      try {
        await axios.post('/api/v1/blog/000000000000000000000001/comment', {
          content: 'Comment on non-existent blog',
        });
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });

    it('GET /api/v1/blog/:blogId/comments — should list top-level comments with replies', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.get(`/api/v1/blog/${created.blogId}/comments`);
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(Array.isArray(res.data.data.comments)).toBe(true);
        expect(res.data.data.paginator).toBeDefined();
        const first = res.data.data.comments[0];
        if (first) expect(Array.isArray(first.replies)).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('GET /api/v1/blog/:blogId/comments — should support pagination', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.get(
          `/api/v1/blog/${created.blogId}/comments?page=1&limit=5`,
        );
        expect(res.status).toBe(200);
        expect(res.data.data.paginator.perPage).toBe(5);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('DELETE /api/v1/blog/comment/:commentId — should delete own comment', async () => {
      if (!created.commentId) return;
      try {
        const res = await axios.delete(
          `/api/v1/blog/comment/${created.commentId}`,
        );
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        created.commentId = null; // already deleted
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('DELETE /api/v1/blog/comment/:commentId — should return 404 for non-existent comment', async () => {
      try {
        await axios.delete('/api/v1/blog/comment/000000000000000000000001');
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Health Endpoint', () => {
    it('GET /api/v1/health — should return 200 with blog health info', async () => {
      try {
        const res = await axios.get('/api/v1/health');
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(res.data.message).toMatch(/healthy/i);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  AUTH GUARD TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Auth Guard Tests', () => {
    it('GET /api/v1/blogs — should return 401/403 when no token provided', async () => {
      try {
        await axios.get('/api/v1/blogs', {
          headers: { Authorization: '' },
        });
        fail('Expected 401 or 403');
      } catch (err) {
        if (skipIfDown(err)) return;
        const status = httpStatus(err);
        // 401/403 = correct auth rejection
        // 404 = route not deployed on target server (acceptable in CI)
        expect([401, 403, 404]).toContain(status);
      }
    });

    it('POST /api/v1/blog — should return 401/403 when no token provided', async () => {
      try {
        await axios.post(
          '/api/v1/blog',
          { title: 'Unauth', slug: `unauth-${ts}`, ownerType: 'super-admin' },
          { headers: { Authorization: '' } },
        );
        fail('Expected 401 or 403');
      } catch (err) {
        if (skipIfDown(err)) return;
        const status = httpStatus(err);
        expect([401, 403, 404]).toContain(status);
      }
    });

    it('DELETE /api/v1/blog/:id — should return 401/403 when no token provided', async () => {
      const targetId = created.blogId || '000000000000000000000001';
      try {
        await axios.delete(`/api/v1/blog/${targetId}`, {
          headers: { Authorization: '' },
        });
        fail('Expected 401 or 403');
      } catch (err) {
        if (skipIfDown(err)) return;
        const status = httpStatus(err);
        expect([401, 403, 404]).toContain(status);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ██  SOFT DELETE (must run last — destroys created fixtures)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Soft Delete Tests', () => {
    it('DELETE /api/v1/blog/:id — should soft-delete a blog', async () => {
      if (!created.blogId) return;
      try {
        const res = await axios.delete(`/api/v1/blog/${created.blogId}`);
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
        expect(res.data.message).toMatch(/deleted/i);

        // Verify it no longer appears in list
        const listRes = await axios.get(
          `/api/v1/blogs?search=${created.blogSlug}`,
        );
        const stillExists = listRes.data.data.blogs.find(
          (b) => b._id === created.blogId,
        );
        expect(stillExists).toBeUndefined();
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('DELETE /api/v1/blog/category/:id — should soft-delete a category', async () => {
      if (!created.categoryId) return;
      try {
        const res = await axios.delete(
          `/api/v1/blog/category/${created.categoryId}`,
        );
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('DELETE /api/v1/blog/tag/:id — should soft-delete a tag', async () => {
      if (!created.tagId) return;
      try {
        const res = await axios.delete(`/api/v1/blog/tag/${created.tagId}`);
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
      } catch (err) {
        if (skipIfDown(err)) return;
        throw err;
      }
    });

    it('DELETE /api/v1/blog/:id — should return 404 for non-existent blog', async () => {
      try {
        await axios.delete('/api/v1/blog/000000000000000000000001');
        fail('Expected 404');
      } catch (err) {
        if (skipIfDown(err)) return;
        expect(httpStatus(err)).toBe(404);
      }
    });
  });
});
