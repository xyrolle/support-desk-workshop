import type { User } from "@support-desk/shared";

/** The product team. Maya Chen is the demo user (see auth/current-user.ts). */
export const teammates: User[] = [
  teammate("maya-chen", "Maya Chen", "violet"),
  teammate("diego-alvarez", "Diego Alvarez", "amber"),
  teammate("priya-nair", "Priya Nair", "emerald"),
  teammate("lena-fischer", "Lena Fischer", "rose"),
  teammate("sam-okafor", "Sam Okafor", "sky"),
  teammate("hana-kim", "Hana Kim", "teal"),
  teammate("tomas-silva", "Tomás Silva", "indigo"),
  teammate("aisha-rahman", "Aisha Rahman", "emerald"),
  teammate("jonas-weber", "Jonas Weber", "sky"),
  teammate("chloe-martin", "Chloé Martin", "amber"),
  teammate("ravi-patel", "Ravi Patel", "rose"),
  teammate("olivia-brooks", "Olivia Brooks", "violet"),
];

function teammate(id: string, name: string, avatarColor: User["avatarColor"]): User {
  const [firstName = "", lastName = ""] = name.split(" ");
  return {
    id,
    name,
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
    email: `${id.replace("-", ".")}@brightcart.example`,
    avatarColor,
  };
}
