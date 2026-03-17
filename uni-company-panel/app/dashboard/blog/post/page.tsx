import CreateBlogForm from '@/components/blogs/PostBlog';

export const metadata = {
  title: 'Create New Post | Dashboard',
};

const Page = () => {
  return (
    <main className="">
      <div className="max-w-7xl mx-auto">
        <CreateBlogForm />
      </div>
    </main>
  );
};

export default Page;
