import React from 'react';

export default function JobSearch() {
  return (
    <div className="flex h-screen overflow-hidden text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 bg-[#F8FAFC]">
      <div className="flex flex-1 flex-col overflow-hidden relative min-w-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <main className="mx-auto w-full max-w-[1440px] flex flex-col px-5 pt-5 pb-5">
            {/* Search Bar Area */}
            <div className="flex w-full shrink-0 items-center gap-3 mb-5">
              <div className="flex h-[52px] flex-1 items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 hover:border-slate-300">
                <div className="flex h-full flex-1 items-center px-4">
                  <svg
                    className="h-[18px] w-[18px] shrink-0 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Job title, keyword, or company"
                    defaultValue="Senior Java Fullstack Engineer"
                    className="w-full flex-1 border-none bg-transparent px-3 text-[14px] font-semibold text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex h-full flex-1 items-center px-4">
                  <svg
                    className="h-[18px] w-[18px] shrink-0 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    defaultValue="San Francisco, CA"
                    className="w-full flex-1 border-none bg-transparent px-3 text-[14px] font-semibold text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <button className="rounded-md p-1 text-slate-300 transition-colors hover:text-slate-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <button className="flex h-[52px] shrink-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                <svg
                  className="h-[18px] w-[18px] text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </button>
              <button className="h-[52px] shrink-0 rounded-2xl bg-blue-600 px-8 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                Search
              </button>
            </div>

            {/* Main Content Split */}
            <div className="sticky top-5 z-10 flex gap-6 h-[calc(100vh-94px)] w-full">
              {/* Job List Sidebar */}
              <aside className="relative flex w-[380px] shrink-0 flex-col h-full bg-[#F8FAFC]">
                <div className="mb-4 flex shrink-0 items-center justify-between px-1">
                  <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">
                    142 Jobs Found
                  </h2>
                </div>

                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2 pb-6">
                  {/* Active Job Card */}
                  <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-400 bg-blue-50/40 p-4 shadow-sm ring-4 ring-blue-50 transition-all">
                    <div className="absolute top-0 bottom-0 left-0 w-[5px] rounded-l-2xl bg-blue-600"></div>
                    <div className="mb-3 flex items-start justify-between pl-2">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                        <span className="text-[11px] font-black text-slate-800">
                          JPMC
                        </span>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        2 days ago
                      </span>
                    </div>
                    <h3 className="mb-1.5 pl-2 text-[15px] leading-snug font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                      Senior Java Fullstack Software Engineer
                    </h3>
                    <div className="mt-2 space-y-1.5 pl-2">
                      <p className="flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        JP Morgan Services
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        San Francisco, CA (Hybrid)
                      </p>
                    </div>
                  </div>

                  {/* Job Card 2 */}
                  <div className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[11px] font-bold text-red-600">
                        ORCL
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        3 days ago
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[15px] leading-snug font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                      Java Fullstack Software Engineer
                    </h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Oracle Financial Services
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Hyderabad, Telangana
                      </p>
                    </div>
                  </div>

                  {/* Job Card 3 */}
                  <div className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                        GRID
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        1 week ago
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[15px] leading-snug font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                      Fullstack Software Engineer - User Exper...
                    </h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Grid Dynamics Private Limited
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Secunderabad, Telangana
                      </p>
                    </div>
                  </div>

                  {/* Job Card 4 */}
                  <div className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-extrabold text-[18px]">
                        Z
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        14 days ago
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[15px] leading-snug font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                      Fullstack Software Engineer (React/Pytho...
                    </h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Egen
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Madhavaram, Telangana
                      </p>
                    </div>
                  </div>

                  {/* Job Card 5 */}
                  <div className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-extrabold text-[18px]">
                        Z
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Today
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[15px] leading-snug font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                      Fullstack (react js and node js)
                    </h3>
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 text-[12.5px] font-bold text-slate-600">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        The Hub
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        New Delhi, Delhi
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
              </aside>

              {/* Job Details Section */}
              <section className="custom-scrollbar relative flex flex-1 flex-col overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-sm h-full">
                <div className="shrink-0 bg-white px-8 pt-8 pb-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-slate-200 bg-white p-2 shadow-sm">
                        <span className="text-xs font-black text-slate-800">
                          JPMC
                        </span>
                      </div>
                      <div>
                        <h1 className="mb-3 text-[26px] leading-tight font-black tracking-tight text-slate-900">
                          Senior Java Fullstack Software Engineer
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]">
                          <span className="flex items-center gap-1.5 font-bold text-slate-700">
                            <svg
                              className="h-[18px] w-[18px] text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            JP Morgan Services India Pvt Ltd
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <svg
                              className="h-[18px] w-[18px] text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            San Francisco, CA
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-500">
                            <svg
                              className="h-[18px] w-[18px] text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            $140k - $190k / yr
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2.5">
                      <button className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500">
                        <svg
                          className="h-[20px] w-[20px] group-hover:fill-red-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                      <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
                        <svg
                          className="h-[20px] w-[20px]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-3 border-y border-slate-200 bg-white/90 px-8 py-4 shadow-sm backdrop-blur-xl">
                  <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Apply on Company Site
                  </button>

                  <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13.5px] font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                    <svg
                      className="h-4 w-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    Tailor My Docs
                  </button>

                  <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2">
                      <svg
                        className="h-4 w-4 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[12px] font-semibold text-slate-600">
                        AI ATS Score:{' '}
                        <span className="font-extrabold text-slate-900">
                          85/100
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3.5 py-2">
                      <svg
                        className="h-4 w-4 text-teal-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="text-[12px] font-semibold text-slate-600">
                        Match Score:{' '}
                        <span className="font-extrabold text-slate-900">
                          High
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="jd-prose p-8 pb-20 text-[14px] leading-relaxed text-slate-600 flex-1">
                  <h3 className="mb-5 flex items-center gap-2.5 text-[17px] font-extrabold text-slate-900">
                    <div className="h-5 w-1.5 rounded-full bg-blue-600"></div>
                    Job Description
                  </h3>

                  <p className="font-semibold text-slate-800 mb-4">
                    Software Engineer III - Java Fullstack
                  </p>

                  <p className="mb-6">
                    We have an exciting and rewarding opportunity for you to
                    take your software engineering career to the next level. As
                    a Software Engineer III at JPMorgan Chase within the Asset &
                    Wealth Management, you serve as a seasoned member of an
                    agile team to design and deliver trusted market-leading
                    technology products in a secure, stable, and scalable way.
                    You are responsible for carrying out critical technology
                    solutions across multiple technical areas within various
                    business functions in support of the firm's business
                    objectives.
                  </p>

                  <h4 className="mt-8 mb-3 text-[14.5px] font-extrabold text-slate-900">
                    Job responsibilities
                  </h4>
                  <ul className="mb-8 space-y-2">
                    <li>
                      Designs and builds full-stack solutions in partnership
                      with Global Trust & Estate Technology Teams.
                    </li>
                    <li>
                      Applies and advances AI-driven development practices
                      throughout the SDLC.
                    </li>
                    <li>
                      Delivers robust, high-performance code to cloud
                      environments.
                    </li>
                    <li>
                      Optimizes algorithms and workflows to improve process
                      efficiency.
                    </li>
                    <li>
                      Solves technical challenges with creativity and a
                      practical mindset.
                    </li>
                    <li>
                      Mentors and learns within a diverse, high-performing
                      engineering team.
                    </li>
                    <li>
                      Advocates for engineering best practices, code quality,
                      and team success.
                    </li>
                  </ul>

                  <h4 className="mt-8 mb-3 text-[14.5px] font-extrabold text-slate-900">
                    Required qualifications, capabilities, and skills
                  </h4>
                  <ul className="mb-8 space-y-2">
                    <li>
                      Formal training or certification on software engineering
                      concepts and 3+ years applied experience
                    </li>
                    <li>
                      Developers who combine technical excellence with the
                      mindset of a Renaissance Developer in the AI era.
                    </li>
                    <li>
                      Java/Spring, JavaScript/TypeScript, SQL, or Kafka. You're
                      hands-on with cloud platforms and eager to experiment with
                      modern development stacks.
                    </li>
                    <li>
                      Creative thinking to pipeline design, AI integration, and
                      user experience. You see the possibilities of AI woven
                      throughout the SDLC and are passionate about building
                      reliable, scalable systems that shape the future of Trust
                      & Estate technology.
                    </li>
                    <li>
                      Solid grasp of the software development lifecycle, Agile
                      methodologies, CI/CD, application resiliency, and security
                    </li>
                    <li>
                      Experience in developing, debugging, and maintaining code
                      in a large corporate environment with one or more modern
                      programming languages and database querying languages
                    </li>
                    <li>
                      Solid understanding of agile methodologies such as CI/CD,
                      Application Resiliency, and Security
                    </li>
                    <li>
                      Demonstrated knowledge of software applications and
                      technical processes within a technical discipline (e.g.,
                      cloud, artificial intelligence, machine learning, mobile,
                      etc.)
                    </li>
                  </ul>

                  <h4 className="mt-8 mb-3 text-[14.5px] font-extrabold text-slate-900">
                    Preferred qualifications, capabilities, and skills
                  </h4>
                  <ul className="mb-10 space-y-2">
                    <li>Familiarity with modern front-end technologies</li>
                    <li>Exposure to cloud technologies</li>
                  </ul>

                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-[#F8FAFC] p-6 shadow-sm sm:flex-row mb-6">
                    <div>
                      <p className="mb-1 text-[15px] font-extrabold text-slate-900">
                        Increase your chances of getting hired.
                      </p>
                      <p className="text-[13px] font-medium text-slate-500">
                        Use ZobsAI to tailor your resume specifically to this
                        job description.
                      </p>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[13px] font-bold whitespace-nowrap text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-black">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      Tailor My CV
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
