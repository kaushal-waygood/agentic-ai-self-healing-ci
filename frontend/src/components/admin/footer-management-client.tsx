
"use client";

import * as z from "zod";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Trash2,
  Save,
  GripVertical,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockFooterData, FooterData } from "@/lib/data/footer";
import { logAdminAction } from "@/lib/data/audit-logs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockUserProfile, mockAdminRoles } from "@/lib/data/user";

const linkSchema = z.object({
  text: z.string().min(1, "Link text cannot be empty."),
  href: z.string().min(1, "URL cannot be empty."),
});

const columnSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Column title cannot be empty."),
  links: z.array(linkSchema),
});

const socialSchema = z.object({
  name: z.enum(["Facebook", "Twitter", "Instagram", "Linkedin", "Youtube", "Tiktok"]),
  href: z.string().url("Must be a valid URL."),
});

const footerFormSchema = z.object({
  company: z.object({
    name: z.string().min(1, "Company name is required."),
    tagline: z.string().min(1, "Tagline is required."),
    address: z.string().min(1, "Address is required."),
    email: z.string().email("A valid email is required."),
    phone: z.string().min(1, "Phone number is required."),
    showAdminLogin: z.boolean(),
  }),
  linkColumns: z.array(columnSchema),
  newsletter: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    placeholder: z.string().min(1, "Placeholder text is required."),
  }),
  socials: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    links: z.array(socialSchema),
  }),
  copyright: z.string().min(1, "Copyright text is required."),
});

type FooterFormValues = z.infer<typeof footerFormSchema>;

export function FooterManagementClient({
  initialData,
}: {
  initialData: FooterData;
}) {
  const { toast } = useToast();

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: initialData,
  });

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
    move: moveColumn,
  } = useFieldArray({
    control: form.control,
    name: "linkColumns",
  });
  
  const loggedInAdmin = mockUserProfile;
  const loggedInAdminRole = mockAdminRoles.find(r => r.id === loggedInAdmin.adminRoleId);
  const canUpdate = loggedInAdminRole?.permissions.content_update_footer ?? false;


  const onSubmit = (values: FooterFormValues) => {
    // In a real app, this would be an API call
    Object.assign(mockFooterData, values);

    logAdminAction("SYSTEM_CONFIG_CHANGE", "footer", "Updated footer content.");
    toast({
      title: "Footer Updated",
      description: "The application footer has been successfully updated.",
    });
    form.reset(values); // Reset to show the form is no longer "dirty"
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={!canUpdate}>
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details shown in the footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="company.showAdminLogin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Admin Login Button</FormLabel>
                      <FormDescription>
                        Display a link to the admin panel in the footer.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Link Columns</CardTitle>
              <CardDescription>
                Manage the columns of links in the footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {columnFields.map((column, colIndex) => (
                <Card key={column.id} className="p-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <FormField
                      control={form.control}
                      name={`linkColumns.${colIndex}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel>Column {colIndex + 1} Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-1 pl-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveColumn(colIndex, colIndex - 1)}
                        disabled={colIndex === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveColumn(colIndex, colIndex + 1)}
                        disabled={colIndex === columnFields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeColumn(colIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <LinksArray colIndex={colIndex} />
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendColumn({ id: `col-${Date.now()}`, title: "", links: [] })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Column
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Newsletter & Socials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="newsletter.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Newsletter Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newsletter.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Newsletter Description</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newsletter.placeholder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Newsletter Input Placeholder</FormLabel>
                    <FormControl><Input {...field} /></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <Separator/>
              <FormField
                control={form.control}
                name="socials.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Socials Section Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socials.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Socials Section Description</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl><FormMessage />
                  </FormItem>
                )}
              />
              <SocialsArray />
            </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>Copyright</CardTitle></CardHeader>
              <CardContent>
                  <FormField
                      control={form.control}
                      name="copyright"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Copyright Text</FormLabel>
                          <FormControl><Input {...field} /></FormControl><FormMessage />
                          </FormItem>
                      )}
                  />
              </CardContent>
          </Card>
        </fieldset>
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={!form.formState.isDirty || !canUpdate}>
            <Save className="mr-2 h-4 w-4" /> Save All Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper component to manage nested link array
function LinksArray({ colIndex }: { colIndex: number }) {
  const { control } = useFormContext();
  const {
    fields: linkFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `linkColumns.${colIndex}.links`,
  });

  return (
    <div className="space-y-2 pt-4">
      {linkFields.map((link, linkIndex) => (
        <div key={link.id} className="flex items-end gap-2">
          <FormField
            control={control}
            name={`linkColumns.${colIndex}.links.${linkIndex}.text`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">Link Text</FormLabel>
                <FormControl>
                  <Input placeholder="Link Text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`linkColumns.${colIndex}.links.${linkIndex}.href`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">URL</FormLabel>
                <FormControl>
                  <Input placeholder="URL (e.g., /about)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(linkIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ text: "", href: "" })}
        className="mt-2"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
      </Button>
    </div>
  );
}

// Helper component for social links
function SocialsArray() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "socials.links"
    });

    return (
        <div className="space-y-2 pt-2">
             <FormLabel>Social Media Links</FormLabel>
             {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                    <FormField
                        control={control}
                        name={`socials.links.${index}.name`}
                        render={({ field: f }) => (
                        <FormItem className="w-1/3">
                            <FormLabel className="sr-only">Platform</FormLabel>
                            <Select onValueChange={f.onChange} defaultValue={f.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Twitter">Twitter</SelectItem>
                                <SelectItem value="Instagram">Instagram</SelectItem>
                                <SelectItem value="Linkedin">Linkedin</SelectItem>
                                <SelectItem value="Youtube">Youtube</SelectItem>
                                <SelectItem value="Tiktok">Tiktok</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`socials.links.${index}.href`}
                        render={({ field: f }) => (
                        <FormItem className="flex-grow">
                             <FormLabel className="sr-only">URL</FormLabel>
                            <FormControl><Input placeholder="https://..." {...f} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
             ))}
             <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: "Facebook", href: ""})} disabled={fields.length >= 6} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Social Link
            </Button>
        </div>
    )
}
