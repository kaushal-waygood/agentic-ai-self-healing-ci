
import { PageHeader } from "@/components/common/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";

const faqItems = [
  {
    id: "cv-creation",
    question: "How do I create or upload a CV?",
    answer: "During onboarding, you'll be prompted to either upload an existing CV (PDF, DOCX) or fill out a form with your details. You can also manage your CV later from the 'CV Generator' page in the main application.",
  },
  {
    id: "ai-tailoring",
    question: "How does the AI tailor my application (CV, Cover Letter, Email)?",
    answer: "When you select a job and choose 'Prepare Application', our AI analyzes the job description, your stored CV, and any narratives you've provided. It then rewrites sections of your CV to highlight relevant skills, drafts a targeted cover letter, and prepares an email, all specific to that job.",
  },
  {
    id: "subscription-benefits",
    question: "What are the benefits of upgrading to a Plus or Pro plan?",
    answer: "Upgraded plans offer features like more CV and cover letter templates, higher application submission limits, fully automated job application submissions to portals (Plus/Pro), AI job matching scores (Pro), and advanced ATS-friendly CV creation (Pro). Check the 'Subscription' page for full details.",
  },
  {
    id: "referral-program",
    question: "How does the referral program work?",
    answer: "Share your unique referral code or link found on the 'Referral Program' page. When friends sign up using your code/link, you earn application credits. These credits can be used for more applications on the Basic plan or for other benefits.",
  },
   {
    id: "data-security",
    question: "Is my data secure?",
    answer: "We prioritize your data security. Personal information and application materials are handled with care. For features like AI Direct Apply (Plus/Pro), credentials are encrypted and managed securely. Always use strong, unique passwords for any linked accounts.",
  },
  {
    id: "application-limits",
    question: "What are the application limits for the Basic plan?",
    answer: "Basic plan users can submit up to 2 applications per day, with a maximum of 10 applications per month. To submit more, consider upgrading to a Plus or Pro plan.",
  },
  {
    id: "contact-support",
    question: "I have a question not listed here, how can I get help?",
    answer: "You can try our AI Assistant for quick questions about using CareerPilot. For more complex issues or account-specific inquiries, please email us at support@careerpilot.example.com.",
  }
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support Center"
        description="Find answers to common questions and get help with CareerPilot."
        icon={LifeBuoy}
      />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary"/>
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger className="font-medium text-left hover:no-underline text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">AI Assistant</CardTitle>
              <CardDescription>
                Have a specific question? Our AI Assistant can help guide you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/ai-assistant">
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat with AI Assistant
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Contact Us</CardTitle>
              <CardDescription>
                If you can't find an answer, feel free to reach out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For further assistance, please email us at: <br />
                <a href="mailto:support@careerpilot.example.com" className="text-primary hover:underline font-medium">
                  support@careerpilot.example.com
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                We typically respond within 24-48 business hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
