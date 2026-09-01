import Link from "next/link";

const LINKS = [
  { href: "/", label: "ภาพรวม" },
  { href: "/researchers", label: "คณาจารย์" },
  { href: "/publications", label: "ผลงานตีพิมพ์" },
  { href: "/admin/classify", label: "จัดประเภท" },
  { href: "/admin/researchers/new", label: "+ คณาจารย์" },
  { href: "/admin/publications/new", label: "+ ผลงาน" },
  { href: "/admin/import", label: "นำเข้า TCI/อื่นๆ" },
  { href: "/admin/import-scholar", label: "นำเข้า Google Scholar" },
  { href: "/admin/import-scopus", label: "นำเข้า Scopus" },
];

export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-slate-900">
          InnoEDU — ระบบจัดการนวัตกรรมจากผลงานตีพิมพ์
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-blue-600">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
