import { FileText, Users, type LucideIcon } from "lucide-react";

export const NAV: { href: string; title: string; icon: LucideIcon }[] = [
  { href: "/management", title: "Content", icon: FileText },
  { href: "/management/rsvps", title: "RSVPs", icon: Users },
];
