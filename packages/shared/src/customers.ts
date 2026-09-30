import { z } from "zod";

export const customerTiers = ["free", "pro", "enterprise"] as const;

export const customerTierSchema = z.enum(customerTiers);

export type CustomerTier = z.infer<typeof customerTierSchema>;

/** A customer company, as shown next to a ticket. */
export const organizationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: customerTierSchema,
});

export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;

export const organizationSchema = organizationSummarySchema.extend({
  domain: z.string(),
  customerSince: z.iso.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

/** A person at a customer organization. Tickets are requested by contacts. */
export const contactSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
});

export type Contact = z.infer<typeof contactSchema>;

/** The organization page. Ticket counts only include projects the current user can see. */
export const organizationDetailSchema = organizationSchema.extend({
  contacts: z.array(contactSchema),
  ticketCount: z.number().int().min(0),
  unresolvedTicketCount: z.number().int().min(0),
});

export type OrganizationDetail = z.infer<typeof organizationDetailSchema>;
