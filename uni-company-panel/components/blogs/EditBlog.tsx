'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft,
  Upload,
  RefreshCw,
  Search,
  Type,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useBlogStore from '@/store/blog-store';
import Image from 'next/image';
import { Editor } from './editor';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  shortDescription: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  fullDescription: z.string().optional(),
  author: z.string().optional(),
  category: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  publishStatus: z.enum(['draft', 'published', 'scheduled']),
  publishDate: z.string().optional(),
  allowComments: z.boolean().default(true),
  isActive: z.boolean().default(true),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    openGraph: z.object({
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
    }),
    twitter: z.object({
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
    }),
  }),
});

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams(); // Get ID from /dashboard/blog/edit/[id]

  const {
    updateBlog,
    getBlogDetail, // Assuming you have this to fetch single blog
    blogCategoryListData,
    blogTagListData,
    getBlogCategoryList,
    getBlogTagList,
    isLoading,
  } = useBlogStore();

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [slugLocked, setSlugLocked] = useState(true);

  const form = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      author: '',
      category: [],
      tags: [],
      publishStatus: 'draft',
      publishDate: '',
      allowComments: true,
      isActive: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        openGraph: { ogTitle: '', ogDescription: '' },
        twitter: { twitterTitle: '', twitterDescription: '' },
      },
    },
  });

  // 1. Fetch Blog Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      const resp = await getBlogDetail(id);
      if (resp?.success) {
        const blog = resp.data;
        // Populate form with existing data
        form.reset({
          ...blog,

          // Fix publishStatus (must match enum exactly)
          publishStatus: ['draft', 'published', 'scheduled'].includes(
            blog.publishStatus,
          )
            ? blog.publishStatus
            : 'draft',

          // Fix publishDate (must be string, not Date/null)
          publishDate: blog.publishDate
            ? new Date(blog.publishDate).toISOString().slice(0, 16)
            : '',

          // Keep your existing mappings
          category: blog.category?.map((c: any) => c._id || c) || [],
          tags: blog.tags?.map((t: any) => t._id || t) || [],
        });
        // Set initial previews for existing images
        setPreviews({
          bannerImage: blog.bannerImage,
          thumbnailImage: blog.thumbnailImage,
          ogImage: blog.seo?.openGraph?.ogImage,
          twitterImage: blog.seo?.twitter?.twitterImage,
        });
      }
    };
    fetchData();
    getBlogCategoryList(100, 1, '', { isActive: true });
    getBlogTagList(100, 1, '', { isActive: true });
  }, [id, getBlogDetail, form, getBlogCategoryList, getBlogTagList]);

  const handleFileChange = (name, e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const onSubmit = async (values: any) => {
    const fd = new FormData();

    Object.entries(values).forEach(([key, val]) => {
      if (key === 'seo' || key === 'category' || key === 'tags') {
        fd.append(key, JSON.stringify(val));
      } else {
        fd.append(key, val as string);
      }
    });

    Object.entries(files).forEach(([name, file]) => {
      if (file instanceof File) {
        fd.append(name, file);
      }
    });

    const resp = await updateBlog(id, fd);
    if (resp?.status === 'SUCCESS') router.push('/dashboard/blog');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => onSubmit(values),
            (errors) => console.error('VALIDATION ERRORS:', errors),
          )}
        >
          <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Edit Post
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {id}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8"
                >
                  {isLoading ? 'Saving...' : 'Update Post'}
                </Button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
            <div className="space-y-12">
              {/* Content Editor */}
              <Card className="border-none shadow-sm p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-[11px] font-bold text-slate-500">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-lg font-medium h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-[11px] font-bold text-slate-500">
                        URL Slug
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                              /blog/
                            </span>
                            <Input {...field} className="pl-14" />
                          </div>
                        </FormControl>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() =>
                            form.setValue(
                              'slug',
                              slugify(form.getValues('title')),
                            )
                          }
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullDescription" // This matches your Zod schema key
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-[11px] font-bold text-slate-500">
                        Content
                      </FormLabel>
                      <FormControl>
                        {/* Pass field.value and field.onChange to the Editor */}
                        <Editor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['bannerImage', 'thumbnailImage'].map((type) => (
                  <div key={type} className="space-y-2">
                    <Label className="uppercase text-[11px] font-bold text-slate-400">
                      {type}
                    </Label>
                    <div className="border-2 border-dashed rounded-xl h-44 bg-white relative overflow-hidden group">
                      {previews[type] && (
                        <Image
                          src={previews[type]}
                          fill
                          className="object-cover"
                          alt="Preview"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => document.getElementById(type)?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                      <input
                        type="file"
                        id={type}
                        hidden
                        onChange={(e) => handleFileChange(type, e)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Settings */}
            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="publishStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Public Visibility</FormLabel>
                          <FormDescription className="text-[10px]">
                            Visible to everyone
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Categorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {blogCategoryListData?.map((cat: any) => (
                        <Badge
                          key={cat._id}
                          variant={
                            form.watch('category').includes(cat._id)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const curr = form.getValues('category');
                            form.setValue(
                              'category',
                              curr.includes(cat._id)
                                ? curr.filter((id) => id !== cat._id)
                                : [...curr, cat._id],
                            );
                          }}
                        >
                          {cat.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </main>
        </form>
      </Form>
    </div>
  );
}
