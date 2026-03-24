"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  CircleUserRound,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
} from "lucide-react";

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();

  const sections = [
    {
      label: "Overview",
      links: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/flats", label: "Manage Flats", icon: Building2 },
      ],
    },
    {
      label: "Billing",
      links: [
        { href: "/admin/subscriptions", label: "Subscriptions", icon: ScrollText },
        { href: "/admin/monthly-records", label: "Monthly Records", icon: ReceiptText },
        { href: "/admin/payment-entry", label: "Payment Entry", icon: CreditCard },
        { href: "/admin/reports", label: "Reports", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Settings",
      links: [
        { href: "/profile", label: "Admin Profile", icon: CircleUserRound },
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffeaa7]">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={`app-sidebar-link ${isActive(link.href) ? "app-sidebar-link-active" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
