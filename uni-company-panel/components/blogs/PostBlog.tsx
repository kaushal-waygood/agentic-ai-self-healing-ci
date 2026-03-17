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
            <aside className="space-y-6"></aside>
          </main>
        </form>
      </Form>
    </div>
  );
}

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import {
//   ChevronLeft,
//   Upload,
//   RefreshCw,
//   Globe,
//   Settings,
//   BarChart3,
//   Search,
//   Type,
//   Image as ImageIcon,
//   Calendar,
//   Tag,
//   MessageSquare,
//   Lock,
//   Unlock,
//   Eye,
// } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from '@/components/ui/form';
// import useBlogStore from '@/store/blog-store';

// const slugify = (text: string) =>
//   text
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, '-')
//     .replace(/[^\w-]+/g, '');

// const blogSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   slug: z.string().min(1, 'Slug is required'),
//   shortDescription: z
//     .string()
//     .min(10, 'Description must be at least 10 characters'),
//   fullDescription: z.string().optional(),
//   author: z.string().optional(),
//   category: z.array(z.string()).default([]),
//   tags: z.array(z.string()).default([]),
//   publishStatus: z.enum(['draft', 'published', 'scheduled']),
//   publishDate: z.string().optional(),
//   allowComments: z.boolean().default(true),
//   isActive: z.boolean().default(true),
//   seo: z.object({
//     metaTitle: z.string().optional(),
//     metaDescription: z.string().optional(),
//     metaKeywords: z.string().optional(),
//     openGraph: z.object({
//       ogTitle: z.string().optional(),
//       ogDescription: z.string().optional(),
//     }),
//     twitter: z.object({
//       twitterTitle: z.string().optional(),
//       twitterDescription: z.string().optional(),
//     }),
//   }),
// });

// export default function CreateBlogPage() {
//   const router = useRouter();
//   const { addBlog, getBlogCategoryList, getBlogTagList, isLoading } =
//     useBlogStore();

//   const [previews, setPreviews] = useState<Record<string, string>>({});
//   const [files, setFiles] = useState<Record<string, File>>({});
//   const [slugLocked, setSlugLocked] = useState(false);

//   const form = useForm({
//     resolver: zodResolver(blogSchema),
//     defaultValues: {
//       title: '',
//       slug: '',
//       shortDescription: '',
//       fullDescription: '',
//       author: '',
//       category: [],
//       tags: [],
//       publishStatus: 'draft',
//       publishDate: '',
//       allowComments: true,
//       isActive: true,
//       seo: {
//         metaTitle: '',
//         metaDescription: '',
//         metaKeywords: '',
//         openGraph: { ogTitle: '', ogDescription: '' },
//         twitter: { twitterTitle: '', twitterDescription: '' },
//       },
//     },
//   });

//   const title = form.watch('title');
//   useEffect(() => {
//     if (!slugLocked && title) {
//       form.setValue('slug', slugify(title), { shouldValidate: true });
//     }
//   }, [title, slugLocked, form]);

//   useEffect(() => {
//     getBlogCategoryList(100, 1, '', { isActive: true });
//     getBlogTagList(100, 1, '', { isActive: true });
//   }, [getBlogCategoryList, getBlogTagList]);

//   const handleFileChange = (
//     name: string,
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFiles((prev) => ({ ...prev, [name]: file }));
//       setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
//     }
//   };

//   const onSubmit = async (values: any) => {
//     const fd = new FormData();
//     Object.entries(values).forEach(([key, val]) => {
//       if (key === 'seo' || Array.isArray(val)) {
//         fd.append(key, JSON.stringify(val));
//       } else {
//         fd.append(key, val as string);
//       }
//     });
//     Object.entries(files).forEach(([name, file]) => fd.append(name, file));

//     const resp = await addBlog(fd);
//     if (resp?.success) router.push('/blogs');
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] pb-20">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)}>
//           {/* Header */}
//           <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-xl px-6 py-3">
//             <div className="max-w-[1400px] mx-auto flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   type="button"
//                   onClick={() => router.back()}
//                   className="text-slate-500"
//                 >
//                   <ChevronLeft className="h-4 w-4 mr-1" />
//                   Back
//                 </Button>
//                 <div className="h-6 w-[1px] bg-slate-200" />
//                 <div>
//                   <h1 className="text-sm font-semibold text-slate-900">
//                     Create New Post
//                   </h1>
//                   <p className="text-[11px] text-slate-500 font-medium">
//                     Drafting in English
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   type="button"
//                   className="hidden sm:flex"
//                 >
//                   <Eye className="h-4 w-4 mr-2" /> Preview
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={isLoading}
//                   className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200"
//                 >
//                   {isLoading ? 'Publishing...' : 'Publish Post'}
//                 </Button>
//               </div>
//             </div>
//           </header>

//           <main className="max-w-[1400px] mx-auto px-6 py-8">
//             <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
//               {/* Left Column: Content */}
//               <div className="space-y-8">
//                 {/* Primary Content Card */}
//                 <Card className="shadow-sm border-slate-200 overflow-hidden">
//                   <CardHeader className="bg-white border-b border-slate-50 pb-4">
//                     <div className="flex items-center gap-2 text-indigo-600">
//                       <Type className="h-4 w-4" />
//                       <CardTitle className="text-xs uppercase tracking-wider font-bold">
//                         Post Content
//                       </CardTitle>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-6 space-y-6">
//                     <FormField
//                       control={form.control}
//                       name="title"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             Title
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="e.g. 10 Tips for Better Web Design"
//                               className="text-xl font-bold h-14 border-slate-200 focus-visible:ring-indigo-500"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="slug"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             URL Slug
//                           </FormLabel>
//                           <div className="flex gap-2">
//                             <FormControl>
//                               <div className="relative flex-1">
//                                 <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">
//                                   /blog/
//                                 </span>
//                                 <Input
//                                   {...field}
//                                   className="pl-14 bg-slate-50 border-slate-200"
//                                   disabled={!slugLocked}
//                                   onChange={(e) => {
//                                     field.onChange(e);
//                                     setSlugLocked(true);
//                                   }}
//                                 />
//                               </div>
//                             </FormControl>
//                             <Button
//                               variant="outline"
//                               type="button"
//                               size="icon"
//                               className={
//                                 slugLocked
//                                   ? 'text-indigo-600 border-indigo-200'
//                                   : 'text-slate-400'
//                               }
//                               onClick={() => setSlugLocked(!slugLocked)}
//                             >
//                               {slugLocked ? (
//                                 <Lock className="h-4 w-4" />
//                               ) : (
//                                 <Unlock className="h-4 w-4" />
//                               )}
//                             </Button>
//                           </div>
//                           <FormDescription className="text-[11px]">
//                             Unique identifier for the URL. Click the lock to
//                             edit manually.
//                           </FormDescription>
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="shortDescription"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             Excerpt
//                           </FormLabel>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Brief summary for social sharing and search results..."
//                               className="resize-none border-slate-200 min-h-[100px]"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="fullDescription"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             Body Content
//                           </FormLabel>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Write your story here..."
//                               className="min-h-[400px] border-slate-200 focus-visible:ring-indigo-500 leading-relaxed"
//                               {...field}
//                             />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>

//                 {/* SEO Card */}
//                 <Card className="shadow-sm border-slate-200">
//                   <CardHeader className="border-b border-slate-50">
//                     <div className="flex items-center gap-2 text-indigo-600">
//                       <Search className="h-4 w-4" />
//                       <CardTitle className="text-xs uppercase tracking-wider font-bold">
//                         Search Engine Optimization
//                       </CardTitle>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-6 space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <FormField
//                         control={form.control}
//                         name="seo.metaTitle"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-xs font-bold text-slate-500 uppercase">
//                               Meta Title
//                             </FormLabel>
//                             <FormControl>
//                               <Input {...field} className="bg-slate-50" />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="seo.metaDescription"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-xs font-bold text-slate-500 uppercase">
//                               Meta Description
//                             </FormLabel>
//                             <FormControl>
//                               <Input {...field} className="bg-slate-50" />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <Separator className="bg-slate-100" />

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       <div className="space-y-3">
//                         <Label className="text-xs font-bold text-slate-500 uppercase">
//                           OG Image (1200x630)
//                         </Label>
//                         <div
//                           className="group relative border-2 border-dashed border-slate-200 rounded-xl aspect-video flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer overflow-hidden"
//                           onClick={() =>
//                             document.getElementById('ogImage')?.click()
//                           }
//                         >
//                           {previews.ogImage ? (
//                             <img
//                               src={previews.ogImage}
//                               className="w-full h-full object-cover"
//                               alt="OG Preview"
//                             />
//                           ) : (
//                             <div className="text-center p-4">
//                               <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
//                               <p className="text-[11px] font-medium text-slate-400">
//                                 Click to upload OG Image
//                               </p>
//                             </div>
//                           )}
//                           <input
//                             type="file"
//                             id="ogImage"
//                             hidden
//                             onChange={(e) => handleFileChange('ogImage', e)}
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <Label className="text-xs font-bold text-slate-500 uppercase">
//                           Twitter Image (1600x900)
//                         </Label>
//                         <div
//                           className="group relative border-2 border-dashed border-slate-200 rounded-xl aspect-video flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer overflow-hidden"
//                           onClick={() =>
//                             document.getElementById('twitterImage')?.click()
//                           }
//                         >
//                           {previews.twitterImage ? (
//                             <img
//                               src={previews.twitterImage}
//                               className="w-full h-full object-cover"
//                               alt="Twitter Preview"
//                             />
//                           ) : (
//                             <div className="text-center p-4">
//                               <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
//                               <p className="text-[11px] font-medium text-slate-400">
//                                 Click to upload Twitter Image
//                               </p>
//                             </div>
//                           )}
//                           <input
//                             type="file"
//                             id="twitterImage"
//                             hidden
//                             onChange={(e) =>
//                               handleFileChange('twitterImage', e)
//                             }
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Right Column: Sidebar */}
//               <aside className="space-y-6">
//                 {/* Status Card */}
//                 <Card className="shadow-sm border-slate-200">
//                   <CardHeader className="pb-3 border-b border-slate-50">
//                     <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
//                       <Settings className="h-4 w-4" /> Publishing
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-5 space-y-5">
//                     <FormField
//                       control={form.control}
//                       name="isActive"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50">
//                           <div className="space-y-0.5">
//                             <FormLabel className="text-xs font-bold text-slate-700">
//                               Active Status
//                             </FormLabel>
//                             <p className="text-[10px] text-slate-500 leading-tight">
//                               Visible on the website
//                             </p>
//                           </div>
//                           <FormControl>
//                             <Switch
//                               checked={field.value}
//                               onCheckedChange={field.onChange}
//                             />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="allowComments"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50">
//                           <div className="space-y-0.5">
//                             <FormLabel className="text-xs font-bold text-slate-700">
//                               Comments
//                             </FormLabel>
//                             <p className="text-[10px] text-slate-500 leading-tight">
//                               Enable user discussion
//                             </p>
//                           </div>
//                           <FormControl>
//                             <Switch
//                               checked={field.value}
//                               onCheckedChange={field.onChange}
//                             />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>

//                 {/* Media Card */}
//                 <Card className="shadow-sm border-slate-200">
//                   <CardHeader className="pb-3 border-b border-slate-50">
//                     <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
//                       <ImageIcon className="h-4 w-4" /> Featured Images
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-5 space-y-6">
//                     {['bannerImage', 'thumbnailImage'].map((type) => (
//                       <div key={type} className="space-y-2">
//                         <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
//                           {type.replace('Image', ' View')}
//                         </Label>
//                         <div
//                           className="group relative border-2 border-dashed border-slate-200 rounded-lg h-32 flex flex-col items-center justify-center bg-white hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer overflow-hidden"
//                           onClick={() =>
//                             document.getElementById(type + '-sidebar')?.click()
//                           }
//                         >
//                           {previews[type] ? (
//                             <img
//                               src={previews[type]}
//                               className="absolute inset-0 w-full h-full object-cover"
//                               alt="Preview"
//                             />
//                           ) : (
//                             <div className="text-center">
//                               <Upload className="h-5 w-5 text-slate-300 mx-auto mb-1 group-hover:text-indigo-500" />
//                               <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
//                                 Upload
//                               </span>
//                             </div>
//                           )}
//                           <input
//                             type="file"
//                             id={type + '-sidebar'}
//                             hidden
//                             onChange={(e) => handleFileChange(type, e)}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>

//                 {/* Organization Card */}
//                 <Card className="shadow-sm border-slate-200">
//                   <CardHeader className="pb-3 border-b border-slate-50">
//                     <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
//                       <Tag className="h-4 w-4" /> Taxonomy
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-5 space-y-4">
//                     {/* Category/Tags would go here as usual */}
//                     <div className="p-4 border border-dashed rounded-lg bg-slate-50 text-center">
//                       <p className="text-[11px] text-slate-400">
//                         Categories and Tags selection here
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </aside>
//             </div>
//           </main>
//         </form>
//       </Form>
//     </div>
//   );
// }
