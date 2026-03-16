'use client';

import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Iconify } from '@/components/iconify';

import { fDateTime } from '@/utils/format-time';

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

export default function BlogsAllDetail({ initialBlogDetails }: BlogsAllDetailProps) {
  const blog = initialBlogDetails ?? {};
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');

  const descriptionSource =
    blog.fullDescription ||
    blog.description ||
    blog.shortDescription ||
    '';

  // Extract headings
  const extractHeadings = (html: string) => {
    if (!html) return { updatedHtml: '', headingsArray: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');

    const headingsArray = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;

      const text =
        (heading as HTMLElement).innerText ||
        heading.textContent ||
        '';

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

  useEffect(() => {
    if (!descriptionSource) return;

    const { updatedHtml, headingsArray } =
      extractHeadings(descriptionSource);

    setDescriptionHtml(updatedHtml);
    setHeadings(headingsArray);
  }, [descriptionSource]);

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
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.2,
      }
    );

    const elements = document.querySelectorAll('h1, h2, h3');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [descriptionHtml]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 100;
    const position =
      element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: position,
      behavior: 'smooth',
    });
  };

  if (!blog || !blog._id) {
    return (
      <div className="py-10 text-center">
        <h5 className="text-xl font-semibold">Loading...</h5>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* HERO SECTION */}
      <div
        className="relative bg-cover bg-center h-[260px] md:h-[420px]"
        style={{
          backgroundImage: `url(${blog.bannerImageUrl || blog.thumbnailImageUrl || '/logo/logo.png'})`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.85))',
          }}
        />

        <div
          className="relative z-10 h-full flex items-end pb-5 text-white max-w-screen-lg mx-auto px-4"
        >
          <div className="max-w-[900px]">
            <h3
              className="text-3xl font-extrabold mb-2"
            >
              {blog.title}
            </h3>

            <div className="flex gap-3 flex-wrap">
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

      {/* CONTENT SECTION */}
      <div className="max-w-screen-lg mx-auto px-4 -mt-6 pb-10">
        <div
          className="bg-white shadow-md rounded-xl p-3 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* TOC */}
            <div className="col-span-full md:col-span-1 sticky top-20">
              <h6 className="text-xl font-semibold mb-2">
                Table of Contents
              </h6>

              {headings.map((heading) => (
                <p
                  key={heading.id}
                  onClick={() => scrollToSection(heading.id)}
                  className={cn(
                    'cursor-pointer mb-1 text-sm',
                    heading.tagName === 'h3' && 'pl-2',
                    activeHeading === heading.id
                      ? 'text-primary font-semibold'
                      : 'text-gray-600 font-normal'
                  )}
                >
                  {heading.text}
                </p>
              ))}
            </div>

            {/* BLOG CONTENT */}
            <div className="col-span-full md:col-span-3">
              
              {/* Categories */}
              <div className="mb-3">
                {blog.category?.map((cat: string, i: number) => (
                  <Badge
                    key={i}
                    variant="default" // Shadcn Badge default variant
                    className="mr-1 mb-1"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Description */}
              <div
                ref={contentRef}
                className="text-lg leading-relaxed [&_p]:mb-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_img]:max-w-full [&_img]:rounded-md"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />

              {/* Tags */}
              <div className="mt-5">
                {blog.tags?.map((tag: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="mr-1 mb-1"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ icon, value }: { icon: string; value?: string | number | null }) {
  return (
    <div className="flex items-center gap-1">
      <Iconify icon={icon} width={18} />
      <p className="text-sm">
        {value || '-'}
      </p>
    </div>
  );
}

BlogsAllDetail.propTypes = {
  initialBlogDetails: PropTypes.object,
};
