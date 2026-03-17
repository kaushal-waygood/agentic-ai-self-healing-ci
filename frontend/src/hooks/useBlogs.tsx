import { useState, useCallback } from 'react';
import apiInstance from '@/services/api';

export default function useBlogs() {
  const [blogListdata, setBlogListdata] = useState<any[]>([]);
  const [blogPaginator, setBlogPaginator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [websiteBlogCategoryFilterList, setWebsiteBlogCategoryFilterList] =
    useState<any[]>([]);
  const [websiteBlogTagFilterList, setWebsiteBlogTagFilterList] = useState<
    any[]
  >([]);

  const getWebsiteBlogs = useCallback(
    async (limit = 9, page = 0, search = '', filters: any = {}) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        // Map 0-indexed React page to 1-indexed API page
        params.append('page', (page + 1).toString());
        if (search) params.append('search', search);

        if (filters.category && filters.category !== 'all') {
          params.append('categories', filters.category);
        }
        if (filters.tag && filters.tag !== 'all') {
          params.append('tags', filters.tag);
        }

        const response = await apiInstance.get(
          `/website-blogs?${params.toString()}`,
        );

        setBlogListdata(response.data?.data?.blogs || []);
        // API returns a custom paginator (e.g. { currentPage, pageCount })
        setBlogPaginator(response.data?.data?.paginator || null);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getWebsiteBlogCategoryFilters = useCallback(async () => {
    try {
      const response = await apiInstance.get('/website-blog-categories-filter');
      setWebsiteBlogCategoryFilterList(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching category filters:', error);
    }
  }, []);

  const getWebsiteBlogTagFilters = useCallback(async () => {
    try {
      const response = await apiInstance.get('/website-blog-tags-filter');
      setWebsiteBlogTagFilterList(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching tag filters:', error);
    }
  }, []);

  return {
    blogListdata,
    blogPaginator,
    isLoading,
    getWebsiteBlogs,
    websiteBlogCategoryFilterList,
    websiteBlogTagFilterList,
    getWebsiteBlogCategoryFilters,
    getWebsiteBlogTagFilters,
  };
}
