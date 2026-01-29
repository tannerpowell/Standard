import Link from "next/link";
import { companyInfo } from "@/data/navigation";

const footerLinks = [
  { name: "Services", href: "/services" },
  { name: "Training", href: "/training" },
  { name: "Environmental Services", href: "/environmental" },
  { name: "Careers", href: "/careers" },
  { name: "Contact Us", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Solid red footer bar */}
      <div className="bg-[#d51f26] px-5 py-8 text-center text-white sm:px-9 md:px-12 lg:px-20">
        {/* Navigation links - 16px, weight 400, letter-spacing .01em, line-height 1.8em */}
        <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 leading-[1.8em]">
          {footerLinks.map((link, index) => (
            <span key={link.name} className="flex items-center">
              <Link
                href={link.href}
                className="font-[family-name:var(--font-jost)] text-[14px] font-bold uppercase tracking-[0.08em] border-b-2 border-transparent text-[#efefef] no-underline transition-all duration-200 ease-in-out hover:border-white hover:text-[#ffffff]"
              >
                {link.name}
              </Link>
              {index < footerLinks.length - 1 && (
                <span className="ml-2 text-[#fafafa]/60">•</span>
              )}
            </span>
          ))}
        </nav>

        {/* Copyright */}
        <p className="font-[family-name:var(--font-jost)] text-[12px] font-semibold uppercase tracking-[0.06em] text-[#fafafa]/80">
          &copy;{currentYear} {companyInfo.name}
        </p>
      </div>
    </footer>
  );
}
