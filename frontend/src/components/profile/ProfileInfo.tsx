import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Check,
  Edit,
  Mail,
  User,
  X,
  Lock,
  Unlock,
  Phone,
  Award,
  LogOut,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  Star,
  GraduationCap,
  PlusCircle,
  ChevronDown,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';

const dummyUser = {
  name: 'Alex Rider',
  email: 'alex.rider@example.com',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
  memberSince: 'October 2024',
  totalOrders: 12,
  totalSpent: 24567,
  rewardPoints: 450,
};

const ProfileInfo = ({
  personalInfoForm,
  handlePersonalInfoSubmit,
  isNameEditable,
  handlePersonalInfoEdit,
  toggleNameEdit,
  isEmailEditable,
  isPhoneEditable,
  toggleEmailEdit,
  setHandleName,
  handleCancelEdit,
  togglePhoneEdit,
}: any) => {
  const [activeTab, setActiveTab] = useState('profile');
  console.log('hellooooooooooooooo', personalInfoForm);
  const ProfileSidebar = ({ activeTab, setActiveTab }) => {
    return (
      <aside className="w-full lg:w-80 space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

          <div className="relative bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
                <img
                  src={dummyUser.avatar}
                  alt="Avatar"
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Edit size={14} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                {dummyUser.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{dummyUser.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                <Award size={16} />
                <span>{dummyUser.rewardPoints} Points</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-black text-blue-600">
                  {dummyUser.totalOrders}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Orders
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-2xl font-black text-purple-600">
                  ₹{(dummyUser.totalSpent / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Spent
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  };
  const navItems = [
    {
      id: 'education',
      label: 'Education',
      icon: User,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'orders',
      label: 'Project',
      icon: Package,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'wishlist',
      label: 'Experience',
      icon: Heart,
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 'addresses',
      label: 'Skills',
      icon: MapPin,
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return <div className="text-black">Education</div>;
      case 'orders':
        <div className="text-black">My Orders</div>;
      case 'wishlist':
        <div className="text-black">whislist</div>;
      default:
        return 'abc';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 py-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-2xl"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${
                  Math.random() * 15 + 10
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) rotate(120deg);
            }
            66% {
              transform: translate(-30px, 30px) rotate(240deg);
            }
          }
        `}</style>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="flex-1 text-white">
            {/* Navigation Card */}
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-10"></div>
              <div className="relative bg-white p-2 sm:p-5 md:p-2 rounded-2xl shadow-lg">
                <nav className="flex flex-wrap md:flex-row gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group/btn flex items-center justify-between gap-3 w-full md:w-auto px-4 py-2 text-left  rounded-2xl transition-all duration-300 ${
                        activeTab === item.id
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center text-sm  gap-3">
                        <item.icon
                          size={20}
                          className={
                            activeTab === item.id
                              ? ''
                              : 'group-hover/btn:scale-110 transition-transform'
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {activeTab === item.id && (
                        <ChevronRight
                          size={18}
                          className="animate-pulse hidden sm:block"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">{renderContent()}</div>
            </div>
          </div>
        </main>
      </div>
      ;{/* OLD  */}
      <div className="max-w-full mx-auto p-4 sm:p-6">
        <Card className="relative overflow-hidden shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-cyan-400/10 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>

          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Personal Information
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and update your profile details.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <Form {...personalInfoForm}>
              {/* We use a single form tag to wrap all fields */}
              <form
                onSubmit={personalInfoForm.handleSubmit(
                  handlePersonalInfoSubmit,
                )}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Full Name Field */}
                <FormField
                  control={personalInfoForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="h-4 w-4 text-purple-500" />
                        Full Name
                      </FormLabel>
                      <div
                        className={`flex items-center gap-3 p-1 pr-2 rounded-xl border-2 transition-all duration-300 ${
                          isNameEditable
                            ? 'border-purple-400 bg-white shadow-md ring-2 ring-purple-100'
                            : 'border-gray-200 bg-gray-50 group-hover:border-purple-300 group-hover:bg-white'
                        }`}
                      >
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your full name"
                            readOnly={!isNameEditable}
                            onChange={(e) => {
                              field.onChange(e);
                              // This prop might be redundant if using react-hook-form correctly,
                              // but keeping it as it was in the original code.
                              if (setHandleName) {
                                setHandleName(e.target.value);
                              }
                            }}
                            className={`flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-400 font-medium ${
                              isNameEditable ? 'text-purple-800' : ''
                            }`}
                          />
                        </FormControl>

                        {/* Edit/Save/Cancel Buttons */}
                        <div className="flex items-center gap-1">
                          {isNameEditable ? (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCancelEdit('fullName')}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                onClick={() =>
                                  handlePersonalInfoEdit('fullName')
                                }
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="icon"
                              onClick={toggleNameEdit}
                              variant="outline"
                              className="h-8 w-8 bg-white/50 rounded-full border-gray-300 group-hover:border-purple-400 group-hover:text-purple-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Email Field */}
                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail className="h-4 w-4 text-cyan-500" />
                        Email Address
                      </FormLabel>
                      <div
                        className={`flex items-center gap-3 p-1 pr-2 rounded-xl border-2 transition-all duration-300 ${
                          isEmailEditable
                            ? 'border-cyan-400 bg-white shadow-md ring-2 ring-cyan-100'
                            : 'border-gray-200 bg-gray-50 group-hover:border-cyan-300 group-hover:bg-white'
                        }`}
                      >
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            readOnly={!isEmailEditable}
                            className={`flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-400 font-medium ${
                              isEmailEditable ? 'text-cyan-800' : ''
                            }`}
                          />
                        </FormControl>

                        {/* Edit/Save/Cancel Buttons */}
                        <div className="flex items-center gap-1">
                          {isEmailEditable ? (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCancelEdit('email')}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                onClick={() => handlePersonalInfoEdit('email')}
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="icon"
                              onClick={toggleEmailEdit}
                              variant="outline"
                              className="h-8 w-8 bg-white/50 rounded-full border-gray-300 group-hover:border-cyan-400 group-hover:text-cyan-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="h-4 w-4 text-green-500" />{' '}
                        {/* Changed color for distinction */}
                        Phone Number
                      </FormLabel>
                      <div
                        className={`flex items-center gap-3 p-1 pr-2 rounded-xl border-2 transition-all duration-300 ${
                          isPhoneEditable // <-- CORRECT
                            ? 'border-green-400 bg-white shadow-md ring-2 ring-green-100'
                            : 'border-gray-200 bg-gray-50 group-hover:border-green-300 group-hover:bg-white'
                        }`}
                      >
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+91 1234567890"
                            readOnly={!isPhoneEditable} // <-- CORRECT
                            className={`flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-400 font-medium ${
                              isPhoneEditable ? 'text-green-800' : ''
                            }`}
                          />
                        </FormControl>

                        {/* Edit/Save/Cancel Buttons */}
                        <div className="flex items-center gap-1">
                          {isPhoneEditable ? (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCancelEdit('phone')}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                onClick={() => handlePersonalInfoEdit('phone')}
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="icon"
                              onClick={togglePhoneEdit} // <-- CORRECT
                              variant="outline"
                              className="h-8 w-8 bg-white/50 rounded-full border-gray-300 group-hover:border-green-400 group-hover:text-green-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProfileInfo;
