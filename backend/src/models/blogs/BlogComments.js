/**
 * blog.js
 * @description :: Model of a database collection blog
 */

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import idValidator from 'mongoose-id-validator';

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
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null, // null = top-level comment
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
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

schema.index({ post: 1, createdAt: -1 });
schema.index({ parentComment: 1 });

// Plugins
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

// Model export
const blogComments = mongoose.model('blogComments', schema);
export default blogComments;
