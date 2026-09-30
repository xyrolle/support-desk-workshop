import type { CustomerTier } from "@support-desk/shared";

export type SeedOrganization = {
  id: string;
  name: string;
  domain: string;
  tier: CustomerTier;
  /** How long they have been a customer, relative to the seed date. */
  customerForDays: number;
  /** Full names. Each contact's email is their first name at the domain. */
  contacts: string[];
};

/** Merchants on Brightcart, the commerce platform whose support team uses Support Desk. */
export const seedOrganizations: SeedOrganization[] = [
  organization("Northgate Outfitters", "enterprise", 1510, [
    "Anna Berg",
    "Marcus Lindqvist",
    "Sofia Nystrom",
    "Erik Dahl",
    "Ingrid Holm",
  ]),
  organization("Harbor & Pine Home", "enterprise", 1220, [
    "Rachel Goldberg",
    "Tom Whitaker",
    "Nina Alvarado",
    "Ben Carter",
  ]),
  organization("Kestrel Cycles", "enterprise", 980, ["Jasper Vos", "Femke de Wit", "Lotte Bakker"]),
  organization("Meridian Pharmacy", "enterprise", 870, [
    "Claire Dubois",
    "Hugo Laurent",
    "Amelie Roche",
    "Julien Mercier",
  ]),
  organization("Atlas Sports Group", "enterprise", 1405, [
    "Daniel Okoye",
    "Grace Mensah",
    "Kwame Asante",
    "Laura Fitzgerald",
  ]),
  organization("Bluefin Grocers", "enterprise", 640, [
    "Kenji Watanabe",
    "Emily Tanaka",
    "Oscar Reyes",
  ]),
  organization("Solstice Beauty", "enterprise", 760, [
    "Isabella Rossi",
    "Marco Bianchi",
    "Giulia Conti",
    "Chiara Ricci",
  ]),
  organization("Vantage Electronics", "enterprise", 1105, [
    "Mateusz Kowalski",
    "Agnieszka Nowak",
    "Piotr Zielinski",
  ]),
  organization("Bluebird Coffee Roasters", "pro", 540, ["Sam Hollis", "Priyanka Desai"]),
  organization("Juniper Kids", "pro", 410, ["Hannah Moore", "Lucas Petit", "Mia Schneider"]),
  organization("Copperleaf Tea", "pro", 690, ["Wei Zhang", "Lily Chen"]),
  organization("Fernhill Garden Supply", "pro", 820, ["George Hughes", "Alice Pemberton"]),
  organization("Tidewater Surf Co.", "pro", 300, ["Kai Makoa", "Leilani Kahale"]),
  organization("Oak & Anchor Furniture", "pro", 955, [
    "Oliver Brennan",
    "Siobhan Murphy",
    "Declan Walsh",
  ]),
  organization("Little Otter Books", "pro", 260, ["Emma Lindgren"]),
  organization("Saltwind Apparel", "pro", 505, ["Noah Fischer", "Clara Weber"]),
  organization("Paper Crane Stationery", "pro", 380, ["Yuki Sato", "Aiko Mori"]),
  organization("Wildroot Nutrition", "pro", 730, ["Carlos Mendes", "Beatriz Santos"]),
  organization("Ember Candle Works", "pro", 195, ["Molly Parker"]),
  organization("Lumen Lighting", "pro", 610, ["Stefan Novak", "Petra Horvat", "Luka Babic"]),
  organization("Granite Peak Outdoor", "pro", 1030, ["Jake Morrison", "Ava Sullivan"]),
  organization("Velvet Fox Vintage", "pro", 340, ["Zoe Adams"]),
  organization("Brightside Pet Supply", "pro", 470, ["Ethan Brooks", "Chloe Ramirez"]),
  organization("Nordic Knit", "pro", 590, ["Astrid Hansen", "Lars Pedersen"]),
  organization("Maple Street Bakery", "free", 120, ["Olivia Grant"]),
  organization("Cedar & Sage", "free", 210, ["Imani Johnson", "Tariq Hassan"]),
  organization("Pixel Pals Toys", "free", 95, ["Leo Martins"]),
  organization("Honeycomb Crafts", "free", 150, ["Ruth Evans"]),
  organization("Riverbend Ceramics", "free", 330, ["Ana Silva", "Pedro Costa"]),
  organization("Sunday Socks", "free", 60, ["Jonah Levi"]),
  organization("Moss & Stone", "free", 240, ["Freya Olsen"]),
  organization("Fig & Olive Deli", "free", 175, ["Dimitri Papadakis", "Elena Georgiou"]),
  organization("Tiny Forest Plants", "free", 45, ["Mei Lin"]),
  organization("Studio Nine Prints", "free", 280, ["Arjun Mehta"]),
  organization("Hilltop Honey", "free", 400, ["Martha Collins"]),
  organization("Blue Door Records", "free", 135, ["Felix Wagner", "Jonas Keller"]),
  organization("Cobalt Skate Shop", "free", 80, ["Diego Ramos"]),
  organization("Poppy Lane Florist", "free", 365, ["Sophie Turner"]),
  organization("Driftwood Jewelry", "free", 220, ["Layla Haddad"]),
  organization("Lucky Clover Games", "free", 160, ["Sean O'Neill", "Aoife Byrne"]),
];

function organization(
  name: string,
  tier: CustomerTier,
  customerForDays: number,
  contacts: string[],
): SeedOrganization {
  const slug = toSlug(name);
  const domain = `${slug.replaceAll("-", "")}.example`;
  return { id: slug, name, domain, tier, customerForDays, contacts };
}

/** "Oak & Anchor Furniture" → "oak-anchor-furniture" */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => [...word].filter(isLetterOrDigit).join(""))
    .filter((word) => word.length > 0)
    .join("-");
}

function isLetterOrDigit(character: string): boolean {
  return (character >= "a" && character <= "z") || (character >= "0" && character <= "9");
}
