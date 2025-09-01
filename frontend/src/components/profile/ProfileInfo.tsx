import React from 'react';
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
import { Check, Edit, Mail, User, X, Lock, Unlock, Phone } from 'lucide-react';

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
  handleCancelEdit, // New prop for the cancel button
}: any) => {
  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <Card className="relative overflow-hidden shadow-lg border-0 bg-white/60 backdrop-blur-sm">
        {/* Decorative Background Elements */}
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
              onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)}
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
                              onClick={() => handlePersonalInfoEdit('fullName')}
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
                      <Phone className="h-4 w-4 text-cyan-500" />
                      Phone Number{' '}
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
                          placeholder="+91 1234567890"
                          readOnly={!isEmailEditable}
                          className={`flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-400 font-medium ${
                            isEmailEditable ? 'text-cyan-800' : ''
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfo;
