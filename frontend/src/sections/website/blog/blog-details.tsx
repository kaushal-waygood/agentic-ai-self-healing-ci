'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fDateTime } from '@/utils/format-time';
import {
  User,
  CalendarDays,
  Eye,
  List,
  ArrowLeft,
  ShieldAlert,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Check,
  Instagram,
} from 'lucide-react';
import useBlogs from '@/hooks/useBlogs';

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

  // 1. Bring in your custom hook
  const { getWebsiteBlogs, blogListdata } = useBlogs();

  // 2. Fetch recent blogs when the page loads
  useEffect(() => {
    // Fetch 4 items (just in case the current blog is one of them, we still have 3 to show)
    // Assuming signature is: getWebsiteBlogs(limit, pageIndex, search, filters)
    getWebsiteBlogs(4, 0, '', { isActive: true });
  }, []);

  // 3. Filter out the currently viewed blog and grab the first 3
  const recentBlogs = blogListdata
    ?.filter((b) => b._id !== blog?._id)
    .slice(0, 3);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  const descriptionSource =
    blog?.fullDescription || blog?.description || blog?.shortDescription || '';

  // Reading Progress Tracker
  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress((scrolled / height) * 100);
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Extract Headings for TOC
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
    const sanitizedSource = descriptionSource.replace(/&nbsp;/g, ' ');
    const { updatedHtml, headingsArray } = extractHeadings(sanitizedSource);
    setDescriptionHtml(updatedHtml);
    setHeadings(headingsArray);
  }, [descriptionSource]);

  // Highlight Active TOC Item
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
    <div className="bg-[#f8f9fc] min-h-screen font-sans text-slate-900 pb-24 selection:bg-blue-100 selection:text-blue-700">
      {/* READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 h-1 bg-blue-600 z-[100] transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* TOP NAVIGATION BAR */}
      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>
      </div>

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-screen-xl mx-auto px-4">
        {/* HEADER SECTION */}
        <div className="mb-8 md:mb-12 w-full">
          {/* 1. Title Area (Constrained width for readability) */}
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.category?.map((cat, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-md"
                >
                  {cat?.title}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.2] tracking-tight">
              {blog.title}
            </h1>
          </div>

          {/* 2. Meta & Share Row (Full width to push share icons to the far right) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <Meta
                icon={<User className="h-4 w-4 text-blue-500" />}
                value={blog.author || 'ZobsAI Team'}
              />
              <Meta
                icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
                value={fDateTime(blog.createdAt)}
              />
              <Meta
                icon={<Eye className="h-4 w-4 text-blue-500" />}
                value={`${blog.views || 0} views`}
              />
            </div>

            {/* TOP SHARE BUTTONS */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500 hidden sm:block">
                Share:
              </span>
              <ShareButtons title={blog.title || ''} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR: TABLE OF CONTENTS */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h6 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                <List className="h-4 w-4 text-blue-600" />
                Table of Contents
              </h6>

              <nav className="space-y-1 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-slate-100">
                {headings.map((heading) => (
                  <div
                    key={heading.id}
                    onClick={() => scrollToSection(heading.id)}
                    className={cn(
                      'relative group cursor-pointer text-[13px] leading-relaxed transition-all duration-200 py-1.5 pl-6',
                      activeHeading === heading.id
                        ? 'text-blue-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900',
                      heading.tagName === 'h3' && 'pl-9 text-[12px]',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition-all duration-200',
                        activeHeading === heading.id
                          ? 'bg-blue-600 ring-4 ring-blue-50'
                          : 'bg-slate-200 group-hover:bg-blue-300',
                      )}
                    />
                    {heading.text}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* ARTICLE CONTENT CARD */}
          <article className="lg:col-span-9 bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
            {(blog.bannerImageUrl || blog.thumbnailImageUrl) && (
              <div className="w-full h-[250px] md:h-[400px] bg-slate-100 border-b border-slate-100">
                <img
                  src={blog.bannerImageUrl || blog.thumbnailImageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6 md:p-10 lg:p-12">
              <div
                ref={contentRef}
                className="prose max-w-none break-words
                text-slate-700 leading-relaxed text-[16px] md:text-[17px]
                
                [&_p]:mb-6
                
                [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:tracking-tight [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-8 [&_h3]:mb-4
                
                [&_img]:w-full [&_img]:rounded-xl [&_img]:my-8 [&_img]:border [&_img]:border-slate-200
                
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2 [&_li]:marker:text-blue-500
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2 [&_li]:marker:font-semibold [&_li]:marker:text-slate-900
                
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/50 [&_blockquote]:p-6 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:text-lg [&_blockquote]:text-slate-800 [&_blockquote]:my-8
                
                [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-800 transition-colors
                
                [&_pre]:bg-slate-900 [&_pre]:text-slate-50 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-8 [&_pre]:text-sm
                [&_code]:bg-slate-100 [&_code]:text-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />

              {/* BOTTOM FOOTER: Tags & Share */}
              <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Tags */}
                {
                  blog.tags && blog.tags.length > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className="text-sm font-semibold text-slate-800">
                        Tagged in:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-md cursor-pointer transition-colors border border-slate-200 hover:border-blue-200"
                          >
                            #{tag?.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div />
                  ) /* Empty div to keep flexbox spacing if no tags */
                }

                {/* BOTTOM SHARE BUTTONS */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-500">
                    Share this article:
                  </span>
                  <ShareButtons title={blog.title || ''} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      {/* RECENT ARTICLES SECTION */}
      {recentBlogs && recentBlogs.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-4 mt-16 border-t border-slate-200 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Read Next
            </h3>
            <Link
              href="/blog"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all articles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {recentBlogs.map((recentBlog) => (
              <Link
                key={recentBlog._id}
                href={`/blog/${recentBlog.slug || recentBlog._id}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {recentBlog.thumbnailImageUrl || recentBlog.bannerImageUrl ? (
                    <img
                      src={
                        recentBlog.thumbnailImageUrl ||
                        recentBlog.bannerImageUrl
                      }
                      alt={recentBlog.title}
                      className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-slate-200 select-none group-hover:scale-110 transition-transform">
                      {recentBlog.title
                        ? recentBlog.title.charAt(0).toUpperCase()
                        : 'B'}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit mb-3">
                    {recentBlog?.category?.[0]?.title || 'Tech'}
                  </span>

                  <h4 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                    {recentBlog.title}
                  </h4>

                  <div className="mt-auto pt-4 flex items-center gap-2 text-[12px] font-medium text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {fDateTime(recentBlog.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function Meta({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string | number | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    if (typeof window === 'undefined') return;

    const url = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        // WhatsApp API link for pre-filling a message
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support web share links.
        // Workaround: Copy to clipboard and open Instagram.
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard! You can now paste it on Instagram.');
        shareUrl = 'https://www.instagram.com/';
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500');
    }
  };

  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleShare('twitter')}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleShare('linkedin')}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleShare('facebook')}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={() => handleShare('whatsapp')}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
        aria-label="Share on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {/* Instagram Button */}
      <button
        onClick={() => handleShare('instagram')}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
        aria-label="Share on Instagram"
      >
        <Instagram className="h-4 w-4" />
      </button>

      <button
        onClick={copyToClipboard}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
        aria-label="Copy Link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#f8f9fc] text-center px-4">
      <div className="h-20 w-20 bg-white shadow-sm border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Post Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        The article you're looking for might have been moved, deleted, or never
        existed in the first place.
      </p>
      <Link href="/blogs">
        <button className="h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm">
          Return to Blog Directory
        </button>
      </Link>
    </div>
  );
}
