import type { Contact, Organization } from "@support-desk/shared";
import { asc, eq } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { contacts, organizations } from "../../db/schema.ts";

export function findOrganization(
  database: AppDatabase,
  organizationId: string,
): Organization | undefined {
  return database.select().from(organizations).where(eq(organizations.id, organizationId)).get();
}

export function findOrganizationContacts(database: AppDatabase, organizationId: string): Contact[] {
  return database
    .select({ id: contacts.id, name: contacts.name, email: contacts.email })
    .from(contacts)
    .where(eq(contacts.organizationId, organizationId))
    .orderBy(asc(contacts.name))
    .all();
}
