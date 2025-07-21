
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
import { PlusCircle, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockHeaderData, HeaderNavItem } from "@/lib/data/header";
import { logAdminAction } from "@/lib/data/audit-logs";
import { Separator } from "@/components/ui/separator";
import { mockUserProfile, mockAdminRoles } from "@/lib/data/user";

const navItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title cannot be empty."),
  href: z.string().optional(),
  children: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Title cannot be empty."),
    href: z.string().min(1, "URL is required for sub-items."),
  })).optional(),
});

const headerFormSchema = z.object({
  navItems: z.array(navItemSchema),
});

type HeaderFormValues = z.infer<typeof headerFormSchema>;

export function HeaderManagementClient({ initialData }: { initialData: HeaderNavItem[] }) {
  const { toast } = useToast();

  const form = useForm<HeaderFormValues>({
    resolver: zodResolver(headerFormSchema),
    defaultValues: { navItems: initialData },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "navItems",
  });
  
  const loggedInAdmin = mockUserProfile;
  const loggedInAdminRole = mockAdminRoles.find(r => r.id === loggedInAdmin.adminRoleId);
  const canUpdate = loggedInAdminRole?.permissions.content_update_header ?? false;

  const onSubmit = (values: HeaderFormValues) => {
    Object.assign(mockHeaderData, values.navItems);
    logAdminAction("SYSTEM_CONFIG_CHANGE", "header", "Updated header navigation links.");
    toast({
      title: "Header Updated",
      description: "The application header navigation has been successfully updated.",
    });
    form.reset(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={!canUpdate}>
          <Card>
            <CardHeader>
              <CardTitle>Header Navigation Items</CardTitle>
              <CardDescription>
                Manage the links and dropdown menus in the main site header.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <FormField
                      control={form.control}
                      name={`navItems.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel>Top-Level Item Title</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-1 pl-4">
                      <Button type="button" variant="ghost" size="icon" onClick={() => move(index, index - 1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Only show Href for non-dropdown items */}
                  {(!form.watch(`navItems.${index}.children`) || form.watch(`navItems.${index}.children`)?.length === 0) && (
                      <FormField
                          control={form.control}
                          name={`navItems.${index}.href`}
                          render={({ field }) => (
                            <FormItem className="flex-grow mt-2">
                              <FormLabel>URL</FormLabel>
                              <FormControl><Input placeholder="/example" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                  )}
                  
                  <Separator className="my-4" />
                  <SubItemsArray navIndex={index} />
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: `nav-${Date.now()}`, title: "New Item", href: "#", children: [] })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Top-Level Item
              </Button>
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

function SubItemsArray({ navIndex }: { navIndex: number }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `navItems.${navIndex}.children`,
  });

  return (
    <div className="space-y-2 pt-2 pl-4 border-l">
      <h4 className="text-sm font-medium text-muted-foreground">Dropdown Sub-Items</h4>
      {fields.map((item, subIndex) => (
        <div key={item.id} className="flex items-end gap-2">
          <FormField
            control={control}
            name={`navItems.${navIndex}.children.${subIndex}.title`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">Sub-Item Title</FormLabel>
                <FormControl><Input placeholder="Sub-Item Title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`navItems.${navIndex}.children.${subIndex}.href`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">Sub-Item URL</FormLabel>
                <FormControl><Input placeholder="/example" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(subIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
            append({ id: `sub-${Date.now()}`, title: "New Sub-Item", href: "#" });
            // When adding a subitem, clear the top-level href
            const { getValues, setValue } = control;
            const currentValues = getValues();
            currentValues.navItems[navIndex].href = "";
            setValue("navItems", currentValues.navItems);
        }}
        className="mt-2"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-Item
      </Button>
       <FormDescription className="text-xs">
        Adding a sub-item will turn this into a dropdown menu. The top-level URL will be ignored.
      </FormDescription>
    </div>
  );
}
