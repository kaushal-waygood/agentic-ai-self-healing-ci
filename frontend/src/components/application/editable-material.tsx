
"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Edit3, Download, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockUserProfile, mockOrganizations, planTierOrder } from "@/lib/data/user";
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface EditableMaterialProps {
  content: string;
  setContent: (value: string) => void;
  title: string;
  editorId: string;
  isHtml?: boolean;
  className?: string;
}

export function EditableMaterial({ content, setContent, title, editorId, isHtml = false, className }: EditableMaterialProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canUsePremiumFeatures, setCanUsePremiumFeatures] = useState(false);

  useEffect(() => {
    // Determine the user's effective plan
    const user = mockUserProfile;
    const org = user.organizationId ? mockOrganizations.find(o => o.id === user.organizationId) : null;
    let basePlanId = user.currentPlanId;
    if (user.role === 'OrgMember' && org) {
        basePlanId = org.planId;
    }
    const effectivePlanId = user.personalPlanId && planTierOrder[user.personalPlanId] > planTierOrder[basePlanId]
      ? user.personalPlanId
      : basePlanId;

    // Pro-level features
    setCanUsePremiumFeatures(planTierOrder[effectivePlanId] >= planTierOrder['plus']);
  }, []);

  const handleInput = () => {
    if (isHtml && editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
        if(editorRef.current) {
            setContent(editorRef.current.innerHTML);
            toast({ title: `${title} updated.`})
        }
    }
    setIsEditing(!isEditing);
  }

  useEffect(() => {
    if (isHtml && editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isHtml]);

  const handleCopy = () => {
    if (!content) return;
    const textToCopy = isHtml ? editorRef.current?.innerText || content : content;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: `${title} Copied!`, description: `${title} content (as text) copied to clipboard.` });
  };
  
  const handleDownloadPdf = () => {
    if (!editorRef.current) return;
    
    if (!canUsePremiumFeatures) {
        toast({ title: 'Upgrade to Download PDF', description: 'PDF downloads are a Plus feature.', action: <Button size="sm" asChild><Link href="/subscriptions">Upgrade Plan</Link></Button> });
        return;
    }

    setIsLoading(true);
    toast({ title: 'Generating PDF...' });

    const printableContainer = document.createElement('div');
    // Hide it off-screen
    printableContainer.style.position = 'absolute';
    printableContainer.style.left = '-9999px';
    printableContainer.style.top = '0';
    
    // This is our A4 page container, which will get its styles from globals.css
    const a4Page = document.createElement('div');
    a4Page.className = 'printable-a4'; // Use the CSS class for A4 sizing and padding
    a4Page.innerHTML = editorRef.current.innerHTML; // Put the CV content inside
    
    printableContainer.appendChild(a4Page);
    document.body.appendChild(printableContainer);
    
    html2canvas(a4Page, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`CareerPilot_${title.replace(/ /g, '_')}.pdf`);
      })
      .catch((err) => {
        console.error("PDF Generation Error:", err);
        toast({ variant: 'destructive', title: 'PDF Generation Failed' });
      })
      .finally(() => {
        document.body.removeChild(printableContainer);
        setIsLoading(false);
      });
  };

  return (
    <Card className={`shadow-sm border h-full flex flex-col ${className}`}>
      <CardContent className="p-4 pt-2 flex-grow flex flex-col">
        <p className="text-xs text-muted-foreground mb-2">{isEditing ? "Editing is active. Click 'Save Edits' when done." : "Click 'Edit' to make changes."}</p>
        {isHtml ? (
          <div
            id={editorId}
            ref={editorRef}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            className={cn(
                "flex-grow border rounded-md bg-white h-full min-h-[300px] overflow-y-auto focus-visible:outline-none", 
                isEditing && "ring-2 ring-primary shadow-inner"
            )}
            onInput={handleInput}
            aria-label={title}
          />
        ) : (
          <Textarea
            id={editorId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow resize-none border rounded-md focus-visible:ring-primary text-sm min-h-[200px]"
            aria-label={title}
            placeholder={`Content for ${title.toLowerCase()} will appear here.`}
          />
        )}
        <div className="mt-3 flex gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={!content || isLoading}>
            <Edit3 className="mr-2 h-4 w-4" />{isEditing ? 'Save Edits' : 'Edit'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content || isLoading}>
            <Copy className="h-4 w-4 mr-2" />Copy Text
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPdf} disabled={!isHtml || !content || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
            {!canUsePremiumFeatures && <ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
