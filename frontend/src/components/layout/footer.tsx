'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Heart,
  Globe,
  ExternalLink,
  Send,
  ChevronUp,
  Rocket,
} from 'lucide-react';
import './styles/footer.css'; // Import the new CSS file
import { footerLinks, socialLinks } from '@/services/dummy/Footer';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const footer = footerRef.current;
    if (footer) {
      footer.addEventListener('mousemove', handleMouseMove);
      return () => footer.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setNewsletterStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }, 1500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const LinkItem = ({ item, index, section }) => {
    const IconComponent = item.icon;

    return (
      <li
        style={{
          transform: `translateY(${isVisible ? 0 : 30}px)`,
          opacity: isVisible ? 1 : 0,
          transitionDelay: `${index * 50 + section * 200}ms`,
        }}
      >
        <Link
          href={item.link ? item.link : ''}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 py-1 rounded-lg hover:bg-white/5 px-2 -mx-2"
          onMouseEnter={() => setHoveredLink(`${section}-${index}`)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {IconComponent && (
            <IconComponent className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          )}
          <span className="group-hover:translate-x-1 transition-transform duration-300">
            {item.name}
          </span>
          {item.badge && (
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full font-semibold
              ${
                item.badge === 'New' ? 'bg-emerald-500/20 text-emerald-400' : ''
              }
              ${item.badge === 'Popular' ? 'bg-blue-500/20 text-blue-400' : ''}
              ${
                item.badge === 'Hiring Soon'
                  ? 'bg-orange-500/20 text-orange-400'
                  : ''
              }
              ${
                item.badge === 'Live'
                  ? 'bg-green-500/20 text-green-400 animate-pulse'
                  : ''
              }
            `}
            >
              {item.badge}
            </span>
          )}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </li>
    );
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)
        `,
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float opacity-60" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float opacity-60"
          style={{ animationDelay: '2s' }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 footer-grid-pattern" />
      </div>

      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-2">
            <div
              className="mb-8"
              style={{
                transform: `translateY(${isVisible ? 0 : 30}px)`,
                opacity: isVisible ? 1 : 0,
                transitionDelay: '0.4s',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                {/* <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Rocket className="w-6 h-6 text-white" />
                </div> */}
                <div className="w-8 h-8  rounded-lg flex items-center justify-center ">
                  <Image
                    width={100}
                    height={100}
                    src="logo.png"
                    className="w-10 h-auto"
                    alt="abc"
                  />
                </div>
                <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text">
                  ZobsAI
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg">
                AI-powered job application automation for the modern
                professional. Transform your career with intelligent automation.
              </p>
            </div>

            {/* Contact Info */}
            <div
              className="space-y-4"
              style={{
                transform: `translateY(${isVisible ? 0 : 30}px)`,
                opacity: isVisible ? 1 : 0,
                transitionDelay: '0.6s',
              }}
            >
              {[
                { icon: Mail, text: 'hello@zobsai.com', color: 'blue' },
                { icon: MapPin, text: 'New York, NY', color: 'purple' },
              ].map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 group hover:bg-white/5 rounded-lg p-2 -mx-2 transition-all duration-300"
                >
                  <div
                    className={`p-2 bg-gradient-to-r from-${contact.color}-500/20 to-${contact.color}-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <contact.icon
                      className={`w-4 h-4 text-${contact.color}-400`}
                    />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {contact.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Links Sections */}
          <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(
              ([section, links], sectionIndex) => (
                <div key={section}>
                  <h4
                    className="font-bold text-white mb-6 text-lg flex items-center"
                    style={{
                      transform: `translateY(${isVisible ? 0 : 20}px)`,
                      opacity: isVisible ? 1 : 0,
                      transitionDelay: `${sectionIndex * 100}ms`,
                    }}
                  >
                    <div className="" />
                    {/* dot will displayed if uncomment this */}
                    {/* <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" /> */}
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link, index) => (
                      <LinkItem
                        key={index}
                        item={link}
                        index={index}
                        section={sectionIndex}
                      />
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>

        {/* States and Newsletter section parent div */}
        <div className="grid grid-cols-2 lg:grid-cols-2 lg:max-w-4xl mx-auto gap-4 mt-5">
          {/* Stats Section */}
          {/* <div
            className="grid  items-center grid-cols-3 gap-6 p-3 bg-white/5 rounded-2xl border border-white/10 shadow-lg"
            style={{
              transform: `translateY(${isVisible ? 0 : 30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.5s',
            }}
          >
            {[
              { number: '50K+', label: 'Users' },
              { number: '2M+', label: 'Applications' },
              { number: '85%', label: 'Success Rate' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-extrabold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div> */}

          {/* Newsletter Section */}
          <div
            className="flex col-span-2 flex-col justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-lg hover:bg-white/10 transition-all duration-500"
            style={{
              transform: `translateY(${isVisible ? 0 : 30}px)`,
              opacity: isVisible ? 1 : 0,
              transitionDelay: '0.8s',
            }}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Stay Updated
                </h3>
                <p className="text-gray-400 text-sm">
                  Get the latest AI job search tips and product updates.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              <button
                onClick={handleNewsletterSubmit}
                disabled={newsletterStatus === 'loading'}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {newsletterStatus === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : newsletterStatus === 'success' ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {newsletterStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div
          className="border-t border-white/10 mt-16 pt-8 flex flex-col lg:flex-row justify-between items-center gap-8"
          style={{
            transform: `translateY(${isVisible ? 0 : 30}px)`,
            opacity: isVisible ? 1 : 0,
            transitionDelay: '1.2s',
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="text-gray-400 flex items-center gap-2">
              © 2024 ZobsAI. Made with
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              for job seekers worldwide.
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>Serving 50+ countries</span>
            </div>
          </div>

          {/* Enhanced Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href="#"
                className="group relative p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110"
                title={`Follow us on ${social.name} (${social.followers} followers)`}
              >
                <social.icon
                  className={`w-5 h-5 text-${social.color}-400 group-hover:scale-110 transition-transform duration-300`}
                />

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {social.followers} followers
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </footer>
  );
}
