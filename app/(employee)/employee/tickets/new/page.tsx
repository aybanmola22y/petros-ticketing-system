"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { RouteGuard } from "@/components/shared/route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/shared/auth-context";
import { createTicket } from "@/lib/services/ticket-service";
import { createTicketSchema, type CreateTicketInput } from "@/lib/validations/ticket";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/constants";

export default function NewTicketPage() {
  return (
    <RouteGuard requiredRole="employee">
      <EmployeeLayout>
        <NewTicketForm />
      </EmployeeLayout>
    </RouteGuard>
  );
}

function NewTicketForm() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: "medium" },
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  async function onSubmit(data: CreateTicketInput) {
    if (!user) return;
    const ticket = createTicket({ ...data, userId: user.id });
    toast.success(`Ticket ${ticket.ticketNumber} created successfully`);
    router.push(`/employee/tickets/${ticket.id}`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Submit a Ticket</h1>
        <p className="text-muted-foreground mt-1">
          Describe your issue and our support team will get back to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help us resolve your issue
            faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) =>
                    setValue("category", v as CreateTicketInput["category"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(v) =>
                    setValue("priority", v as CreateTicketInput["priority"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include steps to reproduce if applicable."
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
