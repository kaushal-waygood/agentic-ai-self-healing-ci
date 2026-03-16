/**
 * blog.js
 * @description :: Model of a database collection blog
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

const Schema = mongoose.Schema;
const schema = new Schema(
  {
    ownerType: {
      type: String,
      enum: ['super-admin', 'organization'],
      required: true,
    },

    // If org created the blog tag → required
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
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
  },
  {
    timestamps: true,
  },
);

// Pre-save hook for new documents
schema.pre('save', function (next) {
  if (this.isNew) {
    this.isDeleted = false;
    this.isActive = true;
  }
  next();
});

// Pre-insertMany hook for multiple documents
schema.pre('insertMany', function (next, docs) {
  if (docs && docs.length) {
    docs.forEach((doc) => {
      doc.isDeleted = false;
      doc.isActive = true;
    });
  }
  next();
});

// Indexes for text search
schema.index({
  title: 'text',
});

// Plugins
schema.plugin(mongoosePaginate);

// Model export
const blogTags = mongoose.model('blogTags', schema);
export default blogTags;
