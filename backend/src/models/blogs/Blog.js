/**
 * Blog.js
 * @description :: Mongoose model for blog posts
 */

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const myCustomLabels = {
  totalDocs: 'itemCount',
  docs: 'data',
  limit: 'perPage',
  page: 'currentPage',
  nextPage: 'next',
  prevPage: 'prev',
  totalPages: 'pageCount',
  pagingCounter: 'slNo',
  meta: 'paginator',
};
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

const { Schema } = mongoose;

const schema = new Schema(
  {
    ownerType: {
      type: String,
      enum: ['super-admin', 'organization'],
      required: true,
    },

    /** Org that owns this blog (required when ownerType = ORGANIZATION) */
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },

    bannerImage: {
      type: Schema.Types.ObjectId,
      ref: 'fileDb',
      default: null,
    },
    thumbnailImage: {
      type: Schema.Types.ObjectId,
      ref: 'fileDb',
      default: null,
    },

    // Cloudinary URLs (used when images are uploaded directly via multer-storage-cloudinary)
    bannerImageUrl: { type: String, default: null },
    thumbnailImageUrl: { type: String, default: null },

    author: { type: String, default: '' },

    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'blogCategory',
      },
    ],

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'blogTags',
      },
    ],

    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },

    publishStatus: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
    },

    publishDate: { type: Date, default: null },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },

    allowComments: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /* ─── SEO & META DATA ──────────────────────────────── */
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: { type: String, default: '' },
      canonicalUrl: { type: String, trim: true },
      robots: {
        type: String,
        enum: ['index,follow', 'noindex,follow', 'noindex,nofollow'],
        default: 'index,follow',
      },

      openGraph: {
        ogTitle: String,
        ogDescription: String,
        ogImage: {
          type: Schema.Types.ObjectId,
          ref: 'fileDb',
        },
        ogImageUrl: { type: String, default: null },
        ogType: { type: String, default: 'article' },
        ogUrl: String,
      },

      twitter: {
        twitterCard: { type: String, default: 'summary_large_image' },
        twitterTitle: String,
        twitterDescription: String,
        twitterImage: {
          type: Schema.Types.ObjectId,
          ref: 'fileDb',
        },
        twitterImageUrl: { type: String, default: null },
      },

      structuredData: {
        schemaType: { type: String, default: 'BlogPosting' },
        customSchema: { type: Schema.Types.Mixed, default: null },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ─── Hooks ─────────────────────────────────────────────── */

schema.pre('save', function (next) {
  if (this.isNew) {
    this.isDeleted = false;
    this.isActive = true;
  }
  next();
});

schema.pre('insertMany', function (next, docs) {
  if (docs && docs.length) {
    docs.forEach((doc) => {
      doc.isDeleted = false;
      doc.isActive = true;
    });
  }
  next();
});

/* ─── Indexes ────────────────────────────────────────────── */

schema.index({ slug: 1 }, { unique: true });
schema.index({ organizationId: 1, isDeleted: 1, isActive: 1 });
schema.index({ ownerType: 1, isDeleted: 1, isActive: 1 });
schema.index({ title: 'text', shortDescription: 'text' });

/* ─── Plugins ────────────────────────────────────────────── */

schema.plugin(mongoosePaginate);

const Blog = mongoose.model('Blog', schema);
export default Blog;
