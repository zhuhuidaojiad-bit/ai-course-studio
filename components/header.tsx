import Link from "next/link";
import { getAdminRecord, getViewerContext } from "@/lib/access";

const links = [
  { href: "/", label: "首页" },
  { href: "/auth", label: "登录" },
  { href: "/redeem", label: "激活码" },
  { href: "/workspace", label: "学习区" },
];

export async function Header() {
  const viewer = await getViewerContext();
  const adminRecord = viewer.userId ? await getAdminRecord(viewer.userId) : null;
  const navLinks = adminRecord ? [...links, { href: "/admin", label: "后台" }] : links;

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">A</span>
        <span>
          <strong>AI 兴趣班</strong>
          <small>学习中心</small>
        </span>
      </Link>
      <nav className="nav">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
