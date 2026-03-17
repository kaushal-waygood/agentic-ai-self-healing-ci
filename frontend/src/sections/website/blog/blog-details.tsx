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
  category?: { title: string }[];
  tags?: { title: string }[];
};

type BlogsAllDetailProps = {
  initialBlogDetails?: BlogDetails | null;
};

export default function BlogsAllDetail({
  initialBlogDetails,
}: BlogsAllDetailProps) {
  const blog = initialBlogDetails;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  const descriptionSource =
    blog?.fullDescription || blog?.description || blog?.shortDescription || '';

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress((scrolled / height) * 100);
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  const extractHeadings = (html: string) => {
    if (typeof window === 'undefined' || !html)
      return { updatedHtml: '', headingsArray: [] };
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');
    const headingsArray = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      return {
        id,
        text: (heading as HTMLElement).innerText || '',
        tagName: heading.tagName.toLowerCase() as HeadingItem['tagName'],
      };
    });
    return { updatedHtml: doc.body.innerHTML, headingsArray };
  };

  useEffect(() => {
    if (!descriptionSource) return;
    const { updatedHtml, headingsArray } = extractHeadings(descriptionSource);
    setDescriptionHtml(updatedHtml);
    setHeadings(headingsArray);
  }, [descriptionSource]);

  useEffect(() => {
    if (!descriptionHtml) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0.1 },
    );
    document
      .querySelectorAll('h1, h2, h3')
      .forEach((el) => observer.observe(el));
    return () =>
      document
        .querySelectorAll('h1, h2, h3')
        .forEach((el) => observer.unobserve(el));
  }, [descriptionHtml]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offset = 100;
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
  };

  if (!blog) return <NotFound />;

  return (
    <div className="bg-[#FCFCFC] min-h-screen font-sans">
      <div
        className="fixed top-0 left-0 h-1 bg-orange-500 z-[100] transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* HERO SECTION */}
      <div
        className="relative h-[300px] md:h-[500px] flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${blog.bannerImageUrl || blog.thumbnailImageUrl || '/logo/logo.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              <span className="h-[2px] w-8 bg-orange-400" />
              Blog Post
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
              {blog.title}
            </h1>
            <div className="flex gap-6 flex-wrap text-gray-200">
              <Meta icon="solar:user-bold" value={blog.author} />
              <Meta
                icon="solar:calendar-bold"
                value={fDateTime(blog.createdAt)}
              />
              <Meta icon="solar:eye-bold" value={`${blog.views} views`} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-screen-xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Side Sticky */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h6 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Iconify
                  icon="solar:list-bold"
                  width={16}
                  className="text-orange-500"
                />
                Table of Contents
              </h6>
              <nav className="space-y-4">
                {headings.map((heading) => (
                  <div
                    key={heading.id}
                    onClick={() => scrollToSection(heading.id)}
                    className={cn(
                      'group cursor-pointer text-sm leading-snug transition-all duration-300 flex gap-3',
                      activeHeading === heading.id
                        ? 'text-orange-600 font-bold'
                        : 'text-gray-500',
                    )}
                  >
                    <span
                      className={cn(
                        'w-1 rounded-full transition-all',
                        activeHeading === heading.id
                          ? 'bg-orange-500'
                          : 'bg-transparent group-hover:bg-gray-200',
                      )}
                    />
                    <span
                      className={cn(
                        heading.tagName === 'h3' && 'pl-4 text-[13px]',
                      )}
                    >
                      {heading.text}
                    </span>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <article className="lg:col-span-9 bg-white shadow-sm rounded-3xl border border-gray-50 overflow-hidden">
            <div className="p-6 md:p-12">
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.category?.map((cat, i) => (
                  <Badge
                    key={i}
                    className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-none px-4 py-1"
                  >
                    {cat?.title}
                  </Badge>
                ))}
              </div>

              <div
                ref={contentRef}
                className="prose prose-orange max-w-none 
                  text-gray-800 leading-[1.8] text-lg
                  [&_p]:mb-8
                  [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:tracking-tight
                  [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-10 [&_h3]:mb-4
                  [&_img]:w-full [&_img]:rounded-2xl [&_img]:my-10 [&_img]:shadow-lg
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3
                  [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:bg-orange-50/50 [&_blockquote]:p-8 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-xl"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />

              <div className="mt-16 pt-10 border-t border-gray-100 flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-sm text-gray-500 hover:text-orange-600 cursor-pointer"
                    >
                      #{tag?.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
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
    <div className="flex items-center gap-2 px-1">
      <Iconify icon={icon} width={18} className="text-orange-400" />
      <span className="text-sm font-medium">{value || '-'}</span>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-40 text-center bg-white h-screen">
      <Iconify
        icon="solar:shield-warning-bold-duotone"
        width={80}
        className="text-orange-200 mx-auto mb-6"
      />
      <h2 className="text-3xl font-bold text-gray-900">Post Not Found</h2>
      <p className="text-gray-500 mt-2">
        The article you're looking for might have been moved.
      </p>
    </div>
  );
}
