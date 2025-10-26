import { Link, useLocation } from "wouter";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImage from "@assets/cropped-INSAN-FIZIK-TEDAVI-son-logo_1761513912032.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Ana Sayfa" },
    { path: "/hakkimizda", label: "Hakkımızda" },
    { path: "/hizmetler", label: "Hizmetler" },
    { path: "/ekip", label: "Uzman Kadromuz" },
    { path: "/blog", label: "Blog" },
    { path: "/iletisim", label: "İletişim" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" data-testid="link-home">
            <img src={logoImage} alt="İnsan Fizik Tedavi Logo" className="h-12 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === item.path ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" size="default" asChild data-testid="button-call">
              <a href="tel:+905326127244">
                <Phone className="h-4 w-4 mr-2" />
                Hemen Ara
              </a>
            </Button>
            <Button variant="default" size="default" asChild data-testid="button-appointment">
              <Link href="/randevu">Randevu Al</Link>
            </Button>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span
                    className={`text-sm font-medium cursor-pointer ${
                      location === item.path ? "text-primary" : "text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="default" asChild data-testid="mobile-button-call">
                  <a href="tel:+905326127244">
                    <Phone className="h-4 w-4 mr-2" />
                    Hemen Ara
                  </a>
                </Button>
                <Button variant="default" size="default" asChild data-testid="mobile-button-appointment">
                  <Link href="/randevu" onClick={() => setMobileMenuOpen(false)}>
                    Randevu Al
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
