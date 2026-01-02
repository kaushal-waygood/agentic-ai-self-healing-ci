import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  User,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
} from 'lucide-react';
import Education from './components/Education';
import Project from './components/Project';
import Experience from './components/Experience';
import Skills from './components/Skills';
import SideSectionProfile from './components/SideSectionProfile';
import JobPreferencesForm from './components/JobPreference';
const navItems = [
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    gradient: 'tabPrimary',
  },
  {
    id: 'project',
    label: 'Project',
    icon: Package,
    gradient: 'tabPrimary',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    gradient: 'tabPrimary',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Code,
    gradient: 'tabPrimary',
  },
  {
    id: 'jobPreferences',
    label: 'Job Preferences',
    icon: MapPin,
    gradient: 'tabPrimary',
  },
];
const ProfileInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultTab = searchParams.get('tab') || 'education';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync URL → State (when URL changes)
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'education';
    setActiveTab(urlTab);
  }, [searchParams]);

  // Function to update BOTH UI + URL
  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/profile?tab=${tab}`, { scroll: false });
    setActiveTab(tab);
  };

  const ProfileSidebar = () => {
    return <SideSectionProfile />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return (
          <div>
            {/* Education  */}
            <Education />
          </div>
        );
      case 'project':
        return (
          <div>
            <Project />
          </div>
        );
      case 'experience':
        return (
          <div>
            <Experience />
          </div>
        );
      case 'skills':
        return (
          <div>
            <Skills />
          </div>
        );
      case 'jobPreferences':
        return (
          <div>
            <JobPreferencesForm />
          </div>
        );
      default:
        return 'Try Again';
    }
  };

  return (
    <>
      <div className="relative py-6">
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

        <main className="flex flex-col md:flex-row max-w-7xl gap-4 mx-auto p-1 sticky top-7">
          <div className=" md:sticky md:top-7 md:self-start">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1">
            <div className=" mb-4 sticky top-7 z-10">
              <div className="relative bg-white p-3 sm:p-4 md:p-2 rounded-lg shadow-sm ">
                <nav className="flex flex-wrap justify-center sm:justify-start gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`group/btn flex  items-center justify-between gap-3 w-full sm:w-auto px-4 py-2 text-left rounded-lg transition-all duration-300 ${
                        activeTab === item.id
                          ? `bg-${item.gradient} text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center text-sm gap-2 sm:gap-3">
                        <item.icon
                          size={18}
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
                          size={16}
                          className="animate-pulse hidden sm:block"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="flex flex-col ">{renderContent()}</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfileInfo;
