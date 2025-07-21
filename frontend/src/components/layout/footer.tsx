
"use client";

import Link from "next/link";
import { mockFooterData } from "@/lib/data/footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Rocket,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.5 4A3.5 3.5 0 0 0 13 7.5V15a6 6 0 1 1-6-6v2.5a3.5 3.5 0 1 0 7 0V9a1.5 1.5 0 0 1-3 0V7.5a1.5 1.5 0 0 1 3 0V15a4.5 4.5 0 1 1-9 0V7.5a6 6 0 1 1 12 0v-2a1.5 1.5 0 0 0-1.5-1.5Z" />
  </svg>
);

const socialIcons: { [key: string]: React.ElementType } = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TiktokIcon,
};

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isClient, setIsClient] = useState(false);
  const footerData = mockFooterData;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thanks for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Rocket className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">
                {footerData.company.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {footerData.company.tagline}
            </p>
            <div className="space-y-1 text-sm">
              <p>{footerData.company.address}</p>
              <p>
                <strong>Email:</strong> {footerData.company.email}
              </p>
              <p>
                <strong>Phone:</strong> {footerData.company.phone}
              </p>
            </div>
            {isClient && footerData.company.showAdminLogin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/primary-admin/login">
                  Admin Login
                </Link>
              </Button>
            )}
          </div>

          {/* Link Columns */}
          {footerData.linkColumns.map((column) => (
            <div key={column.id}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-2">
              {footerData.newsletter.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {footerData.newsletter.description}
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex items-center gap-2"
            >
              <Input
                type="email"
                placeholder={footerData.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                required
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-2">
              {footerData.socials.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {footerData.socials.description}
            </p>
            <div className="flex items-center gap-4">
              {isClient && footerData.socials.links.map((social) => {
                const Icon = socialIcons[social.name.toLowerCase()];
                return Icon ? (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Icon className="h-6 w-6" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted/50">
        <div className="container py-4 text-center text-xs text-muted-foreground">
          <p>{footerData.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
