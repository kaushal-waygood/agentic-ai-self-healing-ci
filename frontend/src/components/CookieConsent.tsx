// app/cookie-policy/page.jsx

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose lg:prose-xl">
        <p>
          This is our cookie policy. Here you can explain in detail what cookies
          are, how you use them on your website, and what types of cookies you
          use.
        </p>

        <h2 className="mt-8">What Are Cookies?</h2>
        <p>
          A cookie is a small text file that a website stores on your computer
          or mobile device when you visit the site...
        </p>

        <h2 className="mt-8">How We Use Cookies</h2>
        <ul>
          <li>
            <strong>Necessary Cookies:</strong> These are required for the
            website to function properly.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> These help us understand user
            behavior to improve our services. We use Google Analytics for this
            purpose.
          </li>
        </ul>

        <h2 className="mt-8">Managing Your Preferences</h2>
        <p>
          You can change your cookie preferences at any time by clicking the
          "Manage Cookies" link in the footer of our website.
        </p>
      </div>
    </div>
  );
}
