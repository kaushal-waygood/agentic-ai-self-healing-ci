(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript, next/dynamic entry, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_a584b30d._.js",
  "static/chunks/components_rich-text_80fc4779._.js",
  {
    "path": "static/chunks/node_modules_quill_dist_quill_snow_aa244817.css",
    "included": [
      "[project]/node_modules/quill/dist/quill.snow.css [app-client] (css)"
    ]
  },
  "static/chunks/components_rich-text_QuillJs_tsx_5b7adb07._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/components/rich-text/QuillJs.tsx [app-client] (ecmascript, next/dynamic entry)");
    });
});
}),
]);