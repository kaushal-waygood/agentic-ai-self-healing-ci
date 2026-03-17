// Default values for a blog post
export const blogDefaultValues = {
  title: '',
  slug: '',
  author: '',
  category: [],
  shortDescription: '',
  fullDescription: '',
  allowComments: true,
  seo: {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    robots: 'index,follow',
    openGraph: {
      ogTitle: '',
      ogDescription: '',
      ogType: 'article',
      ogUrl: '',
    },
    twitter: {
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
    },
    structuredData: {
      schemaType: 'BlogPosting',
      customSchema: '',
    },
  },
};
