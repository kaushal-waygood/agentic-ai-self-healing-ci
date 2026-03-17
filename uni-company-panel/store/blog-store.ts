import { create } from 'zustand';
import { normalizeListOptions } from '@/lib/blogTools';
import { blogDefaultValues } from '@/lib/blogDefaultValues';
import { toast } from 'sonner';
import apiInstance from '@/services/api';

// --- Interfaces ---

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string[];
  tags: string[];
  bannerImageUrl?: string;
  thumbnailImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  fullDescription?: string;
  shortDescription?: string;
  seo?: any;
  allowComments?: boolean;
}

export interface ICategory {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
}

export interface ITag {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
}

export interface IPaginator {
  itemCount: number;
  totalItems: number;
  page: number;
  rowsPerPage: number;
  slNo?: number;
}

interface BlogState {
  blogListdata: IBlog[];
  blogPaginator?: IPaginator;
  blogDetailisData: IBlog;
  blogDetailisDisabled: boolean;
  blogDetailisLoading: boolean;
  isLoading: boolean;
  disabled: boolean;
  isBlogDeleteLoading: boolean;
  blogDeleteDisabled: boolean;
  blogDeleteData: any;
  isBlogStatusLoading: boolean;
  blogCategoryListData: ICategory[];
  blogCategoryPaginator?: IPaginator;
  isBlogCategoryStatusLoading: boolean;
  blogTagListData: ITag[];
  blogTagPaginator?: IPaginator;
  isBlogTagStatusLoading: boolean;
  websiteBlogCategoryFilterList: ICategory[];
  websiteBlogTagFilterList: ITag[];
}

interface BlogActions {
  addBlog: (formData: FormData) => Promise<any>;
  updateBlog: (id: string, formData: FormData) => Promise<any>;
  getBlogList: (
    rowsPerPage?: number,
    page?: number,
    search?: string,
    query?: any,
  ) => Promise<any>;
  updateBlogStatus: (id: string, body: { isActive: boolean }) => Promise<any>;
  getBlogDetail: (id: string) => Promise<any>;
  getDeleteBlog: (id: string) => Promise<any>;
  getBlogBySlug: (slug: string) => Promise<any>;
  addBlogCategory: (data: any) => Promise<any>;
  getBlogCategoryList: (
    rowsPerPage?: number,
    page?: number,
    search?: string,
    query?: any,
  ) => Promise<any>;
  getBlogCategoryDetail: (id: string) => Promise<any>;
  updateBlogCategory: (id: string, data: any) => Promise<any>;
  updateBlogCategoryStatus: (
    id: string,
    data: { isActive: boolean },
  ) => Promise<any>;
  deleteBlogCategory: (id: string) => Promise<any>;
  addBlogTag: (data: any) => Promise<any>;
  getBlogTagList: (
    rowsPerPage?: number,
    page?: number,
    search?: string,
    query?: any,
  ) => Promise<any>;
  getBlogTagDetail: (id: string) => Promise<any>;
  updateBlogTag: (id: string, data: any) => Promise<any>;
  updateBlogTagStatus: (
    id: string,
    data: { isActive: boolean },
  ) => Promise<any>;
  deleteBlogTag: (id: string) => Promise<any>;
  getWebsiteBlogCategoryFilters: () => Promise<any>;
  getWebsiteBlogTagFilters: () => Promise<any>;
  getWebsiteBlogs: (
    rowsPerPage?: number,
    page?: number,
    search?: string,
    query?: any,
    tenantDomain?: string | null,
  ) => Promise<any>;
}

type BlogStore = BlogState & BlogActions;

// --- Store Implementation ---

const useBlogStore = create<BlogStore>((set, get) => ({
  blogListdata: [],
  blogDetailisData: blogDefaultValues as IBlog,
  blogDetailisDisabled: false,
  blogDetailisLoading: false,
  isLoading: false,
  disabled: false,
  isBlogDeleteLoading: false,
  blogDeleteDisabled: false,
  blogDeleteData: null,
  isBlogStatusLoading: false,
  blogCategoryListData: [],
  blogCategoryPaginator: undefined,
  isBlogCategoryStatusLoading: false,
  blogTagListData: [],
  blogTagPaginator: undefined,
  isBlogTagStatusLoading: false,
  websiteBlogCategoryFilterList: [],
  websiteBlogTagFilterList: [],

  // --- Main Blog Actions ---

  addBlog: async (formData) => {
    set({ isLoading: true, disabled: true });
    try {
      const { data: resp } = await apiInstance.post('/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resp?.status === 'SUCCESS') {
        toast.success(resp.message);
        set({ blogListdata: [resp.data, ...get().blogListdata] });
      } else {
        toast.error(resp.message);
      }
      return resp;
    } catch (error) {
      console.error('Error adding blog:', error);
      throw error;
    } finally {
      set({ isLoading: false, disabled: false });
    }
  },

  updateBlog: async (id, formData) => {
    set({ isLoading: true, disabled: true });
    try {
      const { data: resp } = await apiInstance.put(`/blog/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resp?.status === 'SUCCESS') {
        toast.success(resp.message);
        const updatedItem = resp.data?.lastData || resp.data;
        set({
          blogListdata: get().blogListdata.map((blog) =>
            blog._id === id ? updatedItem : blog,
          ),
        });
      } else {
        toast.error(resp.message);
      }
      return resp;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    } finally {
      set({ isLoading: false, disabled: false });
    }
  },

  getBlogList: async (rowsPerPage = 10, page = 1, search = '', query = {}) => {
    set({ isLoading: true, disabled: true });
    try {
      const queryString = normalizeListOptions(
        rowsPerPage,
        page,
        search,
        query,
      );

      const { data: resp } = await apiInstance.get(`/blogs?${queryString}`);
      set({
        blogListdata: resp?.data?.data || [],
        blogPaginator: resp?.data?.paginator,
      });
      return resp;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ isLoading: false, disabled: false });
    }
  },

  updateBlogStatus: async (id, body) => {
    set({ isBlogStatusLoading: true });
    try {
      const { data: resp } = await apiInstance.patch(
        `/blog/${id}/status`,
        body,
      );
      if (resp?.status === 'SUCCESS') {
        set({
          blogListdata: get().blogListdata.map((blog) =>
            blog._id === id ? { ...blog, isActive: body.isActive } : blog,
          ),
        });
        toast.success(resp.message);
      } else {
        toast.error(resp.message);
      }
      return resp;
    } catch (error) {
      console.error('Error updating status:', error);
      return error;
    } finally {
      set({ isBlogStatusLoading: false });
    }
  },

  getBlogDetail: async (id) => {
    set({ blogDetailisLoading: true, blogDetailisDisabled: true });
    try {
      const { data: resp } = await apiInstance.get(`/blog/${id}`);
      set({ blogDetailisData: resp?.data });
      return resp;
    } finally {
      set({ blogDetailisLoading: false, blogDetailisDisabled: false });
    }
  },

  getDeleteBlog: async (id) => {
    set({ isBlogDeleteLoading: true, blogDeleteDisabled: true });
    try {
      const { data: resp } = await apiInstance.delete(`/blog/${id}`);
      if (resp?.status === 'SUCCESS') {
        set({
          blogListdata: get().blogListdata.filter((blog) => blog._id !== id),
        });
        toast.success(resp.message);
      }
      return resp;
    } finally {
      set({ isBlogDeleteLoading: false, blogDeleteDisabled: false });
    }
  },

  getBlogBySlug: async (slug) => {
    set({ blogDetailisLoading: true });
    try {
      const { data: resp } = await apiInstance.get(`/blog/view/${slug}`);
      set({ blogDetailisData: resp?.data });
      return resp;
    } finally {
      set({ blogDetailisLoading: false });
    }
  },

  // --- Category Actions ---

  addBlogCategory: async (data) => {
    try {
      const { data: resp } = await apiInstance.post('/blog/category', data);
      if (resp.status === 'SUCCESS') {
        toast.success(resp.message);
        set({
          blogCategoryListData: [resp.data, ...get().blogCategoryListData],
        });
      }

      return resp;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getBlogCategoryList: async (
    rowsPerPage = 10,
    page = 1,
    search = '',
    query = {},
  ) => {
    try {
      const queryString = normalizeListOptions(
        rowsPerPage,
        page,
        search,
        query,
      );

      // const { data: resp } = await apiInstance.get(
      //   `/blog/category?${queryString}`,
      // );
      const { data: resp } = await apiInstance.get(`/blog/category`);

      set({
        blogCategoryListData: resp?.data?.categories || [],
        // blogCategoryPaginator: resp?.data?.paginator,
      });

      return resp;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getBlogCategoryDetail: async (id) => {
    const { data } = await apiInstance.get(`/blog/category/${id}`);
    return data;
  },

  updateBlogCategory: async (id, data) => {
    const { data: resp } = await apiInstance.put(`/blog/category/${id}`, data);
    if (resp.status === 'SUCCESS') toast.success(resp.message);
    return resp;
  },

  updateBlogCategoryStatus: async (id, data) => {
    set({ isBlogCategoryStatusLoading: true });
    try {
      const { data: resp } = await apiInstance.patch(
        `/blog/category/${id}/status`,
        data,
      );
      if (resp.status === 'SUCCESS') {
        toast.success(resp.message);
        set({
          blogCategoryListData: get().blogCategoryListData.map((item) =>
            item._id === id ? { ...item, isActive: data.isActive } : item,
          ),
        });
      }
      return resp;
    } finally {
      set({ isBlogCategoryStatusLoading: false });
    }
  },

  deleteBlogCategory: async (id) => {
    const { data: resp } = await apiInstance.delete(`/blog/category/${id}`);
    if (resp.status === 'SUCCESS') {
      toast.success(resp.message);
      set({
        blogCategoryListData: get().blogCategoryListData.filter(
          (item) => item._id !== id,
        ),
      });
    }
    return resp;
  },

  // --- Tag Actions ---

  addBlogTag: async (data) => {
    const { data: resp } = await apiInstance.post('/blog/tag', data);
    if (resp.status === 'SUCCESS') {
      toast.success(resp.message);
      set({ blogTagListData: [resp.data, ...get().blogTagListData] });
    }
    return resp;
  },

  getBlogTagList: async (
    rowsPerPage = 10,
    page = 1,
    search = '',
    query = {},
  ) => {
    const qs = normalizeListOptions(rowsPerPage, page, search, query);
    // const { data: resp } = await apiInstance.get(`/blog/tag?${qs}`);
    const { data: resp } = await apiInstance.get(`/blog/tag`);
    console.log('tag response', resp);
    set({
      blogTagListData: resp?.data?.tags || [],
      // blogTagPaginator: resp?.data?.paginator,
    });
    return resp;
  },

  getBlogTagDetail: async (id) => {
    const { data } = await apiInstance.get(`/blog/tag/${id}`);
    return data;
  },

  updateBlogTag: async (id, data) => {
    const { data: resp } = await apiInstance.put(`/blog/tag/${id}`, data);
    if (resp.status === 'SUCCESS') toast.success(resp.message);
    return resp;
  },

  updateBlogTagStatus: async (id, data) => {
    set({ isBlogTagStatusLoading: true });
    try {
      const { data: resp } = await apiInstance.patch(
        `/blog/tag/${id}/status`,
        data,
      );
      if (resp.status === 'SUCCESS') {
        toast.success(resp.message);
        set({
          blogTagListData: get().blogTagListData.map((item) =>
            item._id === id ? { ...item, isActive: data.isActive } : item,
          ),
        });
      }
      return resp;
    } finally {
      set({ isBlogTagStatusLoading: false });
    }
  },

  deleteBlogTag: async (id) => {
    const { data: resp } = await apiInstance.delete(`/blog/tag/${id}`);
    if (resp.status === 'SUCCESS') {
      toast.success(resp.message);
      set({
        blogTagListData: get().blogTagListData.filter(
          (item) => item._id !== id,
        ),
      });
    }
    return resp;
  },

  // --- Website (Public) Actions ---

  getWebsiteBlogCategoryFilters: async () => {
    const { data: resp } = await apiInstance.get(
      '/website-blog-categories-filter',
    );
    set({ websiteBlogCategoryFilterList: resp?.data || [] });
    return resp;
  },

  getWebsiteBlogTagFilters: async () => {
    const { data: resp } = await apiInstance.get('/website-blog-tags-filter');
    set({ websiteBlogTagFilterList: resp?.data || [] });
    return resp;
  },

  getWebsiteBlogs: async (
    rowsPerPage = 10,
    page = 1,
    search = '',
    query = {},
    tenantDomain = null,
  ) => {
    set({ isLoading: true });
    try {
      const qs = normalizeListOptions(rowsPerPage, page, search, query);
      const config = tenantDomain
        ? { headers: { 'x-tenant-domain': tenantDomain } }
        : {};
      const { data: resp } = await apiInstance.get(
        `/website-blogs?${qs}`,
        config,
      );
      set({
        blogListdata: resp?.data?.data || [],
        blogPaginator: resp?.data?.paginator,
      });
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useBlogStore;
