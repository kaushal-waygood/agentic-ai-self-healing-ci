'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft,
  Upload,
  RefreshCw,
  Globe,
  Settings,
  BarChart3,
  Search,
  Type,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import useBlogStore from '@/store/blog-store';
// import { slugify } from '@/lib/utils'; // Ensure this utility exists or use the helper below

// Helper if slugify is not in utils:
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

// --- Validation Schema ---
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

export default function CreateBlogPage() {
  const router = useRouter();
  const { addBlog, getBlogCategoryList, getBlogTagList, isLoading } =
    useBlogStore();

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [slugLocked, setSlugLocked] = useState(false);

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

  // Auto-generate slug from title
  const title = form.watch('title');
  useEffect(() => {
    if (!slugLocked && title) {
      form.setValue('slug', slugify(title), { shouldValidate: true });
    }
  }, [title, slugLocked, form]);

  useEffect(() => {
    getBlogCategoryList(100, 1, '', { isActive: true });
    getBlogTagList(100, 1, '', { isActive: true });
  }, []);

  const handleFileChange = (
    name: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const onSubmit = async (values: any) => {
    const fd = new FormData();

    // Append JSON fields
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'seo' || Array.isArray(val)) {
        fd.append(key, JSON.stringify(val));
      } else {
        fd.append(key, val as string);
      }
    });

    // Append Files (Keys match backend: bannerImage, thumbnailImage, ogImage, twitterImage)
    Object.entries(files).forEach(([name, file]) => {
      fd.append(name, file);
    });

    const resp = await addBlog(fd);
    if (resp?.success) router.push('/blogs');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) =>
            console.log('Validation Errors:', err),
          )}
        >
          {/* Header */}
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
                <h1 className="text-xl font-bold tracking-tight">
                  New Blog Post
                </h1>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8"
                >
                  {isLoading ? 'Publishing...' : 'Publish Blog'}
                </Button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
            {/* Left Column */}
            <div className="space-y-12">
              {/* Content Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Type className="h-5 w-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Editor
                  </h2>
                </div>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 space-y-6">
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
                              placeholder="Enter post title..."
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
                                <Input
                                  {...field}
                                  className="pl-14"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setSlugLocked(true);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setSlugLocked(false)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[11px] font-bold text-slate-500">
                            Excerpt
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief summary..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fullDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-[11px] font-bold text-slate-500">
                            Body Content
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Start writing..."
                              rows={15}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Media Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <ImageIcon className="h-5 w-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Featured Images
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['bannerImage', 'thumbnailImage'].map((type) => (
                    <div key={type} className="space-y-2">
                      <Label className="uppercase text-[11px] font-bold text-slate-400 capitalize">
                        {type.replace('Image', '')}
                      </Label>
                      <div
                        className="border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center bg-white hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => document.getElementById(type)?.click()}
                      >
                        {previews[type] ? (
                          <img
                            src={previews[type]}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Preview"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                            <span className="text-xs font-medium text-slate-400">
                              Upload {type}
                            </span>
                          </div>
                        )}
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
              </section>

              {/* SEO Section with Social Images */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Search className="h-5 w-5" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    SEO & Social
                  </h2>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="seo.metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="seo.metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      {/* OpenGraph Image */}
                      <div className="space-y-2">
                        <Label className="text-xs">
                          OG Image (Facebook/LinkedIn)
                        </Label>
                        <div
                          className="border rounded-lg h-32 flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden"
                          onClick={() =>
                            document.getElementById('ogImage')?.click()
                          }
                        >
                          {previews.ogImage ? (
                            <img
                              src={previews.ogImage}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-slate-300" />
                          )}
                        </div>
                        <input
                          type="file"
                          id="ogImage"
                          hidden
                          onChange={(e) => handleFileChange('ogImage', e)}
                        />
                      </div>

                      {/* Twitter Image */}
                      <div className="space-y-2">
                        <Label className="text-xs">Twitter Image</Label>
                        <div
                          className="border rounded-lg h-32 flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden"
                          onClick={() =>
                            document.getElementById('twitterImage')?.click()
                          }
                        >
                          {previews.twitterImage ? (
                            <img
                              src={previews.twitterImage}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-slate-300" />
                          )}
                        </div>
                        <input
                          type="file"
                          id="twitterImage"
                          hidden
                          onChange={(e) => handleFileChange('twitterImage', e)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="publishStatus"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-2"
                      >
                        {['draft', 'published', 'scheduled'].map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <RadioGroupItem value={status} id={status} />
                            <Label
                              htmlFor={status}
                              className="capitalize cursor-pointer"
                            >
                              {status}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <div className="flex justify-between items-center">
                          <Label>Public</Label>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allowComments"
                      render={({ field }) => (
                        <div className="flex justify-between items-center">
                          <Label>Comments</Label>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Words</span>
                    <span className="font-mono text-indigo-400">
                      {form
                        .watch('fullDescription')
                        ?.trim()
                        .split(/\s+/)
                        .filter(Boolean).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Read Time</span>
                    <span className="font-mono text-indigo-400">
                      ~
                      {Math.ceil(
                        (form.watch('fullDescription')?.split(' ').length ||
                          0) / 200,
                      )}{' '}
                      min
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                    type="submit"
                  >
                    Save Progress
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </main>
        </form>
      </Form>
    </div>
  );
}
