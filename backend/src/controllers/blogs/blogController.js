import mongoose from 'mongoose';
import Blog from '../../models/blogs/Blog.js';
import BlogCategory from '../../models/blogs/BlogCategory.js';
import BlogTags from '../../models/blogs/BlogTags.js';
import BlogComments from '../../models/blogs/BlogComments.js';
import axios from 'axios';
import { cloudinary } from '../../config/cloudinary.js';
import fs from 'fs';

/**
 * Build the standard aggregation pipeline for a single blog by _id.
 */
function buildBlogPipeline(matchStage) {
  return [
    { $match: matchStage },
    // thumbnail
    {
      $lookup: {
        from: 'filedbs',
        localField: 'thumbnailImage',
        foreignField: '_id',
        as: 'thumbnailImageFile',
      },
    },
    {
      $unwind: {
        path: '$thumbnailImageFile',
        preserveNullAndEmptyArrays: true,
      },
    },
    // banner
    {
      $lookup: {
        from: 'filedbs',
        localField: 'bannerImage',
        foreignField: '_id',
        as: 'bannerImageFile',
      },
    },
    { $unwind: { path: '$bannerImageFile', preserveNullAndEmptyArrays: true } },
    // og image
    {
      $lookup: {
        from: 'filedbs',
        localField: 'seo.openGraph.ogImage',
        foreignField: '_id',
        as: 'ogImageFile',
      },
    },
    { $unwind: { path: '$ogImageFile', preserveNullAndEmptyArrays: true } },
    // twitter image
    {
      $lookup: {
        from: 'filedbs',
        localField: 'seo.twitter.twitterImage',
        foreignField: '_id',
        as: 'twitterImageFile',
      },
    },
    {
      $unwind: { path: '$twitterImageFile', preserveNullAndEmptyArrays: true },
    },
    // categories
    {
      $lookup: {
        from: 'blogcategories',
        localField: 'category',
        foreignField: '_id',
        as: 'populatedCategories',
      },
    },
    // tags
    {
      $lookup: {
        from: 'blogtags',
        localField: 'tags',
        foreignField: '_id',
        as: 'populatedTags',
      },
    },
    {
      $addFields: {
        thumbnailImageUrl: {
          $ifNull: ['$thumbnailImageFile.documentUrl', null],
        },
        bannerImageUrl: {
          $ifNull: ['$bannerImageFile.documentUrl', null],
        },
        ogImageUrl: {
          $ifNull: ['$ogImageFile.documentUrl', null],
        },
        twitterImageUrl: {
          $ifNull: ['$twitterImageFile.documentUrl', null],
        },
      },
    },
    {
      $addFields: {
        'seo.openGraph.ogImage': '$ogImageUrl',
        'seo.twitter.twitterImage': '$twitterImageUrl',
      },
    },
    {
      $project: {
        _id: 1,
        ownerType: 1,
        organizationId: 1,
        bannerImageUrl: 1,
        thumbnailImageUrl: 1,
        title: 1,
        slug: 1,
        publishDate: 1,
        author: 1,
        category: {
          $map: {
            input: '$populatedCategories',
            as: 'cat',
            in: { _id: '$$cat._id', title: '$$cat.title', slug: '$$cat.slug' },
          },
        },
        shortDescription: 1,
        publishStatus: 1,
        tags: {
          $map: {
            input: '$populatedTags',
            as: 'tag',
            in: { _id: '$$tag._id', title: '$$tag.title', slug: '$$tag.slug' },
          },
        },
        views: 1,
        likes: 1,
        dislikes: 1,
        comments: 1,
        fullDescription: 1,
        allowComments: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        addedBy: 1,
        updatedBy: 1,
        seo: 1,
      },
    },
  ];
}

/**
 * Fetch enriched blog data by its _id.
 */
async function getLastData(id) {
  const objectId = new mongoose.Types.ObjectId(id);
  const blogData = await Blog.aggregate(buildBlogPipeline({ _id: objectId }));
  if (!blogData.length) throw new Error('Blog not found');
  return blogData[0];
}

function resolveOwnership(req) {
  const { role, organization } = req.user;
  const body = req.body;

  if (role === 'super-admin' || role === 'org-admin') {
    if (body.organizationId) {
      return { ownerType: 'organization', organizationId: body.organizationId };
    }
    return { ownerType: 'super-admin', organizationId: null };
  }

  if (
    ['employer-admin', 'uni-admin', 'guest-org'].includes(role) &&
    organization
  ) {
    return { ownerType: 'organization', organizationId: organization };
  }

  return { ownerType: 'super-admin', organizationId: null };
}

// ─── Blog CRUD ────────────────────────────────────────────────────────────────

/**
 * POST /blog
 * Create a new blog post.
 * Accepts multipart/form-data with optional image fields:
 *   bannerImage, thumbnailImage, twitterImage, ogImage
 */
export const createBlog = async (req, res) => {
  try {
    let {
      title,
      slug,
      shortDescription,
      fullDescription,
      author,
      category,
      tags,
      publishStatus,
      publishDate,
      allowComments,
      isActive,
      seo,
      organizationId: bodyOrganizationId,
    } = req.body;

    if (publishStatus) {
      publishStatus = publishStatus.toUpperCase();
    }

    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(shortDescription !== undefined && { shortDescription }),
      ...(fullDescription !== undefined && { fullDescription }),
      ...(author !== undefined && { author }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
      ...(publishStatus !== undefined && { publishStatus }),
      ...(publishDate !== undefined && { publishDate }),
      ...(allowComments !== undefined && { allowComments }),
      ...(isActive !== undefined && { isActive }),
      ...(seo !== undefined && { seo }),
      ...(bodyOrganizationId !== undefined && {
        organizationId: bodyOrganizationId,
      }),
    };

    const { ownerType, organizationId } = resolveOwnership(req);
    data.ownerType = ownerType;
    if (organizationId) data.organizationId = organizationId;

    if (typeof data.seo === 'string') {
      try {
        data.seo = JSON.parse(data.seo);
      } catch {
        return res.status(400).json({ message: 'Invalid SEO JSON.' });
      }
    }

    if (typeof data.category === 'string') {
      try {
        data.category = JSON.parse(data.category.replace(/'/g, '"'));
      } catch {
        data.category = data.category
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags.replace(/'/g, '"'));
      } catch {
        data.tags = data.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (data.slug) {
      const existing = await Blog.findOne({ slug: data.slug });
      if (existing) {
        return res.status(400).json({ message: 'Slug already exists.' });
      }
    }

    const safeUnlink = (filePath) => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error('File delete error:', err);
      }
    };

    // Upload images
    if (req.files) {
      if (req.files.bannerImage?.[0]) {
        const filePath = req.files.bannerImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/banner',
        });

        data.bannerImageUrl = uploadResult.secure_url;
        data.bannerImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.thumbnailImage?.[0]) {
        const filePath = req.files.thumbnailImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/thumbnail',
        });

        data.thumbnailImageUrl = uploadResult.secure_url;
        data.thumbnailImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.twitterImage?.[0]) {
        const filePath = req.files.twitterImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/twitter',
        });

        if (!data.seo) data.seo = {};
        if (!data.seo.twitter) data.seo.twitter = {};

        data.seo.twitter.twitterImageUrl = uploadResult.secure_url;
        data.seo.twitter.twitterImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.ogImage?.[0]) {
        const filePath = req.files.ogImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/og',
        });

        if (!data.seo) data.seo = {};
        if (!data.seo.openGraph) data.seo.openGraph = {};

        data.seo.openGraph.ogImageUrl = uploadResult.secure_url;
        data.seo.openGraph.ogImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }
    }

    data.addedBy = req.user._id;

    const blog = new Blog(data);
    await blog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully.',
      data: blog,
    });
  } catch (error) {
    console.error('createBlog error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blog/:id
 * Get a single blog by ID (admin).
 */
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false })
      .populate('category', 'title slug')
      .populate('tags', 'title slug')
      .lean();

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('getBlogById error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /blog/:id
 * Update a blog post.
 */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      slug,
      shortDescription,
      fullDescription,
      author,
      category,
      tags,
      publishStatus,
      publishDate,
      allowComments,
      isActive,
      seo,
      organizationId: bodyOrganizationId,
    } = req.body;

    if (publishStatus) {
      publishStatus = publishStatus.toUpperCase();
    }

    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(shortDescription !== undefined && { shortDescription }),
      ...(fullDescription !== undefined && { fullDescription }),
      ...(author !== undefined && { author }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags }),
      ...(publishStatus !== undefined && { publishStatus }),
      ...(publishDate !== undefined && { publishDate }),
      ...(allowComments !== undefined && { allowComments }),
      ...(isActive !== undefined && { isActive }),
      ...(seo !== undefined && { seo }),
      ...(bodyOrganizationId !== undefined && {
        organizationId: bodyOrganizationId,
      }),
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    if (data.slug && data.slug !== blog.slug) {
      const existing = await Blog.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Slug already exists.' });
      }
    }

    if (typeof data.seo === 'string') {
      try {
        data.seo = JSON.parse(data.seo);
      } catch {
        return res.status(400).json({ message: 'Invalid SEO JSON.' });
      }
    }

    if (typeof data.category === 'string') {
      try {
        data.category = JSON.parse(data.category.replace(/'/g, '"'));
      } catch {
        data.category = data.category
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags.replace(/'/g, '"'));
      } catch {
        data.tags = data.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const safeUnlink = (filePath) => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error('File delete error:', err);
      }
    };

    // Upload images to Cloudinary
    if (req.files) {
      if (req.files.bannerImage?.[0]) {
        if (blog.bannerImagePublicId) {
          await cloudinary.uploader.destroy(blog.bannerImagePublicId);
        }

        const filePath = req.files.bannerImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/banner',
        });

        data.bannerImageUrl = uploadResult.secure_url;
        data.bannerImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.thumbnailImage?.[0]) {
        if (blog.thumbnailImagePublicId) {
          await cloudinary.uploader.destroy(blog.thumbnailImagePublicId);
        }

        const filePath = req.files.thumbnailImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/thumbnail',
        });

        data.thumbnailImageUrl = uploadResult.secure_url;
        data.thumbnailImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.twitterImage?.[0]) {
        if (blog?.seo?.twitter?.twitterImagePublicId) {
          await cloudinary.uploader.destroy(
            blog.seo.twitter.twitterImagePublicId,
          );
        }

        const filePath = req.files.twitterImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/twitter',
        });

        if (!data.seo) data.seo = blog.seo?.toObject?.() || {};
        if (!data.seo.twitter) data.seo.twitter = {};

        data.seo.twitter.twitterImageUrl = uploadResult.secure_url;
        data.seo.twitter.twitterImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }

      if (req.files.ogImage?.[0]) {
        if (blog?.seo?.openGraph?.ogImagePublicId) {
          await cloudinary.uploader.destroy(blog.seo.openGraph.ogImagePublicId);
        }

        const filePath = req.files.ogImage[0].path;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'blogs/og',
        });

        if (!data.seo) data.seo = blog.seo?.toObject?.() || {};
        if (!data.seo.openGraph) data.seo.openGraph = {};

        data.seo.openGraph.ogImageUrl = uploadResult.secure_url;
        data.seo.openGraph.ogImagePublicId = uploadResult.public_id;

        safeUnlink(filePath);
      }
    }

    data.updatedBy = req.user._id;

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('category', 'title slug')
      .populate('tags', 'title slug');

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('updateBlog error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /blog/:id
 * Soft-delete a blog post.
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedBy: req.user._id },
      { new: true },
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Blog deleted successfully.' });
  } catch (error) {
    console.error('deleteBlog error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blogs
 * List blogs with pagination, search, filters (admin panel).
 */
export const listBlogs = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = '',
      tags,
      categories,
      isActive,
      ownerType: queryOwnerType,
      organizationId: queryOrgId,
      publishStatus,
    } = req.query;

    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const query = { isDeleted: false };

    // --- Ownership & Scoping Logic ---
    const { role, organization } = req.user;

    // 1. If user is an organization-level admin, FORCE their own scope
    if (['employer-admin', 'uni-admin', 'guest-org'].includes(role)) {
      query.ownerType = 'organization';
      query.organizationId = new mongoose.Types.ObjectId(organization);
    }
    // 2. If user is a super-admin, allow them to filter by specific ownerType or Org
    else if (role === 'super-admin') {
      if (queryOwnerType) query.ownerType = queryOwnerType;
      if (queryOrgId)
        query.organizationId = new mongoose.Types.ObjectId(queryOrgId);
    }
    // 3. Fallback for unauthorized or general roles (restrict to public/active if needed)
    else {
      query.isActive = true;
      query.publishStatus = 'PUBLISHED';
    }

    // --- Search Logic ---
    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: rx } },
        { shortDescription: { $regex: rx } },
      ];
    }

    // --- Filters ---
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagIds.map((t) => new mongoose.Types.ObjectId(t)) };
    }

    if (categories) {
      const catIds = Array.isArray(categories) ? categories : [categories];
      query.category = {
        $in: catIds.map((c) => new mongoose.Types.ObjectId(c)),
      };
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Note: Enum in your schema is uppercase ['DRAFT', 'PUBLISHED', 'ARCHIVED']
    if (publishStatus) {
      query.publishStatus = publishStatus.toUpperCase();
    }

    // --- Execution with Mongoose-Paginate-V2 ---
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'category', select: 'title slug' },
        { path: 'tags', select: 'title slug' },
      ],
      lean: true,
    };

    const result = await Blog.paginate(query, options);

    // result will already contain the structure you want because of myCustomLabels in your Model
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('listBlogs error:', error);
    return res.status(500).json({ message: 'Failed to fetch blogs.' });
  }
};

/**
 * PATCH /blog/:id/status
 * Toggle isActive for a blog.
 */
export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: '`isActive` must be a boolean.' });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { isActive, updatedBy: req.user._id },
      { new: true },
    );

    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    return res.status(200).json({
      success: true,
      message: `Blog ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: blog,
    });
  } catch (error) {
    console.error('updateBlogStatus error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Public Blog Routes ───────────────────────────────────────────────────────

/**
 * GET /blog/view/:slug
 * View a blog by slug on the public website (increments view count).
 */
export const viewBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, isDeleted: false, isActive: true })
      .populate('category', 'title slug')
      .populate('tags', 'title slug')
      .lean();

    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    // Increment views asynchronously (fire-and-forget)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('viewBlogBySlug error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /website-blogs
 * Public: list active blogs with pagination/search.
 * Uses `x-tenant-domain` header to scope agency blogs.
 */
export const listWebsiteBlogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', tags, categories } = req.query;

    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const query = { isDeleted: false, isActive: true };

    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: rx } },
        { shortDescription: { $regex: rx } },
      ];
    }

    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagIds.map((t) => new mongoose.Types.ObjectId(t)) };
    }

    if (categories) {
      const catIds = Array.isArray(categories) ? categories : [categories];
      query.category = {
        $in: catIds.map((c) => new mongoose.Types.ObjectId(c)),
      };
    }

    const totalDocs = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .populate('category', 'title slug')
      .populate('tags', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const paginator = {
      itemCount: totalDocs,
      perPage: limit,
      pageCount: Math.ceil(totalDocs / limit),
      currentPage: page,
      slNo: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page * limit < totalDocs,
      prev: page > 1 ? page - 1 : null,
      next: page * limit < totalDocs ? page + 1 : null,
    };

    return res.status(200).json({ success: true, data: { blogs, paginator } });
  } catch (error) {
    console.error('listWebsiteBlogs error:', error);
    return res.status(500).json({ message: 'Failed to fetch blogs.' });
  }
};

/**
 * GET /website-blog-tags-filter
 * Public: return all active tags for filtering on the public website.
 */
export const websiteBlogFilterTags = async (req, res) => {
  try {
    const query = { isDeleted: false, isActive: true };

    query.ownerType = 'super-admin';

    const tags = await BlogTags.find(query).select('title slug').lean();

    return res.status(200).json({ success: true, data: tags });
  } catch (error) {
    console.error('websiteBlogFilterTags error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /website-blog-categories-filter
 * Public: return all active categories for filtering on the public website.
 */
export const websiteBlogFilterCategories = async (req, res) => {
  try {
    const query = { isDeleted: false, isActive: true };

    query.ownerType = 'super-admin';

    const categories = await BlogCategory.find(query)
      .select('title slug')
      .lean();

    return res.status(200).json({ success: true, data: categories ?? [] });
  } catch (error) {
    console.error('websiteBlogFilterCategories error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Blog Categories ──────────────────────────────────────────────────────────

/**
 * GET /blog/category
 * List all blog categories with pagination.
 */
export const listBlogCategories = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', isActive } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const query = { isDeleted: false };

    const { role, organization } = req.user;
    if (
      ['employer-admin', 'uni-admin', 'guest-org'].includes(role) &&
      organization
    ) {
      query.organizationId = organization;
    }

    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [{ title: { $regex: rx } }, { slug: { $regex: rx } }];
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const [totalDocs, activeDocs, inactiveDocs, categories] = await Promise.all(
      [
        BlogCategory.countDocuments({ ...query }),
        BlogCategory.countDocuments({ ...query, isActive: true }),
        BlogCategory.countDocuments({ ...query, isActive: false }),
        BlogCategory.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ],
    );

    const paginator = {
      itemCount: totalDocs,
      perPage: limit,
      pageCount: Math.ceil(totalDocs / limit),
      currentPage: page,
      slNo: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page * limit < totalDocs,
      prev: page > 1 ? page - 1 : null,
      next: page * limit < totalDocs ? page + 1 : null,
    };

    return res.status(200).json({
      success: true,
      data: {
        categories,
        paginator,
        counts: { all: totalDocs, active: activeDocs, inactive: inactiveDocs },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /blog/category
 */
export const createBlogCategory = async (req, res) => {
  try {
    const {
      title,
      slug,
      isActive,
      organizationId: bodyOrganizationId,
    } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
      ...(bodyOrganizationId !== undefined && {
        organizationId: bodyOrganizationId,
      }),
    };
    const { ownerType, organizationId } = resolveOwnership(req);
    data.ownerType = ownerType;
    if (organizationId) data.organizationId = organizationId;

    if (data.slug) {
      const existing = await BlogCategory.findOne({
        slug: data.slug,
        isDeleted: false,
      });
      if (existing)
        return res.status(400).json({ message: 'Slug already exists.' });
    }

    data.addedBy = req.user._id;
    const category = new BlogCategory(data);
    await category.save();

    return res.status(201).json({
      success: true,
      message: 'Blog category created successfully.',
      data: category,
    });
  } catch (error) {
    console.error('createBlogCategory error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blog/category/:id
 */
export const getBlogCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const category = await BlogCategory.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
    if (!category)
      return res.status(404).json({ message: 'Blog category not found.' });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /blog/category/:id
 */
export const updateBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      isActive,
      organizationId: bodyOrganizationId,
    } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
      ...(bodyOrganizationId !== undefined && {
        organizationId: bodyOrganizationId,
      }),
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    if (data.slug) {
      const existing = await BlogCategory.findOne({
        slug: data.slug,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (existing)
        return res.status(400).json({ message: 'Slug already exists.' });
    }

    data.updatedBy = req.user._id;
    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!category)
      return res.status(404).json({ message: 'Blog category not found.' });

    return res.status(200).json({
      success: true,
      message: 'Blog category updated successfully.',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /blog/category/:id
 */
export const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false, updatedBy: req.user._id },
      { new: true },
    );
    if (!category)
      return res.status(404).json({ message: 'Blog category not found.' });

    return res
      .status(200)
      .json({ success: true, message: 'Blog category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /blog/category/:id/status
 */
export const updateBlogCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const category = await BlogCategory.findByIdAndUpdate(
      id,
      { isActive, updatedBy: req.user._id },
      { new: true },
    );
    if (!category)
      return res.status(404).json({ message: 'Blog category not found.' });

    return res.status(200).json({
      success: true,
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Blog Tags ────────────────────────────────────────────────────────────────

/**
 * POST /blog/tag
 */
export const createBlogTag = async (req, res) => {
  console.log('req.user', req.user.organization);
  const { organization: organizationId } = req.user;
  try {
    const { title, slug, isActive } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
    };
    const { ownerType, organizationId } = resolveOwnership(req);
    data.ownerType = ownerType;
    if (organizationId) data.organizationId = organizationId;

    if (data.slug) {
      const existing = await BlogTags.findOne({
        slug: data.slug,
        isDeleted: false,
      });
      if (existing)
        return res.status(400).json({ message: 'Slug already exists.' });
    }

    data.addedBy = req.user._id;
    const tag = new BlogTags(data);
    await tag.save();

    return res.status(201).json({
      success: true,
      message: 'Blog tag created successfully.',
      data: tag,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blog/tag/:id
 */
export const getBlogTagById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tag ID.' });
    }

    const tag = await BlogTags.findOne({ _id: id, isDeleted: false }).lean();
    if (!tag) return res.status(404).json({ message: 'Blog tag not found.' });

    return res.status(200).json({ success: true, data: tag });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /blog/tag/:id
 */
export const updateBlogTag = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      isActive,
      organizationId: bodyOrganizationId,
    } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
      ...(bodyOrganizationId !== undefined && {
        organizationId: bodyOrganizationId,
      }),
    };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tag ID.' });
    }

    if (data.slug) {
      const existing = await BlogTags.findOne({
        slug: data.slug,
        _id: { $ne: id },
        isDeleted: false,
      });
      if (existing)
        return res.status(400).json({ message: 'Slug already exists.' });
    }

    data.updatedBy = req.user._id;
    const tag = await BlogTags.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!tag) return res.status(404).json({ message: 'Blog tag not found.' });

    return res.status(200).json({
      success: true,
      message: 'Blog tag updated successfully.',
      data: tag,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /blog/tag/:id
 */
export const deleteBlogTag = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tag ID.' });
    }

    const tag = await BlogTags.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false, updatedBy: req.user._id },
      { new: true },
    );
    if (!tag) return res.status(404).json({ message: 'Blog tag not found.' });

    return res
      .status(200)
      .json({ success: true, message: 'Blog tag deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blog/tag
 * List all blog tags with pagination.
 */
export const listBlogTags = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, isActive } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const query = { isDeleted: false };

    const { role, organization } = req.user;
    if (
      ['employer-admin', 'uni-admin', 'guest-org'].includes(role) &&
      organization
    ) {
      query.organizationId = organization;
    }

    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [{ title: { $regex: rx } }, { slug: { $regex: rx } }];
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const [totalDocs, activeDocs, inactiveDocs, tags] = await Promise.all([
      BlogTags.countDocuments({ ...query }),
      BlogTags.countDocuments({ ...query, isActive: true }),
      BlogTags.countDocuments({ ...query, isActive: false }),
      BlogTags.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const paginator = {
      itemCount: totalDocs,
      perPage: limit,
      pageCount: Math.ceil(totalDocs / limit),
      currentPage: page,
      slNo: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page * limit < totalDocs,
      prev: page > 1 ? page - 1 : null,
      next: page * limit < totalDocs ? page + 1 : null,
    };

    return res.status(200).json({
      success: true,
      data: {
        tags,
        paginator,
        counts: { all: totalDocs, active: activeDocs, inactive: inactiveDocs },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /blog/tag/:id/status
 */
export const updateBlogTagStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tag ID.' });
    }

    const tag = await BlogTags.findByIdAndUpdate(
      id,
      { isActive, updatedBy: req.user._id },
      { new: true },
    );
    if (!tag) return res.status(404).json({ message: 'Blog tag not found.' });

    return res.status(200).json({
      success: true,
      message: `Tag ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: tag,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Blog Comments ────────────────────────────────────────────────────────────

/**
 * POST /blog/:blogId/comment
 * Add a comment to a blog post (authenticated users).
 */
export const addBlogComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const blog = await Blog.findOne({
      _id: blogId,
      isDeleted: false,
      isActive: true,
      allowComments: true,
    });
    if (!blog)
      return res
        .status(404)
        .json({ message: 'Blog not found or comments are disabled.' });

    const comment = new BlogComments({
      post: blogId,
      user: req.user._id,
      content,
      parentComment: parentCommentId || null,
    });
    await comment.save();

    // Increment comment count on blog
    await Blog.findByIdAndUpdate(blogId, { $inc: { comments: 1 } });

    const populated = await comment.populate('user', 'fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: populated,
    });
  } catch (error) {
    console.error('addBlogComment error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /blog/:blogId/comments
 * List top-level comments for a blog (public).
 */
export const listBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    let { page = 1, limit = 20 } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID.' });
    }

    const query = { post: blogId, isDeleted: false, parentComment: null };
    const totalDocs = await BlogComments.countDocuments(query);

    const comments = await BlogComments.find(query)
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch replies for top-level comments
    const commentIds = comments.map((c) => c._id);
    const replies = await BlogComments.find({
      parentComment: { $in: commentIds },
      isDeleted: false,
    })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: 1 })
      .lean();

    // Map replies to their parent
    const repliesMap = {};
    for (const reply of replies) {
      const key = reply.parentComment.toString();
      if (!repliesMap[key]) repliesMap[key] = [];
      repliesMap[key].push(reply);
    }

    const enriched = comments.map((c) => ({
      ...c,
      replies: repliesMap[c._id.toString()] || [],
    }));

    const paginator = {
      itemCount: totalDocs,
      perPage: limit,
      pageCount: Math.ceil(totalDocs / limit),
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: page * limit < totalDocs,
    };

    return res
      .status(200)
      .json({ success: true, data: { comments: enriched, paginator } });
  } catch (error) {
    console.error('listBlogComments error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /blog/comment/:commentId
 * Soft-delete a comment (owner or admin).
 */
export const deleteBlogComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID.' });
    }

    const comment = await BlogComments.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: 'Comment not found.' });

    // Only the author or an admin can delete
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = ['super-admin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    await BlogComments.findByIdAndUpdate(commentId, { isDeleted: true });
    await Blog.findByIdAndUpdate(comment.post, { $inc: { comments: -1 } });

    return res
      .status(200)
      .json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── WordPress Import ─────────────────────────────────────────────────────────

/**
 * POST /blog/import-wordpress
 * Import blog posts in bulk from a WordPress REST API.
 */
export const importWordpressBlogs = async (req, res) => {
  try {
    const WP_BASE =
      req.body.wpBaseUrl || 'https://helpstudyabroad.com/wp-json/wp/v2';
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;

    let totalNew = 0;
    let totalUpdated = 0;
    let hasMore = true;
    let currentPage = page;

    while (hasMore) {
      const response = await axios.get(`${WP_BASE}/posts`, {
        params: {
          page: currentPage,
          per_page: pageSize,
          _embed: 1,
          status: 'publish',
        },
      });

      const wpPosts = response.data;
      if (!wpPosts || wpPosts.length === 0) {
        hasMore = false;
        break;
      }

      const bulkOps = wpPosts.map((post) => {
        const title = post.title?.rendered || '';
        const rawContent = post.content?.rendered || '';
        const rawExcerpt = post.excerpt?.rendered || '';
        const shortDescription = rawExcerpt
          .replace(/<[^>]*>?/gm, '')
          .substring(0, 500);
        const slug = post.slug || '';
        const authorName = post._embedded?.author?.[0]?.name || 'Admin';

        const blogData = {
          ownerType: 'super-admin',
          title,
          slug,
          shortDescription,
          fullDescription: rawContent,
          author: authorName,
          isActive: true,
          isDeleted: false,
          addedBy: req.user?._id || null,
          seo: {
            metaTitle: title,
            metaDescription: shortDescription.substring(0, 160),
            metaKeywords: '',
            robots: 'index,follow',
          },
        };

        return {
          updateOne: {
            filter: { slug },
            update: { $set: blogData },
            upsert: true,
          },
        };
      });

      const result = await Blog.bulkWrite(bulkOps);
      totalNew += result.upsertedCount;
      totalUpdated += result.modifiedCount;

      console.log(`Processed WP page ${currentPage}: ${wpPosts.length} blogs.`);

      if (wpPosts.length < pageSize) {
        hasMore = false;
      } else {
        currentPage++;
      }

      // Safety: max 5 pages per request to prevent timeout
      if (currentPage > page + 5) break;
    }

    return res.status(200).json({
      success: true,
      message: 'WordPress blogs imported successfully.',
      data: { totalNew, totalUpdated, lastProcessedPage: currentPage - 1 },
    });
  } catch (error) {
    if (error.response?.data?.code === 'rest_post_invalid_page_number') {
      return res.status(200).json({
        success: true,
        message: 'All WordPress pages imported.',
        data: { message: 'Reached end of available pages.' },
      });
    }
    console.error('importWordpressBlogs error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * GET /health
 */
export const getHealth = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Blog service is healthy.',
    data: { timestamp: new Date().toISOString() },
  });
};
