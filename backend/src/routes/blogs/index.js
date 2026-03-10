import { Router } from 'express';
import {
  // Blog CRUD
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  listBlogs,
  updateBlogStatus,

  // Public blog routes
  viewBlogBySlug,
  listWebsiteBlogs,
  websiteBlogFilterTags,
  websiteBlogFilterCategories,

  // Blog Categories
  createBlogCategory,
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogCategory,
  listBlogCategories,
  updateBlogCategoryStatus,

  // Blog Tags
  createBlogTag,
  getBlogTagById,
  updateBlogTag,
  deleteBlogTag,
  listBlogTags,
  updateBlogTagStatus,

  // Comments
  addBlogComment,
  listBlogComments,
  deleteBlogComment,

  // Import & Health
  importWordpressBlogs,
  getHealth,
} from '../../controllers/blogs/blogController.js';

import {
  authMiddleware,
  isSuperAdmin,
  isAnyAdmin,
} from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/multer.js';

const router = Router();

// ────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║                  PUBLIC ROUTES                           ║
// ╚══════════════════════════════════════════════════════════╝
// ────────────────────────────────────────────────────────────

// Public website blogs (no auth)
router.get('/website-blogs', listWebsiteBlogs);
router.get('/website-blog-tags-filter', websiteBlogFilterTags);
router.get('/website-blog-categories-filter', websiteBlogFilterCategories);

// View single blog by slug (public, increments views)
router.get('/blog/view/:slug', viewBlogBySlug);

// Public blog comments
router.get('/blog/:blogId/comments', listBlogComments);

// Health check (no auth)
router.get('/health', getHealth);

// ────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║              AUTHENTICATED ROUTES                        ║
// ╚══════════════════════════════════════════════════════════╝
// ────────────────────────────────────────────────────────────

// ── Blogs ──────────────────────────────────────────────────

// List all blogs (admin / org-admin view)
router.get('/blogs', authMiddleware, listBlogs);

// Get a single blog by ID (admin view)
router.get('/blog/:id', authMiddleware, getBlogById);

// Create a blog (accepts multipart images: bannerImage, thumbnailImage, ogImage, twitterImage)
router.post(
  '/blog',
  authMiddleware,
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'ogImage', maxCount: 1 },
    { name: 'twitterImage', maxCount: 1 },
  ]),
  createBlog,
);

// Update a blog (accepts multipart images)
router.put(
  '/blog/:id',
  authMiddleware,
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'ogImage', maxCount: 1 },
    { name: 'twitterImage', maxCount: 1 },
  ]),
  updateBlog,
);

// Delete (soft) a blog
router.delete('/blog/:id', authMiddleware, deleteBlog);

// Toggle active / inactive
router.patch('/blog/:id/status', authMiddleware, updateBlogStatus);

// WordPress import (super-admin only)
router.post(
  '/blog/import-wordpress',
  authMiddleware,
  isSuperAdmin,
  importWordpressBlogs,
);

// ── Comments ───────────────────────────────────────────────

// Add a comment (any authenticated user)
router.post('/blog/:blogId/comment', authMiddleware, addBlogComment);

// Delete a comment (owner or admin)
router.delete('/blog/comment/:commentId', authMiddleware, deleteBlogComment);

// ── Blog Categories ────────────────────────────────────────

// List all categories
router.get('/blog/category', authMiddleware, listBlogCategories);

// Create a category
router.post('/blog/category', authMiddleware, createBlogCategory);

// Get category by ID
router.get('/blog/category/:id', authMiddleware, getBlogCategoryById);

// Update category
router.put('/blog/category/:id', authMiddleware, updateBlogCategory);

// Delete (soft) category
router.delete('/blog/category/:id', authMiddleware, deleteBlogCategory);

// Toggle category status
router.patch(
  '/blog/category/:id/status',
  authMiddleware,
  updateBlogCategoryStatus,
);

// ── Blog Tags ──────────────────────────────────────────────

// List all tags
router.get('/blog/tag', authMiddleware, listBlogTags);

// Create a tag
router.post('/blog/tag', authMiddleware, createBlogTag);

// Get tag by ID
router.get('/blog/tag/:id', authMiddleware, getBlogTagById);

// Update tag
router.put('/blog/tag/:id', authMiddleware, updateBlogTag);

// Delete (soft) tag
router.delete('/blog/tag/:id', authMiddleware, deleteBlogTag);

// Toggle tag status
router.patch('/blog/tag/:id/status', authMiddleware, updateBlogTagStatus);

export default router;
