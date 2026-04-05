"use client";

import { useRouter } from "next/navigation";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { CURRENCIES, getCountryForCurrency } from "@/shared/lib/currency";
import { MAIN_STORES, OTHER_STORES } from "@/shared/lib/stores/constants";
import type { CurrencyCode } from "@/shared/lib/stores";
import Image from "next/image";
import { Button } from "@/shared/UI/Button";

type FooterHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

const FooterHeading = ({ children, className = "" }: FooterHeadingProps) => (
  <h3
    className={`text-xs font-bold text-primary uppercase tracking-wider mb-3 ${className}`}
  >
    {children}
  </h3>
);

const FooterLink = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="block text-sm text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer mb-2 text-left"
  >
    {children}
  </button>
);

export const Footer = () => {
  const router = useRouter();
  const currency = useFilterStore((s) => s.currency);
  const setCurrency = useFilterStore((s) => s.setCurrency);
  const clearSearch = useSearchStore((s) => s.clearSearch);

  return (
    <footer className="relative z-10 mt-15 bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between flex-wrap gap-8">
          {/* Quick Links & Socials */}
          <div className="w-full md:w-auto">
            <div className="flex w-full gap-6 md:w-fit md:flex-col">
              <div className="w-45 md:w-fit">
                <FooterHeading>Quick Links</FooterHeading>

                <div className="flex flex-col ml-2">
                  <FooterLink
                    onClick={() => {
                      router.push("/");
                      clearSearch();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Home
                  </FooterLink>
                </div>
              </div>

              <div className="w-45 md:w-fit">
                <FooterHeading>Socials</FooterHeading>

                <div className="flex flex-col ml-2">
                  <FooterLink>Twitter X</FooterLink>
                  <FooterLink>Discord</FooterLink>
                  <FooterLink>Github</FooterLink>
                </div>
              </div>
            </div>
          </div>

          {/* Supported Stores */}
          <div className="w-full md:w-auto">
            <FooterHeading>Supported Stores</FooterHeading>
            <div className="flex w-full gap-6 md:w-fit ml-2">
              <div className="w-45 md:w-fit">
                {Object.entries(MAIN_STORES).map(([name, { url }]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors mb-2"
                  >
                    {name}
                  </a>
                ))}
              </div>

              <div>
                {Object.entries(OTHER_STORES).map(([name, { url }]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors mb-2"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="w-full md:w-auto">
            <FooterHeading>Currency</FooterHeading>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-x-4 pl-1">
              {CURRENCIES.map((c) => (
                <Button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code as CurrencyCode)}
                  variant={currency === c.code ? "default" : "ghost"}
                >
                  <Image
                    src={`https://flagcdn.com/${c.country}.svg`}
                    alt={c.code}
                    width={16}
                    height={12}
                    className="rounded-sm object-cover"
                    style={{ width: 16, height: 12 }}
                  />

                  {c.code}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-5 pt-5">
          <p className="text-sm text-muted-foreground uppercase tracking-wider text-center">
            &copy; {new Date().getFullYear()} Nukaloot. High-performance price
            scraping.
          </p>
        </div>
      </div>
    </footer>
  );
};
