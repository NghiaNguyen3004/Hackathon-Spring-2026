"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, MessageCircle, User } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    {name: "post", path: "/post", icon: Home},
    {name: "requests", path: "/requests", icon: FileText},
    {name: "messages", path: "/messages", icon: MessageCircle},
    {name: "Profile", path: "/profile", icon: User},
  ];

  return(
    <nav className="space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.path;
        const Icon = link.icon;

        return(
          <Link
            key={link.path}
            href={link.path}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200
            ${
              isActive
              ? "bg-red-600 text-white shadow-md"
              : "hover:bg-red-300"
            }`}>
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
        )
      })}
    </nav>
  )
}
