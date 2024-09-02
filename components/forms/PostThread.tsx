"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "../ui/textarea";
import { UserValidation } from "@/lib/validations/user";
import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";

function PostThread({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const organization = useOrganization();
  console.log(organization);

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      accountId: "",
      thread: "",
    },
  });

  async function onSubmit(values: z.infer<typeof ThreadValidation>) {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.organization?.id : null,
      path: pathname,
    });
    router.push("/");
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-4">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={13}
                  className="account-form_input no-focus border border-dark-4 bg-dark-3 text-light-1"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="bg-primary-500">Post Thread</Button>
      </form>
    </Form>
  );
}

export default PostThread;
