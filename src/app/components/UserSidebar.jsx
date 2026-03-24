"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  House,
  LayoutDashboard,
  ReceiptText,
  UserRound,
} from "lucide-react";

export default function UserSidebar({ onNavigate }) {
  const pathname = usePathname();
  const currentDate = new Date();
  const month = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const links = [
    { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { label: "Subscriptions", href: "/user/subscriptions", icon: House },
    {
      label: "Monthly Details",
      href: `/user/subscriptions/${month}`,
      icon: ReceiptText,
    },
    { label: "My Payments", href: "/user/payments", icon: CreditCard },
    { label: "Profile", href: "/profile", icon: UserRound },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`app-sidebar-link ${isActive ? "app-sidebar-link-active" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
