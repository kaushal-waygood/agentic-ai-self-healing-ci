module.exports = [
"[project]/store/job.store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useJobStore",
    ()=>useJobStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-ssr] (ecmascript)");
;
;
const useJobStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        jobs: [],
        job: null,
        loading: false,
        error: null,
        getJobs: async ()=>{
            try {
                set({
                    loading: true,
                    error: null
                });
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get('/jobs/hosted/jobs/job-admin');
                const data = response.data;
                set({
                    jobs: data.jobs,
                    loading: false
                });
            } catch (err) {
                console.error('Job fetching error:', err);
                set({
                    error: err.response?.data?.message || err.message || 'Failed to fetch jobs',
                    loading: false
                });
            }
        },
        getSingleHostedJobs: async (id)=>{
            try {
                set({
                    loading: true,
                    error: null
                });
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`/jobs/${id}`);
                const data = response.data;
                set({
                    job: data.job,
                    loading: false
                });
            } catch (err) {
                console.error('Job fetching error:', err);
                set({
                    error: err.response?.data?.message || err.message || 'Failed to fetch jobs',
                    loading: false
                });
            }
        },
        updateJobDescription: async (id, description)=>{
            try {
                set({
                    loading: true,
                    error: null
                });
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].patch(`/jobs/mannual/${id}`, {
                    description
                });
                const data = response.data;
                console.log(data);
                set({
                    job: data.job,
                    loading: false
                });
            } catch (err) {
                console.error('Job updating error:', err);
                set({
                    error: err.response?.data?.message || err.message || 'Failed to update job',
                    loading: false
                });
            }
        },
        mannualPostJob: async (jobData)=>{
            try {
                set({
                    loading: true,
                    error: null
                });
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/jobs/mannual', jobData);
                const data = response.data;
                set({
                    jobs: data,
                    loading: false
                });
            } catch (err) {
                console.error('Job posting error:', err);
                set({
                    error: err.response?.data?.message || err.message || 'Failed to post job',
                    loading: false
                });
            }
        }
    }));
}),
"[project]/components/postJobs/NewPostingJobs.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$banknote$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Banknote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/banknote.js [app-ssr] (ecmascript) <export default as Banknote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$job$2e$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/job.store.ts [app-ssr] (ecmascript)");
;
'use client';
;
;
;
;
;
;
;
;
;
;
const QuillJs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-40 bg-gray-50 animate-pulse rounded-md"
        }, void 0, false, {
            fileName: "[project]/components/postJobs/NewPostingJobs.tsx",
            lineNumber: 65,
            columnNumber: 18
        }, ("TURBOPACK compile-time value", void 0))
});
// --- Schema (Same as before) ---
const jobSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    // Step 1: Overview
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Job title is requiblue'),
    company: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Company name is requiblue'),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, 'Description must be at least 10 characters'),
    remote: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    city: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    country: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    state: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    postalCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    // Step 2: Requirements
    responsibilities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    qualifications: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    experience: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    // Step 3: Contract & Pay
    jobType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERN'
    ]),
    contractLengthValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().optional(),
    contractLengthType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'MONTHS',
        'YEARS'
    ]).optional(),
    salaryMin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().min(0, 'Salary must be positive'),
    salaryMax: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().min(0, 'Salary must be positive'),
    salaryPeriod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'YEAR',
        'MONTH'
    ]),
    // New Screening Questions Array
    screeningQuestions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        question: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Question cannot be empty'),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'text',
            'number',
            'boolean',
            'date'
        ]),
        requiblue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(true)
    })).optional(),
    // Step 4: Screening
    applyEmail: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email('Please enter a valid email'),
    resumeRequiblue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    includeAssignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
    assignmentType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'MANUAL',
        'FILE'
    ]).optional(),
    assignmentQuestion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    assignmentFile: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional()
}).superRefine((data, ctx)=>{
    // Location Validation (only if not remote)
    if (!data.remote) {
        if (!data.city) ctx.addIssue({
            code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodIssueCode.custom,
            path: [
                'city'
            ],
            message: 'City is requiblue for on-site jobs'
        });
        if (!data.country) ctx.addIssue({
            code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodIssueCode.custom,
            path: [
                'country'
            ],
            message: 'Country is requiblue for on-site jobs'
        });
    }
    // Assignment Validation
    if (data.includeAssignment) {
        if (!data.assignmentType) {
            ctx.addIssue({
                code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodIssueCode.custom,
                message: 'Please select an assignment type',
                path: [
                    'assignmentType'
                ]
            });
        }
        if (data.assignmentType === 'MANUAL' && (!data.assignmentQuestion || data.assignmentQuestion.length < 5)) {
            ctx.addIssue({
                code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodIssueCode.custom,
                message: 'Please write a question or instruction',
                path: [
                    'assignmentQuestion'
                ]
            });
        }
    }
});
// --- Step Definitions ---
const STEPS = [
    {
        id: 0,
        name: 'Overview',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
        fields: [
            'title',
            'company',
            'description',
            'remote',
            'city',
            'country'
        ]
    },
    {
        id: 1,
        name: 'Contract & Pay & Screening',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$banknote$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Banknote$3e$__["Banknote"],
        fields: [
            'jobType',
            'salaryMin',
            'salaryMax',
            'salaryPeriod',
            'contractLengthValue'
        ]
    }
];
const NewJobPost = ()=>{
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [currentStep, setCurrentStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { mannualPostJob } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$job$2e$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useJobStore"])();
    const THEME = {
        glassCard: 'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10',
        gradientText: 'bg-gradient-to-r from-blue-600 via-blue-600 to-pink-600 bg-clip-text text-transparent',
        gradientBtn: 'bg-gradient-to-r from-blue-600 via-blue-600 to-pink-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]',
        inputFocus: 'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-transparent transition-all duration-300',
        sectionIcon: 'p-2 bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg text-blue-500 mr-3'
    };
    const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zodResolver"])(jobSchema),
        defaultValues: {
            title: '',
            description: '',
            company: '',
            applyEmail: '',
            jobType: 'FULL_TIME',
            contractLengthValue: 0,
            contractLengthType: 'MONTHS',
            salaryMin: 0,
            salaryMax: 0,
            salaryPeriod: 'YEAR',
            city: '',
            state: '',
            postalCode: '',
            country: 'IN',
            responsibilities: '',
            qualifications: '',
            experience: '',
            tags: '',
            screeningQuestions: [],
            resumeRequiblue: true,
            remote: false,
            includeAssignment: false,
            assignmentType: 'MANUAL'
        },
        mode: 'onChange'
    });
    // Watchers
    const remote = form.watch('remote');
    const jobType = form.watch('jobType');
    const includeAssignment = form.watch('includeAssignment');
    const assignmentType = form.watch('assignmentType');
    // --- Navigation Logic ---
    const handleNext = async ()=>{
        const fields = STEPS[currentStep].fields;
        const isValid = await form.trigger(fields);
        if (isValid) {
            setCurrentStep((prev)=>Math.min(prev + 1, STEPS.length - 1));
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Please fix the errors before proceeding.');
        }
    };
    const handleBack = ()=>{
        setCurrentStep((prev)=>Math.max(prev - 1, 0));
    };
    // --- Submission Logic ---
    const splitLines = (value)=>value ? value.split('\n').map((s)=>s.trim()).filter(Boolean) : [];
    const splitTags = (value)=>value ? value.split(',').map((s)=>s.trim()).filter(Boolean) : [];
    const onSubmit = async (data)=>{
        setIsSubmitting(true);
        try {
            const finalPayload = {
                title: data.title,
                description: data.description,
                company: data.company,
                applyMethod: {
                    method: 'EMAIL',
                    emails: [
                        data.applyEmail
                    ]
                },
                jobTypes: [
                    data.jobType
                ],
                contractLength: data.jobType === 'CONTRACT' ? {
                    value: data.contractLengthValue,
                    type: data.contractLengthType
                } : null,
                salary: {
                    min: data.salaryMin,
                    max: data.salaryMax,
                    period: data.salaryPeriod
                },
                jobAddress: !data.remote ? `${data.city}${data.state ? ', ' + data.state : ''}, ${data.country}` : null,
                country: data.country,
                resumeRequiblue: data.resumeRequiblue,
                remote: data.remote,
                location: data.remote ? null : {
                    city: data.city,
                    state: data.state || '',
                    postalCode: data.postalCode || ''
                },
                responsibilities: splitLines(data.responsibilities),
                qualifications: splitLines(data.qualifications),
                experience: splitLines(data.experience),
                tags: splitTags(data.tags),
                screeningQuestions: data.screeningQuestions,
                assignment: data.includeAssignment ? {
                    isEnabled: true,
                    type: data.assignmentType,
                    content: data.assignmentType === 'MANUAL' ? data.assignmentQuestion : 'File Attached'
                } : null
            };
            if (data.includeAssignment) {
                finalPayload.assignment = {
                    isEnabled: true,
                    type: data.assignmentType,
                    content: data.assignmentType === 'MANUAL' ? data.assignmentQuestion : 'File Attached'
                };
            // File upload logic here if needed
            }
            console.log('Payload:', finalPayload);
            mannualPostJob(finalPayload);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Job posted successfully!');
        } catch (error) {
            console.error(error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Failed to post job.');
        } finally{
            setIsSubmitting(false);
        }
    };
    const { fields, append, remove } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFieldArray"])({
        control: form.control,
        name: 'screeningQuestions'
    });
    // Pre-defined suggestions (Indeed style)
    const SUGGESTED_QUESTIONS = [
        {
            text: 'How many years of experience do you have with [Skill]?',
            type: 'number'
        },
        {
            text: 'Are you authorized to work in [Country]?',
            type: 'boolean'
        },
        {
            text: "Do you have a valid Driver's License?",
            type: 'boolean'
        },
        {
            text: 'What is your expected salary range?',
            type: 'text'
        },
        {
            text: 'Are you comfortable working on-site?',
            type: 'boolean'
        }
    ];
    const addQuestion = (text, type)=>{
        append({
            question: text,
            type: type,
            requiblue: true
        });
    };
    const CurrentIcon = STEPS[currentStep].icon;
// return (
//   <div className="min-h-screen p-4 md:p-6 flex flex-col ">
//     {/* Header */}
//     <div className="w-full  mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
//       <div>
//         <h1 className={`text-3xl font-bold text-blue-500`}>
//           Create Job Posting
//         </h1>
//         <p className="text-gray-600">
//           Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
//         </p>
//       </div>
//       {/* Visual Step Indicator */}
//       <div className="flex items-center gap-2 bg-white p-2 rounded-full border shadow-sm">
//         {STEPS.map((step, idx) => (
//           <div key={idx} className="flex items-center">
//             <div
//               className={`
//             w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
//             ${
//               currentStep === idx
//                 ? 'bg-blue-500 text-white shadow-md scale-110'
//                 : currentStep > idx
//                   ? 'bg-green-100 text-green-500'
//                   : 'bg-slate-100 text-slate-400'
//             }
//           `}
//             >
//               {currentStep > idx ? (
//                 <CheckCircle2 className="w-5 h-5" />
//               ) : (
//                 idx + 1
//               )}
//             </div>
//             {idx < STEPS.length - 1 && (
//               <div className="w-6 h-0.5 bg-slate-100 mx-1" />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//     <Card className={`w-full  ${THEME.glassCard} overflow-visible`}>
//       {/* Progress Bar */}
//       <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 rounded-t-xl overflow-hidden">
//         <div
//           className="h-full bg-blue-500 transition-all duration-500 ease-out"
//           style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
//         />
//       </div>
//       <CardHeader className="border-b border-gray-100 bg-white/50 ">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-blue-100 text-blue-500 rounded-xl">
//             <CurrentIcon className="w-6 h-6" />
//           </div>
//           <div>
//             <CardTitle className="text-xl font-bold text-gray-800">
//               {STEPS[currentStep].name}
//             </CardTitle>
//             <CardDescription>
//               Please fill in the details below.
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="p-6 md:p-4 ">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="">
//             {/* --- STEP 0: JOB OVERVIEW --- */}
//             {/* {currentStep === 0 && (
//               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="title"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Job Title *</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="e.g. Senior Frontend Dev"
//                             {...field}
//                             className={THEME.inputFocus}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="company"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Company Name *</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="e.g. Acme Inc."
//                             {...field}
//                             className={THEME.inputFocus}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Job Description *</FormLabel>
//                       <FormControl>
//                         <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
//                           <QuillJs
//                             content={field.value}
//                             onContentChange={field.onChange}
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="remote"
//                     render={({ field }) => (
//                       <FormItem className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base text-blue-900">
//                             Remote Position?
//                           </FormLabel>
//                         </div>
//                         <FormControl>
//                           <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             className="data-[state=checked]:bg-blue-600"
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   {!remote && (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in">
//                       <FormField
//                         control={form.control}
//                         name="city"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>City *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 {...field}
//                                 className="bg-white"
//                                 placeholder="New York"
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="country"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Country *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 {...field}
//                                 className="bg-white"
//                                 placeholder="USA"
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )} */}
//             {currentStep === 0 && (
//               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
//                 {/* Main Two-Column Container */}
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
//                   {/* LEFT COLUMN: Inputs & Location Logic */}
//                   <div className="space-y-6 col-span-5">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       <FormField
//                         control={form.control}
//                         name="title"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Job Title *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="e.g. Senior Frontend Dev"
//                                 {...field}
//                                 className={THEME.inputFocus}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="company"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Company Name *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="e.g. Acme Inc."
//                                 {...field}
//                                 className={THEME.inputFocus}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     {/* Location Logic Section */}
//                     <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
//                       <FormField
//                         control={form.control}
//                         name="remote"
//                         render={({ field }) => (
//                           <FormItem className="flex items-center justify-between">
//                             <FormLabel className="text-base text-blue-900">
//                               Remote Position?
//                             </FormLabel>
//                             <FormControl>
//                               <Switch
//                                 checked={field.value}
//                                 onCheckedChange={field.onChange}
//                                 className="data-[state=checked]:bg-blue-600"
//                               />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                       {!remote && (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in">
//                           <FormField
//                             control={form.control}
//                             name="city"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>City *</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     {...field}
//                                     className="bg-white"
//                                     placeholder="New York"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name="country"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Country *</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     {...field}
//                                     className="bg-white"
//                                     placeholder="USA"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   {/* RIGHT COLUMN: Description Editor */}
//                   <div className="h-full col-span-7">
//                     <FormField
//                       control={form.control}
//                       name="description"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col h-full">
//                           <FormLabel>Job Description *</FormLabel>
//                           <FormControl>
//                             <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex-grow">
//                               <QuillJs
//                                 content={field.value}
//                                 onContentChange={field.onChange}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 space-y-6  animate-in fade-in slide-in-from-right-4 duration-300">
//                   <FormField
//                     control={form.control}
//                     name="responsibilities"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Key Responsibilities</FormLabel>
//                         <FormDescription>
//                           What will they do day-to-day? (One per line)
//                         </FormDescription>
//                         <FormControl>
//                           <textarea
//                             {...field}
//                             rows={5}
//                             className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
//                             placeholder="- Lead the design team..."
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="qualifications"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Qualifications / Skills</FormLabel>
//                         <FormDescription>
//                           What must they have? (One per line)
//                         </FormDescription>
//                         <FormControl>
//                           <textarea
//                             {...field}
//                             rows={5}
//                             className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
//                             placeholder="- 5+ years React experience..."
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="tags"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Tags (comma separated)</FormLabel>
//                         <FormControl>
//                           <Input
//                             {...field}
//                             placeholder="react, typescript, remote, senior"
//                             className={THEME.inputFocus}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//             )}
//             {/* --- STEP 1: REQUIREMENTS --- */}
//             {currentStep === 1 && (
//               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//                 <FormField
//                   control={form.control}
//                   name="jobType"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Employment Type</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         value={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger className={THEME.inputFocus}>
//                             <SelectValue placeholder="Select type" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="FULL_TIME">Full-time</SelectItem>
//                           <SelectItem value="PART_TIME">Part-time</SelectItem>
//                           <SelectItem value="CONTRACT">Contract</SelectItem>
//                           <SelectItem value="INTERN">Internship</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </FormItem>
//                   )}
//                 />
//                 {jobType === 'CONTRACT' && (
//                   <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg grid grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="contractLengthValue"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Duration</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               {...field}
//                               className="bg-white"
//                             />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="contractLengthType"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Unit</FormLabel>
//                           <Select
//                             onValueChange={field.onChange}
//                             value={field.value}
//                           >
//                             <FormControl>
//                               <SelectTrigger className="bg-white">
//                                 <SelectValue />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent>
//                               <SelectItem value="MONTHS">Months</SelectItem>
//                               <SelectItem value="YEARS">Years</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="salaryMin"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Min Salary</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             {...field}
//                             className={THEME.inputFocus}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="salaryMax"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Max Salary</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             {...field}
//                             className={THEME.inputFocus}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="salaryPeriod"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Period</FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger className={THEME.inputFocus}>
//                               <SelectValue />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="YEAR">Per Year</SelectItem>
//                             <SelectItem value="MONTH">Per Month</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 {/* 1. BASIC SETTINGS */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="applyEmail"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Recruiter Email *</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                             <Input
//                               {...field}
//                               className={`pl-10 ${THEME.inputFocus}`}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="resumeRequiblue"
//                     render={({ field }) => (
//                       <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-white h-[46px] mt-8">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-sm">
//                             Require Resume/CV
//                           </FormLabel>
//                         </div>
//                         <FormControl>
//                           <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 {/* 2. SCREENING QUESTIONS (INDEED STYLE) */}
//                 <div className="space-y-4 pt-4 border-t border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                         <MessageSquare className="w-5 h-5 text-blue-500" />
//                         Applicant Questions
//                       </h3>
//                       <p className="text-sm text-gray-500">
//                         Ask candidates specific questions to screen them
//                         faster.
//                       </p>
//                     </div>
//                   </div>
//                   {/* Suggested Chips */}
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {SUGGESTED_QUESTIONS.map((q, idx) => (
//                       <Button
//                         key={idx}
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => addQuestion(q.text, q.type)}
//                         className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-500 border-blue-200"
//                       >
//                         <Plus className="w-3 h-3 mr-1" />{' '}
//                         {q.text.length > 30
//                           ? q.text.substring(0, 30) + '...'
//                           : q.text}
//                       </Button>
//                     ))}
//                   </div>
//                   {/* Dynamic List */}
//                   <div className="space-y-3">
//                     {fields.map((field, index) => (
//                       <div
//                         key={field.id}
//                         className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95"
//                       >
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.question`}
//                             render={({ field }) => (
//                               <FormItem className="col-span-1 md:col-span-3">
//                                 <FormControl>
//                                   <Input
//                                     {...field}
//                                     placeholder="Enter your question..."
//                                     className="bg-white"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.type`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="bg-white">
//                                       <SelectValue placeholder="Type" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     <SelectItem value="text">
//                                       Short Answer
//                                     </SelectItem>
//                                     <SelectItem value="boolean">
//                                       Yes / No
//                                     </SelectItem>
//                                     <SelectItem value="number">
//                                       Numeric
//                                     </SelectItem>
//                                     <SelectItem value="date">Date</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => remove(index)}
//                           className="text-blue-500 hover:text-blue-500 hover:bg-blue-50"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                     {fields.length === 0 && (
//                       <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
//                         <p className="text-gray-400 text-sm">
//                           No screening questions added yet.
//                         </p>
//                         <Button
//                           type="button"
//                           variant="link"
//                           onClick={() => addQuestion('', 'text')}
//                           className="text-blue-500"
//                         >
//                           Add Custom Question
//                         </Button>
//                       </div>
//                     )}
//                     {fields.length > 0 && (
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => addQuestion('', 'text')}
//                         className="w-full border-dashed text-gray-500"
//                       >
//                         <Plus className="w-4 h-4 mr-2" /> Add Another Question
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//                 {/* 3. ASSIGNMENT SECTION (EXISTING) */}
//                 <div className="pt-6 border-t border-gray-100">
//                   <FormField
//                     control={form.control}
//                     name="includeAssignment"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm mb-6">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base font-semibold text-blue-900">
//                             Include Screening Assignment?
//                           </FormLabel>
//                           <p className="text-xs text-blue-500/80">
//                             Candidates must complete a file upload or written
//                             task.
//                           </p>
//                         </div>
//                         <FormControl>
//                           <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             className="data-[state=checked]:bg-blue-600"
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   {includeAssignment && (
//                     <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-4">
//                       <FormField
//                         control={form.control}
//                         name="assignmentType"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Submission Type</FormLabel>
//                             <Tabs
//                               onValueChange={field.onChange}
//                               defaultValue={field.value}
//                               className="w-full"
//                             >
//                               <TabsList className="grid w-full grid-cols-2">
//                                 <TabsTrigger value="MANUAL">
//                                   <PenTool className="w-4 h-4 mr-2" />
//                                   Write Text
//                                 </TabsTrigger>
//                                 <TabsTrigger value="FILE">
//                                   <FileUp className="w-4 h-4 mr-2" />
//                                   Upload File
//                                 </TabsTrigger>
//                               </TabsList>
//                             </Tabs>
//                           </FormItem>
//                         )}
//                       />
//                       {assignmentType === 'MANUAL' ? (
//                         <FormField
//                           control={form.control}
//                           name="assignmentQuestion"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Assignment Instructions</FormLabel>
//                               <FormControl>
//                                 <textarea
//                                   {...field}
//                                   rows={4}
//                                   placeholder="e.g. Please analyze this dataset and..."
//                                   className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       ) : (
//                         <FormField
//                           control={form.control}
//                           name="assignmentFile"
//                           render={({
//                             field: { value, onChange, ...fieldProps },
//                           }) => (
//                             <FormItem>
//                               <FormLabel>Upload Brief (PDF/DOC)</FormLabel>
//                               <FormControl>
//                                 <Input
//                                   {...fieldProps}
//                                   type="file"
//                                   onChange={(e) => onChange(e.target.files)}
//                                   className="cursor-pointer bg-gray-50"
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//             {/* --- STEP 3: SCREENING & ASSIGNMENT --- */}
//             {/* {currentStep === 2 && (
//               <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="applyEmail"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Recruiter Email *</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                             <Input
//                               {...field}
//                               className={`pl-10 ${THEME.inputFocus}`}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="resumeRequiblue"
//                     render={({ field }) => (
//                       <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-white h-[46px] mt-8">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-sm">
//                             Require Resume/CV
//                           </FormLabel>
//                         </div>
//                         <FormControl>
//                           <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <div className="space-y-4 pt-4 border-t border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                         <MessageSquare className="w-5 h-5 text-blue-500" />
//                         Applicant Questions
//                       </h3>
//                       <p className="text-sm text-gray-500">
//                         Ask candidates specific questions to screen them
//                         faster.
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {SUGGESTED_QUESTIONS.map((q, idx) => (
//                       <Button
//                         key={idx}
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => addQuestion(q.text, q.type)}
//                         className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-500 border-blue-200"
//                       >
//                         <Plus className="w-3 h-3 mr-1" />{' '}
//                         {q.text.length > 30
//                           ? q.text.substring(0, 30) + '...'
//                           : q.text}
//                       </Button>
//                     ))}
//                   </div>
//                   <div className="space-y-3">
//                     {fields.map((field, index) => (
//                       <div
//                         key={field.id}
//                         className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95"
//                       >
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.question`}
//                             render={({ field }) => (
//                               <FormItem className="col-span-1 md:col-span-3">
//                                 <FormControl>
//                                   <Input
//                                     {...field}
//                                     placeholder="Enter your question..."
//                                     className="bg-white"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.type`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="bg-white">
//                                       <SelectValue placeholder="Type" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     <SelectItem value="text">
//                                       Short Answer
//                                     </SelectItem>
//                                     <SelectItem value="boolean">
//                                       Yes / No
//                                     </SelectItem>
//                                     <SelectItem value="number">
//                                       Numeric
//                                     </SelectItem>
//                                     <SelectItem value="date">Date</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => remove(index)}
//                           className="text-blue-500 hover:text-blue-500 hover:bg-blue-50"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                     {fields.length === 0 && (
//                       <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
//                         <p className="text-gray-400 text-sm">
//                           No screening questions added yet.
//                         </p>
//                         <Button
//                           type="button"
//                           variant="link"
//                           onClick={() => addQuestion('', 'text')}
//                           className="text-blue-500"
//                         >
//                           Add Custom Question
//                         </Button>
//                       </div>
//                     )}
//                     {fields.length > 0 && (
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => addQuestion('', 'text')}
//                         className="w-full border-dashed text-gray-500"
//                       >
//                         <Plus className="w-4 h-4 mr-2" /> Add Another Question
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//                 <div className="pt-6 border-t border-gray-100">
//                   <FormField
//                     control={form.control}
//                     name="includeAssignment"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm mb-6">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base font-semibold text-blue-900">
//                             Include Screening Assignment?
//                           </FormLabel>
//                           <p className="text-xs text-blue-500/80">
//                             Candidates must complete a file upload or written
//                             task.
//                           </p>
//                         </div>
//                         <FormControl>
//                           <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             className="data-[state=checked]:bg-blue-600"
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   {includeAssignment && (
//                     <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-4">
//                       <FormField
//                         control={form.control}
//                         name="assignmentType"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Submission Type</FormLabel>
//                             <Tabs
//                               onValueChange={field.onChange}
//                               defaultValue={field.value}
//                               className="w-full"
//                             >
//                               <TabsList className="grid w-full grid-cols-2">
//                                 <TabsTrigger value="MANUAL">
//                                   <PenTool className="w-4 h-4 mr-2" />
//                                   Write Text
//                                 </TabsTrigger>
//                                 <TabsTrigger value="FILE">
//                                   <FileUp className="w-4 h-4 mr-2" />
//                                   Upload File
//                                 </TabsTrigger>
//                               </TabsList>
//                             </Tabs>
//                           </FormItem>
//                         )}
//                       />
//                       {assignmentType === 'MANUAL' ? (
//                         <FormField
//                           control={form.control}
//                           name="assignmentQuestion"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Assignment Instructions</FormLabel>
//                               <FormControl>
//                                 <textarea
//                                   {...field}
//                                   rows={4}
//                                   placeholder="e.g. Please analyze this dataset and..."
//                                   className={`w-full rounded-md border border-input p-3 ${THEME.inputFocus}`}
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       ) : (
//                         <FormField
//                           control={form.control}
//                           name="assignmentFile"
//                           render={({
//                             field: { value, onChange, ...fieldProps },
//                           }) => (
//                             <FormItem>
//                               <FormLabel>Upload Brief (PDF/DOC)</FormLabel>
//                               <FormControl>
//                                 <Input
//                                   {...fieldProps}
//                                   type="file"
//                                   onChange={(e) => onChange(e.target.files)}
//                                   className="cursor-pointer bg-gray-50"
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )} */}
//           </form>
//         </Form>
//       </CardContent>
//       {/* Footer Navigation */}
//       <CardFooter className="flex justify-between border-t border-gray-100 bg-white/50 p-6">
//         <Button
//           variant="ghost"
//           onClick={handleBack}
//           disabled={currentStep === 0}
//           className="text-gray-500 hover:text-gray-900"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" /> Back
//         </Button>
//         {currentStep === STEPS.length - 1 ? (
//           <Button
//             onClick={form.handleSubmit(onSubmit)}
//             disabled={isSubmitting}
//             className={`px-8 bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-105  `}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Publishing...
//               </>
//             ) : (
//               <>
//                 Publish Now <CheckCircle2 className="ml-2 h-4 w-4" />
//               </>
//             )}
//           </Button>
//         ) : (
//           <Button
//             onClick={handleNext}
//             className={`px-8 bg-blue-500 hover:bg-blue-700 cursor-pointer hover:scale-105  `}
//           >
//             Next Step <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   </div>
// );
// return (
//   <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-12 flex flex-col items-center">
//     {/* --- HEADER SECTION --- */}
//     <div className="w-full  mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
//       <div>
//         <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
//           Create <span className="text-blue-600">Job Posting</span>
//         </h1>
//         <p className="text-slate-500 mt-2 text-lg font-medium">
//           Post your position to reach thousands of qualified candidates.
//         </p>
//       </div>
//       {/* Visual Step Indicator */}
//       <div className="flex items-center gap-2 bg-white p-2 rounded-full border shadow-sm">
//         {STEPS.map((step, idx) => (
//           <div key={idx} className="flex items-center">
//             <div
//               className={`
//             w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
//             ${
//               currentStep === idx
//                 ? 'bg-blue-600 text-white shadow-md scale-110'
//                 : currentStep > idx
//                   ? 'bg-green-100 text-green-600'
//                   : 'bg-slate-100 text-slate-400'
//             }
//           `}
//             >
//               {currentStep > idx ? (
//                 <CheckCircle2 className="w-5 h-5" />
//               ) : (
//                 idx + 1
//               )}
//             </div>
//             {idx < STEPS.length - 1 && (
//               <div className="w-6 h-0.5 bg-slate-100 mx-1" />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//     <Card
//       className={`w-full  border-none shadow-xl shadow-blue-500/5 bg-white/80 backdrop-blur-md overflow-visible`}
//     >
//       {/* Progress Bar (Integrated) */}
//       <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 rounded-t-xl overflow-hidden">
//         <div
//           className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
//           style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
//         />
//       </div>
//       <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-100">
//         <div className="flex items-center gap-4">
//           <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl ring-1 ring-blue-100">
//             <CurrentIcon className="w-6 h-6" />
//           </div>
//           <div>
//             <CardTitle className="text-2xl font-bold text-slate-800">
//               {STEPS[currentStep].name}
//             </CardTitle>
//             <CardDescription className="text-slate-500">
//               Provide the essential details to help candidates understand the
//               role.
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="p-8">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             {/* --- STEP 0: JOB OVERVIEW --- */}
//             {currentStep === 0 && (
//               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//                   {/* LEFT COLUMN: 5/12 width */}
//                   <div className="lg:col-span-5 space-y-6">
//                     <div className="space-y-4">
//                       <FormField
//                         control={form.control}
//                         name="title"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-slate-700 font-semibold">
//                               Job Title
//                             </FormLabel>
//                             <FormControl>
//                               <div className="relative group">
//                                 <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
//                                 <Input
//                                   placeholder="e.g. Senior Product Designer"
//                                   {...field}
//                                   className={`pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all ${THEME.inputFocus}`}
//                                 />
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="company"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-slate-700 font-semibold">
//                               Company Name
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="e.g. Stripe"
//                                 {...field}
//                                 className={`h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all ${THEME.inputFocus}`}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     {/* Enhanced Location Section */}
//                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
//                       <FormField
//                         control={form.control}
//                         name="remote"
//                         render={({ field }) => (
//                           <FormItem className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <Globe className="w-4 h-4 text-blue-500" />
//                               <FormLabel className="text-base font-semibold text-slate-800 cursor-pointer">
//                                 Remote Friendly
//                               </FormLabel>
//                             </div>
//                             <FormControl>
//                               <Switch
//                                 checked={field.value}
//                                 onCheckedChange={field.onChange}
//                                 className="data-[state=checked]:bg-blue-600 shadow-sm"
//                               />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />
//                       {!remote && (
//                         <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2 duration-300">
//                           <FormField
//                             control={form.control}
//                             name="city"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-xs uppercase tracking-wider text-slate-500 font-bold">
//                                   City
//                                 </FormLabel>
//                                 <FormControl>
//                                   <div className="relative">
//                                     <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
//                                     <Input
//                                       {...field}
//                                       className="pl-9 bg-white border-slate-200 h-10"
//                                       placeholder="London"
//                                     />
//                                   </div>
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name="country"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-xs uppercase tracking-wider text-slate-500 font-bold">
//                                   Country
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     {...field}
//                                     className="bg-white border-slate-200 h-10"
//                                     placeholder="UK"
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   {/* RIGHT COLUMN: 7/12 width (Rich Text) */}
//                   <div className="lg:col-span-7">
//                     <FormField
//                       control={form.control}
//                       name="description"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col h-full">
//                           <FormLabel className="text-slate-700 font-semibold mb-2">
//                             Job Description
//                           </FormLabel>
//                           <FormControl>
//                             <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex-grow shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
//                               <QuillJs
//                                 content={field.value}
//                                 onContentChange={field.onChange}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </div>
//                 {/* Bottom Row - Tags & Responsibilities */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
//                   <FormField
//                     control={form.control}
//                     name="responsibilities"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-slate-700 font-semibold">
//                           Key Responsibilities
//                         </FormLabel>
//                         <FormDescription>One impact per line</FormDescription>
//                         <FormControl>
//                           <textarea
//                             {...field}
//                             rows={4}
//                             className={`w-full rounded-xl border-slate-200 p-4 bg-slate-50/50 transition-all ${THEME.inputFocus}`}
//                             placeholder="• Drive technical architecture..."
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="tags"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-slate-700 font-semibold">
//                           Skills & Keywords
//                         </FormLabel>
//                         <FormDescription>Separated by commas</FormDescription>
//                         <FormControl>
//                           <Input
//                             {...field}
//                             placeholder="React, TypeScript, Figma..."
//                             className={`h-11 bg-slate-50/50 border-slate-200 ${THEME.inputFocus}`}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//             )}
//             {/* --- STEP 1: CONTRACT & PAY --- */}
//             {currentStep === 1 && (
//               <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//                   {/* Job Type & Pay Group */}
//                   <div className="space-y-6">
//                     <FormField
//                       control={form.control}
//                       name="jobType"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             Employment Type
//                           </FormLabel>
//                           <Select
//                             onValueChange={field.onChange}
//                             value={field.value}
//                           >
//                             <FormControl>
//                               <SelectTrigger
//                                 className={`h-12 border-slate-200 bg-slate-50/50 ${THEME.inputFocus}`}
//                               >
//                                 <SelectValue placeholder="Select type" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent className="rounded-xl">
//                               <SelectItem value="FULL_TIME">
//                                 Full-time
//                               </SelectItem>
//                               <SelectItem value="PART_TIME">
//                                 Part-time
//                               </SelectItem>
//                               <SelectItem value="CONTRACT">
//                                 Contract
//                               </SelectItem>
//                               <SelectItem value="INTERN">
//                                 Internship
//                               </SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </FormItem>
//                       )}
//                     />
//                     <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-6">
//                       <div className="flex items-center gap-2 text-blue-800 font-bold italic">
//                         <DollarSign className="w-5 h-5" /> Compensation Range
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         <FormField
//                           control={form.control}
//                           name="salaryMin"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs font-bold text-slate-500 uppercase">
//                                 Min
//                               </FormLabel>
//                               <FormControl>
//                                 <Input
//                                   type="number"
//                                   {...field}
//                                   className="bg-white border-slate-200 h-11"
//                                 />
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
//                         <FormField
//                           control={form.control}
//                           name="salaryMax"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs font-bold text-slate-500 uppercase">
//                                 Max
//                               </FormLabel>
//                               <FormControl>
//                                 <Input
//                                   type="number"
//                                   {...field}
//                                   className="bg-white border-slate-200 h-11"
//                                 />
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
//                         <FormField
//                           control={form.control}
//                           name="salaryPeriod"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs font-bold text-slate-500 uppercase">
//                                 Period
//                               </FormLabel>
//                               <Select
//                                 onValueChange={field.onChange}
//                                 value={field.value}
//                               >
//                                 <FormControl>
//                                   <SelectTrigger className="bg-white border-slate-200 h-11">
//                                     <SelectValue />
//                                   </SelectTrigger>
//                                 </FormControl>
//                                 <SelectContent>
//                                   <SelectItem value="YEAR">/ Year</SelectItem>
//                                   <SelectItem value="MONTH">
//                                     / Month
//                                   </SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </FormItem>
//                           )}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   {/* Recruiter Settings Group */}
//                   <div className="space-y-6">
//                     <FormField
//                       control={form.control}
//                       name="applyEmail"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-slate-700 font-semibold">
//                             Point of Contact Email
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative group">
//                               <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
//                               <Input
//                                 {...field}
//                                 className={`pl-10 h-12 bg-slate-50/50 border-slate-200 ${THEME.inputFocus}`}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-slate-100 rounded-lg">
//                           <FileUp className="w-4 h-4 text-slate-600" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-bold text-slate-800">
//                             Require Resume/CV
//                           </p>
//                           <p className="text-xs text-slate-500">
//                             Candidates must upload a file
//                           </p>
//                         </div>
//                       </div>
//                       <FormField
//                         control={form.control}
//                         name="resumeRequiblue"
//                         render={({ field }) => (
//                           <FormControl>
//                             <Switch
//                               checked={field.value}
//                               onCheckedChange={field.onChange}
//                             />
//                           </FormControl>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 {/* Screening Questions Card Style */}
//                 <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-6 shadow-2xl">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-xl font-bold flex items-center gap-2">
//                         <MessageSquare className="w-6 h-6 text-blue-400" />
//                         Screening Questions
//                       </h3>
//                       <p className="text-slate-400 text-sm mt-1">
//                         Filter candidates before you even interview them.
//                       </p>
//                     </div>
//                     <Button
//                       type="button"
//                       size="sm"
//                       onClick={() => addQuestion('', 'text')}
//                       className="bg-blue-600 hover:bg-blue-500 rounded-full"
//                     >
//                       <Plus className="w-4 h-4 mr-2" /> Custom Question
//                     </Button>
//                   </div>
//                   {/* Chips for suggested questions */}
//                   <div className="flex flex-wrap gap-2">
//                     {SUGGESTED_QUESTIONS.map((q, idx) => (
//                       <button
//                         key={idx}
//                         type="button"
//                         onClick={() => addQuestion(q.text, q.type)}
//                         className="text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 transition-colors flex items-center"
//                       >
//                         <Plus className="w-3 h-3 mr-2 text-blue-400" />{' '}
//                         {q.text}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
//                     {fields.map((field, index) => (
//                       <div
//                         key={field.id}
//                         className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 animate-in zoom-in-95"
//                       >
//                         <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.question`}
//                             render={({ field }) => (
//                               <Input
//                                 {...field}
//                                 className="md:col-span-3 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
//                                 placeholder="Ask something..."
//                               />
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`screeningQuestions.${index}.type`}
//                             render={({ field }) => (
//                               <Select
//                                 onValueChange={field.onChange}
//                                 defaultValue={field.value}
//                               >
//                                 <SelectTrigger className="bg-white/10 border-white/10 text-white">
//                                   <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="text">
//                                     Short Answer
//                                   </SelectItem>
//                                   <SelectItem value="boolean">
//                                     Yes / No
//                                   </SelectItem>
//                                   <SelectItem value="number">
//                                     Numeric
//                                   </SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             )}
//                           />
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => remove(index)}
//                           className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </form>
//         </Form>
//       </CardContent>
//       <CardFooter className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 rounded-b-xl flex justify-between items-center">
//         <Button
//           variant="ghost"
//           onClick={handleBack}
//           disabled={currentStep === 0}
//           className="text-slate-500 font-semibold hover:bg-white"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
//         </Button>
//         {currentStep === STEPS.length - 1 ? (
//           <Button
//             onClick={form.handleSubmit(onSubmit)}
//             disabled={isSubmitting}
//             className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 Finalizing...
//               </>
//             ) : (
//               <>
//                 Confirm & Publish <CheckCircle2 className="ml-2 h-5 w-5" />
//               </>
//             )}
//           </Button>
//         ) : (
//           <Button
//             onClick={handleNext}
//             className="h-12 px-10 bg-slate-900 hover:bg-black text-white rounded-full shadow-lg transition-all active:scale-95"
//           >
//             Continue <ArrowRight className="ml-2 h-5 w-5" />
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   </div>
// );
};
const __TURBOPACK__default__export__ = NewJobPost;
}),
];

//# sourceMappingURL=_e87583f2._.js.map