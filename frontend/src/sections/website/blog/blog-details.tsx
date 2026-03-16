'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Iconify } from '@/components/iconify';
import { fDateTime } from '@/utils/format-time';

// --- Types ---
type HeadingItem = {
  id: string;
  text: string;
  tagName: 'h1' | 'h2' | 'h3';
};

type BlogDetails = {
  _id?: string;
  title?: string;
  author?: string;
  createdAt?: string | number | Date;
  views?: number;
  bannerImageUrl?: string;
  thumbnailImageUrl?: string;
  shortDescription?: string;
  description?: string;
  fullDescription?: string;
  category?: string[];
  tags?: string[];
};

type BlogsAllDetailProps = {
  initialBlogDetails?: BlogDetails | null;
};

export default function BlogsAllDetail({
  initialBlogDetails,
}: BlogsAllDetailProps) {
  // Use null as fallback to distinguish between "Loading" and "No data"
  const blog = initialBlogDetails;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');

  const descriptionSource =
    blog?.fullDescription || blog?.description || blog?.shortDescription || '';

  // 1. Extract headings from HTML string
  const extractHeadings = (html: string) => {
    if (typeof window === 'undefined' || !html)
      return { updatedHtml: '', headingsArray: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');

    const headingsArray = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      const text =
        (heading as HTMLElement).innerText || heading.textContent || '';

      return {
        id,
        text,
        tagName: heading.tagName.toLowerCase() as HeadingItem['tagName'],
      };
    });

    return {
      updatedHtml: doc.body.innerHTML,
      headingsArray,
    };
  };

  // 2. Setup content and TOC
  useEffect(() => {
    if (!descriptionSource) return;
    const { updatedHtml, headingsArray } = extractHeadings(descriptionSource);
    setDescriptionHtml(updatedHtml);
    setHeadings(headingsArray);
  }, [descriptionSource]);

  // 3. Intersection Observer for active heading
  useEffect(() => {
    if (!descriptionHtml) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0.1 },
    );

    const elements = document.querySelectorAll('h1, h2, h3');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, [descriptionHtml]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 100;
    const position =
      element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: position, behavior: 'smooth' });
  };

  // --- Render Logic ---

  if (!blog) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <Iconify
          icon="solar: Danger-broken"
          width={48}
          className="text-gray-400 mb-2"
        />
        <h5 className="text-xl font-semibold text-gray-600">
          Blog post not found
        </h5>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO SECTION */}
      <div
        className="relative bg-cover bg-center h-[260px] md:h-[420px]"
        style={{
          backgroundImage: `url(${blog.bannerImageUrl || blog.thumbnailImageUrl || '/logo/logo.png'})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex items-end pb-8 text-white max-w-screen-lg mx-auto px-4">
          <div className="w-full">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="flex gap-4 flex-wrap opacity-90">
              <Meta icon="solar:user-outline" value={blog.author} />
              <Meta
                icon="solar:calendar-outline"
                value={fDateTime(blog.createdAt)}
              />
              <Meta icon="solar:eye-outline" value={blog.views} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-screen-lg mx-auto px-4 -mt-10 pb-20">
        <div className="bg-white shadow-xl rounded-2xl p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* STICKY TOC */}
            <aside className="hidden lg:block col-span-1">
              <div className="sticky top-24">
                <h6 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                  On this page
                </h6>
                <div className="space-y-3 border-l-2 border-gray-100 pl-4">
                  {headings.map((heading) => (
                    <p
                      key={heading.id}
                      onClick={() => scrollToSection(heading.id)}
                      className={cn(
                        'cursor-pointer text-sm transition-all hover:text-primary',
                        heading.tagName === 'h3' && 'pl-3 text-xs',
                        activeHeading === heading.id
                          ? 'text-primary font-bold border-l-2 border-primary -ml-[18px] pl-[16px]'
                          : 'text-gray-500 font-medium',
                      )}
                    >
                      {heading.text}
                    </p>
                  ))}
                </div>
              </div>
            </aside>

            {/* CONTENT AREA */}
            <article className="col-span-1 lg:col-span-3">
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.category?.map((cat, i) => (
                  <Badge key={i} variant="outline" className="text-gray-500">
                    #{cat?.title}
                  </Badge>
                ))}
              </div>

              <Separator className="mb-8" />

              <div
                ref={contentRef}
                className="prose prose-lg max-w-none 
                  text-gray-700 leading-relaxed
                  [&_p]:mb-6
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-8 [&_h3]:mb-3
                  [&_img]:w-full [&_img]:rounded-xl [&_img]:my-8 [&_img]:shadow-sm
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />

              <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                {blog.tags?.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-gray-500">
                    #{tag?.title}
                  </Badge>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({
  icon,
  value,
}: {
  icon: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
      <Iconify icon={icon} width={16} />
      <p className="text-xs font-medium">{value || '-'}</p>
    </div>
  );
}
