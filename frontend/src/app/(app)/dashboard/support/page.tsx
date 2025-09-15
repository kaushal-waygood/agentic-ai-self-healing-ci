'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LifeBuoy,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Clock,
  Sparkles,
  FileText,
  Shield,
  Users,
  CreditCard,
  Upload,
  Bot,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const faqItems = [
  {
    id: 'cv-creation',
    question: 'How do I create or upload a CV?',
    answer:
      "During onboarding, you'll be prompted to either upload an existing CV (PDF, DOCX) or fill out a form with your details. You can also manage your CV later from the 'CV Generator' page in the main application.",
    icon: Upload,
    category: 'Getting Started',
  },
  {
    id: 'ai-tailoring',
    question:
      'How does the AI tailor my application (CV, Cover Letter, Email)?',
    answer:
      "When you select a job and choose 'Prepare Application', our AI analyzes the job description, your stored CV, and any narratives you've provided. It then rewrites sections of your CV to highlight relevant skills, drafts a targeted cover letter, and prepares an email, all specific to that job.",
    icon: Bot,
    category: 'AI Features',
  },
  {
    id: 'subscription-benefits',
    question: 'What are the benefits of upgrading to a Plus or Pro plan?',
    answer:
      "Upgraded plans offer features like more CV and cover letter templates, higher application submission limits, fully automated job application submissions to portals (Plus/Pro), AI job matching scores (Pro), and advanced ATS-friendly CV creation (Pro). Check the 'Subscription' page for full details.",
    icon: CreditCard,
    category: 'Subscription',
  },
  {
    id: 'referral-program',
    question: 'How does the referral program work?',
    answer:
      "Share your unique referral code or link found on the 'Referral Program' page. When friends sign up using your code/link, you earn application credits. These credits can be used for more applications on the Basic plan or for other benefits.",
    icon: Users,
    category: 'Rewards',
  },
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer:
      'We prioritize your data security. Personal information and application materials are handled with care. For features like AI Direct Apply (Plus/Pro), credentials are encrypted and managed securely. Always use strong, unique passwords for any linked accounts.',
    icon: Shield,
    category: 'Security',
  },
  {
    id: 'application-limits',
    question: 'What are the application limits for the Basic plan?',
    answer:
      'Basic plan users can submit up to 2 applications per day, with a maximum of 10 applications per month. To submit more, consider upgrading to a Plus or Pro plan.',
    icon: FileText,
    category: 'Limits',
  },
  {
    id: 'contact-support',
    question: 'I have a question not listed here, how can I get help?',
    answer:
      'You can try our AI Assistant for quick questions about using CareerPilot. For more complex issues or account-specific inquiries, please email us at support@careerpilot.example.com.',
    icon: MessageSquare,
    category: 'Support',
  },
];

const categories = [
  'All',
  'Getting Started',
  'AI Features',
  'Subscription',
  'Rewards',
  'Security',
  'Limits',
  'Support',
];

export default function SupportPage() {
  const route = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <LifeBuoy className="h-10 w-10 text-cyan-300" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Support Center
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions and get personalized help with
              CareerPilot
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main FAQ Section */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white shadow-sm text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {filteredFaqs.length} question
                  {filteredFaqs.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {filteredFaqs.map((item, index) => {
                    const IconComponent = item.icon;
                    const isOpen = openFaq === item.id;

                    return (
                      <div
                        key={item.id}
                        className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full p-6 text-left focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={`p-2 rounded-lg transition-colors duration-300 ${
                                  isOpen
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                                }`}
                              >
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300 text-lg">
                                  {item.question}
                                </h3>
                                <span className="inline-block px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full mt-2">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`transform transition-transform duration-300 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen
                              ? 'max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-6 pb-6 ml-16">
                            <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 p-4 rounded-xl border-l-4 border-purple-400">
                              <p className="text-gray-700 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredFaqs.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No questions found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms or category filter.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant Card */}
            <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white font-bold">
                      AI Assistant
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Get instant personalized help
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100 mb-4 text-sm leading-relaxed">
                  Our smart AI assistant can help answer specific questions
                  about your account and guide you through features.
                </p>
                <Button
                  className="w-full bg-white text-purple-600 hover:bg-purple-50 transition-all duration-300 font-semibold shadow-lg"
                  onClick={() => route.push('/ai-assistant')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support Card */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors duration-300">
                    <Mail className="h-5 w-5 text-cyan-600" />
                  </div>
                  <CardTitle className="text-gray-800 font-bold">
                    Contact Support
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Need personal assistance? We're here to help.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700 mb-3">
                    Email us for detailed support:
                  </p>
                  <a
                    href="mailto:support@careerpilot.example.com"
                    className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm hover:underline transition-colors duration-300 break-all"
                  >
                    support@careerpilot.example.com
                  </a>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 p-3 rounded-xl">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>We typically respond within 24-48 hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white font-bold flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5" />
                  Support Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-100">Response Time:</span>
                  <span className="font-semibold text-white">24hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-100">Satisfaction:</span>
                  <span className="font-semibold text-white">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-100">Resolved:</span>
                  <span className="font-semibold text-white">99.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
