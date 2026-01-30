(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/rich-text/Editor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$quill$2f$quill$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/quill/quill.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
// components/rich-text/Editor.tsx
'use client';
;
;
;
const Editor = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = _s(({ initialValue }, ref)=>{
    _s();
    const editorRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    const quillRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useRef(null);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useImperativeHandle(ref, {
        "Editor.useImperativeHandle": ()=>quillRef.current
    }["Editor.useImperativeHandle"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Editor.useEffect": ()=>{
            if (editorRef.current && !quillRef.current) {
                quillRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$quill$2f$quill$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"](editorRef.current, {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            [
                                {
                                    header: [
                                        1,
                                        2,
                                        3,
                                        false
                                    ]
                                }
                            ],
                            [
                                'bold',
                                'italic',
                                'underline',
                                'strike'
                            ],
                            [
                                {
                                    list: 'ordered'
                                },
                                {
                                    list: 'bullet'
                                }
                            ],
                            [
                                'link'
                            ],
                            [
                                'clean'
                            ]
                        ]
                    },
                    placeholder: 'Write your job description here...'
                });
                if (initialValue) {
                    quillRef.current.root.innerHTML = initialValue;
                }
            }
        }
    }["Editor.useEffect"], [
        initialValue
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: editorRef
    }, void 0, false, {
        fileName: "[project]/components/rich-text/Editor.tsx",
        lineNumber: 40,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
}, "hu0Rmr6Awg9S8/LLgTcqEfann88=")), "hu0Rmr6Awg9S8/LLgTcqEfann88=");
_c1 = Editor;
Editor.displayName = 'Editor';
const __TURBOPACK__default__export__ = Editor;
var _c, _c1;
__turbopack_context__.k.register(_c, "Editor$forwardRef");
__turbopack_context__.k.register(_c1, "Editor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$rich$2d$text$2f$Editor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/rich-text/Editor.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// components/rich-text/QuillJs.tsx
'use client';
;
;
const QuillJs = ({ content = '', onContentChange })=>{
    _s();
    const quillRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Only handle text changes, don't keep re-writing content to editor
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuillJs.useEffect": ()=>{
            if (!quillRef.current) return;
            const handler = {
                "QuillJs.useEffect.handler": ()=>{
                    const html = quillRef.current?.root.innerHTML || '';
                    onContentChange(html);
                }
            }["QuillJs.useEffect.handler"];
            quillRef.current.on('text-change', handler);
            return ({
                "QuillJs.useEffect": ()=>{
                    quillRef.current?.off('text-change', handler);
                }
            })["QuillJs.useEffect"];
        }
    }["QuillJs.useEffect"], [
        onContentChange
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-64",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$rich$2d$text$2f$Editor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            ref: quillRef,
            initialValue: content
        }, void 0, false, {
            fileName: "[project]/components/rich-text/QuillJs.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/rich-text/QuillJs.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(QuillJs, "H1oVj8fLuej8rHtfjBqXFhuz1cU=");
_c = QuillJs;
const __TURBOPACK__default__export__ = QuillJs;
var _c;
__turbopack_context__.k.register(_c, "QuillJs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_rich-text_80fc4779._.js.map