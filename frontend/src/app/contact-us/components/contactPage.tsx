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
  AlertCircle,
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
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!name.trim()) return 'Name is required';
    if (!nameRegex.test(name)) return 'Name should only contain letters';
    if (name.trim().length < 2)
      return 'Name must be at least 2 characters long';
    return '';
  };

  const validateMobile = (mobile) => {
    const digitsOnly = mobile.replace(/\D/g, '');
    if (!mobile.trim()) return 'Phone number is required';
    if (digitsOnly.length < 10) return 'Number must be at least 10 digits';
    if (digitsOnly.length > 15) return 'Phone number is too long';
    const invalidChars = /[^\d+\s\-()]/g;
    if (invalidChars.test(mobile))
      return 'Phone number can only contain digits, +, -, spaces, and parentheses';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nameError = validateName(formData.name);
    const mobileError = validateMobile(formData.mobile);
    const emailError = validateEmail(formData.email);

    setErrors({
      name: nameError,
      mobile: mobileError,
      email: emailError,
    });

    return !nameError && !mobileError && !emailError;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
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
      setErrors({ name: '', mobile: '', email: '' });
    }, 3000);
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handleMobileChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    setFormData((prev) => ({ ...prev, mobile: formattedValue }));

    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: '' }));
    }
  };

  return (
    <div>
      <Navigation />
      <div className="min-h-screen  ">
        <div className="relative z-10 container mx-auto px-4 py-5">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl uppercase font-semibold md:text-6xl font-semibold text-gray-900 mb-6 bg-clip-text text-transparent bg-headingTextPrimary">
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
                        info@zobsai.com
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
                        2nd Floor, S-05, B 14-15, Udhyog Marg, Block B, Sector
                        1, Noida, Uttar Pradesh 201301
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Cards */}
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://facebook.com/zobsai.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Facebook className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-800 font-medium">Facebook</p>
                </a>

                <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer">
                  {/* <a
                  href="https://twitter.com/zobsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer"
                > */}

                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-green-400 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Twitter className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-800 font-medium">Twitter</p>
                  {/* </a> */}
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-lg">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onBlur={() => {
                            const error = validateName(formData.name);
                            setErrors((prev) => ({ ...prev, name: error }));
                          }}
                          placeholder="Your Name"
                          className={`w-full pl-12 pr-4 py-4 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-white transition-all duration-300 ${
                            errors.name
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-purple-400'
                          }`}
                          // required
                        />
                      </div>
                      {errors.name && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="relative group">
                        <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          // onChange={handleInputChange}
                          onChange={handleMobileChange}
                          onBlur={() => {
                            const error = validateMobile(formData.mobile);
                            setErrors((prev) => ({ ...prev, mobile: error }));
                          }}
                          placeholder="Phone Number"
                          className={`w-full pl-12 pr-4 py-4 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-white transition-all duration-300 ${
                            errors.mobile
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-purple-400'
                          }`}
                          // required
                        />
                      </div>
                      {errors.mobile && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-xs mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => {
                          const error = validateEmail(formData.email);
                          setErrors((prev) => ({ ...prev, email: error }));
                        }}
                        placeholder="Your Email"
                        className={`w-full pl-12 pr-4 py-4 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-white transition-all duration-300 ${
                          errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-purple-400'
                        }`}
                        // required
                      />
                    </div>
                    {errors.email && (
                      <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-xs mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.email}</span>
                      </div>
                    )}
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
                    className="w-full bg-buttonPrimary text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
