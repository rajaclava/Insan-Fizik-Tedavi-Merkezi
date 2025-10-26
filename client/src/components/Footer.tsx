import { Link } from "wouter";
import { Phone, MapPin, Mail, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
            <p className="text-sm text-secondary-foreground/80">
              İnsan Fizik Tedavi ve Rehabilitasyon Merkezi olarak, uzman kadromuz ve modern ekipmanlarımızla
              sağlıklı bir yaşam için yanınızdayız.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hakkimizda" data-testid="footer-link-about">
                  <span className="hover:text-primary transition-colors cursor-pointer">Hakkımızda</span>
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" data-testid="footer-link-services">
                  <span className="hover:text-primary transition-colors cursor-pointer">Hizmetler</span>
                </Link>
              </li>
              <li>
                <Link href="/ekip" data-testid="footer-link-team">
                  <span className="hover:text-primary transition-colors cursor-pointer">Uzman Kadromuz</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" data-testid="footer-link-blog">
                  <span className="hover:text-primary transition-colors cursor-pointer">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/iletisim" data-testid="footer-link-contact">
                  <span className="hover:text-primary transition-colors cursor-pointer">İletişim</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>Fizik Tedavi</li>
              <li>Manuel Terapi</li>
              <li>Ortopedik Rehabilitasyon</li>
              <li>Skolyoz Tedavisi</li>
              <li>Bel ve Boyun Fıtığı</li>
              <li>Nörolojik Rehabilitasyon</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href="tel:+905326127244" className="hover:text-primary transition-colors" data-testid="footer-phone">
                  +90 532 612 72 44
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-secondary-foreground/80">
                  19 Mayıs, Dicle Sk. No:40, 34522 Büyükçekmece/İstanbul
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href="mailto:info@insanfiziktedavi.com" className="hover:text-primary transition-colors" data-testid="footer-email">
                  info@insanfiziktedavi.com
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" data-testid="social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm text-secondary-foreground/70">
          <p>&copy; {new Date().getFullYear()} İnsan Fizik Tedavi ve Rehabilitasyon Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
