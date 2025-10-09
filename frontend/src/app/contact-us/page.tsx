'use client';

import React, { useState } from 'react';
import { Footer } from '@/components/layout/footer';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  User,
  MessageCircle,
  Facebook,
  Twitter,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { Navigation } from '@/components/layout/site-header';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await apiInstance.post('/form/contact', {
      name: formData.name,
      email: formData.email,
      phone: formData.mobile,
      message: formData.message,
    });

    setIsLoading(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', mobile: '', message: '' });
    }, 3000);
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-lime-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-5">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Get In Touch
            </h1>
            {/* <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ready to start your next project? Let's create something amazing
              together.
            </p> */}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info Section */}
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Let's Connect
                </h2>
                <p className="text-gray-700 text-lg mb-8">
                  Have a question or want to work together? Drop us a line and
                  we'll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-r from-lime-400 to-green-400 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-gray-900 font-medium">
                        hello@zobsai.com
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="text-gray-900 font-medium">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </div> */}

                  <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="text-gray-900 font-medium">
                        San Francisco, CA
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Facebook className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-800 font-medium">Facebook</p>
                </div>

                <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-green-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Twitter className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-800 font-medium">Twitter</p>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-lg">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Tell us about your suggestions or issues..."
                      className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-700">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* footer  */}
      <Footer />
    </div>
  );
}
