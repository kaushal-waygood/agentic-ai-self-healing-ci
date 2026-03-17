'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft,
  Upload,
  Search,
  Type,
  Image as ImageIcon,
  Tag,
  Lock,
  Unlock,
  Eye,
  Check,
  ChevronsUpDown,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import useBlogStore from '@/store/blog-store';
import { Editor } from './editor';

// --- Validation Schema ---
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  fullDescription: z.string().optional(),
  category: z.array(z.string()).min(1, 'Select at least one category'),
  tags: z.array(z.string()).default([]),
  allowComments: z.boolean().default(true),
  isActive: z.boolean().default(true),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
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
  const {
    addBlog,
    getBlogCategoryList,
    getBlogTagList,
    blogCategoryListData,
    blogTagListData,
    isLoading,
  } = useBlogStore();

  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  const form = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      fullDescription: '',
      category: [],
      tags: [],
      allowComments: true,
      isActive: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        openGraph: { ogTitle: '', ogDescription: '' },
        twitter: { twitterTitle: '', twitterDescription: '' },
      },
    },
  });

  useEffect(() => {
    getBlogCategoryList(100, 1, '', { isActive: true });
    getBlogTagList(100, 1, '', { isActive: true });
  }, [getBlogCategoryList, getBlogTagList]);

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
    Object.entries(values).forEach(([key, val]) => {
      fd.append(
        key,
        typeof val === 'object' ? JSON.stringify(val) : String(val),
      );
    });
    Object.entries(files).forEach(([name, file]) => fd.append(name, file));
    console.log('fb', fd);
    const resp = await addBlog(fd);
    console.log('add');
    if (resp?.success) router.push('/blogs');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Form {...form}>
        {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) =>
            console.log('Validation Errors:', errors),
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 py-3">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div className="h-6 w-[1px] bg-slate-200" />
                <h1 className="text-sm font-semibold">New Blog Post</h1>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </header>

          <main className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Left Content Area */}
              <div className="space-y-8">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="bg-white border-b border-slate-50">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-xs tracking-wider">
                      <Type className="h-4 w-4" /> Editor Content
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Post title..."
                              className="text-lg font-medium h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <CardContent className=" space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 ">
                        {['bannerImage', 'thumbnailImage'].map((type) => (
                          <div key={type} className="space-y-2 ">
                            <Label className="text-xs font-bold  uppercase">
                              {type.replace('Image', '')}
                            </Label>
                            <div
                              className="group  relative border-2 border-dashed rounded-lg h-24 flex items-center justify-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer overflow-hidden"
                              onClick={() =>
                                document.getElementById(type)?.click()
                              }
                            >
                              {previews[type] ? (
                                <img
                                  src={previews[type]}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  alt="Preview"
                                />
                              ) : (
                                <Upload className="h-5 w-5 text-slate-300 group-hover:text-indigo-500" />
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
                      </CardContent>
                    </div>

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            {/* Pass field.value and field.onChange to the Editor */}
                            <Editor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-6">
                {/* Taxonomy Dropdowns Card */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-3 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Taxonomy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-6">
                    {/* Categories Dropdown */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                            Categories
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    'justify-between text-left font-normal',
                                    !field.value.length &&
                                      'text-muted-foreground',
                                  )}
                                >
                                  {field.value.length > 0
                                    ? `${field.value.length} selected`
                                    : 'Select categories...'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[330px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Search categories..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No category found.
                                  </CommandEmpty>
                                  {/* Search results in the dropdown */}
                                  <CommandGroup>
                                    {blogCategoryListData?.map((cat: any) => (
                                      <CommandItem
                                        key={cat._id}
                                        onSelect={() => {
                                          const newValue = field.value.includes(
                                            cat._id,
                                          )
                                            ? field.value.filter(
                                                (v) => v !== cat._id,
                                              )
                                            : [...field.value, cat._id];
                                          form.setValue('category', newValue);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value.includes(cat._id)
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />

                                        {cat.title}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {/* Selected items displayed as badges */}
                          <div className="flex flex-wrap gap-1 mt-2 ">
                            {field.value.map((id) => {
                              const cat = blogCategoryListData?.find(
                                (c: any) => c._id === id,
                              );
                              return cat ? (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className=" bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                >
                                  {cat.title}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                      form.setValue(
                                        'category',
                                        field.value.filter((v) => v !== id),
                                      )
                                    }
                                  />
                                </Badge>
                              ) : null;
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags Dropdown */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2 border-t border-slate-50">
                          <FormLabel className="text-xs font-bold text-slate-500 uppercase">
                            Tags
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="justify-between text-left font-normal"
                                >
                                  {field.value.length > 0
                                    ? `${field.value.length} tags selected`
                                    : 'Select tags...'}
                                  <Tag className="ml-2 h-3 w-3 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[330px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Search tags..." />
                                <CommandList>
                                  <CommandEmpty>No tags found.</CommandEmpty>
                                  <CommandGroup>
                                    {blogTagListData?.map((tag: any) => (
                                      <CommandItem
                                        key={tag._id}
                                        onSelect={() => {
                                          const newValue =
                                            field.value?.includes(tag._id)
                                              ? field.value.filter(
                                                  (v) => v !== tag._id,
                                                )
                                              : [...field.value, tag._id];
                                          form.setValue('tags', newValue);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value?.includes(tag._id)
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                        {tag.title}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value?.map((id) => {
                              const tag = blogTagListData?.find(
                                (t: any) => t._id === id,
                              );
                              return tag ? (
                                <Badge
                                  key={id}
                                  variant="outline"
                                  className=" border-slate-200 text-slate-600"
                                >
                                  #{tag.title}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* SEO Card (Same as previous) */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase font-bold text-indigo-600">
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-4 border-t">
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
              </aside>
            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}
