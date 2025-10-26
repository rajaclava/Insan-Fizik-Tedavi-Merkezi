import { Link } from "wouter";
import { Phone, MessageCircle, Activity, Heart, Award, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@assets/generated_images/Hero_physiotherapy_session_image_66c498cf.png";
import manualTherapyImage from "@assets/generated_images/Manual_therapy_service_image_90be64cf.png";
import orthoRehabImage from "@assets/generated_images/Orthopedic_rehabilitation_service_image_60ec52b1.png";
import scoliosisImage from "@assets/generated_images/Scoliosis_treatment_service_image_50477469.png";

export default function Home() {
  const services = [
    {
      id: "fizik-tedavi",
      title: "Fizik Tedavi",
      description: "Profesyonel fizik tedavi hizmetlerimizle ağrılarınızdan kurtulun ve yaşam kalitenizi artırın.",
      image: manualTherapyImage,
      icon: Activity,
    },
    {
      id: "manuel-terapi",
      title: "Manuel Terapi",
      description: "El teknikleriyle kas ve eklem problemlerinize çözüm bulun, hareketliliğinizi artırın.",
      image: manualTherapyImage,
      icon: Heart,
    },
    {
      id: "ortopedik-rehabilitasyon",
      title: "Ortopedik Rehabilitasyon",
      description: "Ameliyat sonrası veya travma sonrası iyileşme sürecinizde uzman desteği alın.",
      image: orthoRehabImage,
      icon: Award,
    },
  ];

  const testimonials = [
    {
      id: "1",
      name: "Ayşe Yılmaz",
      treatment: "Bel Fıtığı Tedavisi",
      text: "Yıllardır çektiğim bel ağrılarım burada aldığım tedavilerle kayboldu. Profesyonel ve ilgili bir ekip. Herkese tavsiye ederim.",
    },
    {
      id: "2",
      name: "Mehmet Demir",
      treatment: "Manuel Terapi",
      text: "Boyun ağrılarım için başvurmuştum. Manuel terapi seanslarından sonra kendimi çok daha iyi hissediyorum. Teşekkürler.",
    },
    {
      id: "3",
      name: "Zeynep Kaya",
      treatment: "Skolyoz Tedavisi",
      text: "Kızımın skolyoz tedavisi için geldik. Egzersiz programları ve yakın takip sayesinde harika sonuçlar aldık.",
    },
  ];

  const whatsappNumber = "905326127244";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div>
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/40" />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl lg:text-6xl font-semibold mb-6 leading-tight" data-testid="text-hero-title">
              Uzman Kadromuzla Ağrısız Bir Yaşama Adım Atın
            </h1>
            <p className="text-lg lg:text-xl mb-8 text-white/90" data-testid="text-hero-subtitle">
              Fizik tedavi, manuel terapi, bel-boyun fıtığı, skolyoz ve ortopedik rehabilitasyon alanlarında
              profesyonel destek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="default"
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/90 text-white"
                data-testid="button-hero-call"
              >
                <a href="tel:+905326127244">
                  <Phone className="h-5 w-5 mr-2" />
                  Hemen Ara
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30"
                data-testid="button-hero-whatsapp"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp'tan Yaz
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground" data-testid="text-about-title">
                Hakkımızda
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                İnsan Fizik Tedavi ve Rehabilitasyon Merkezi olarak, hastaların yaşam kalitesini artırmak ve
                ağrısız bir yaşam sürmelerini sağlamak için çalışıyoruz.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Uzman fizyoterapistlerimiz ve modern ekipmanlarımızla fizik tedavi, manuel terapi, ortopedik
                rehabilitasyon ve daha birçok alanda hizmet sunuyoruz. Her hastamıza özel tedavi programları
                hazırlayarak en iyi sonuçları elde etmeyi hedefliyoruz.
              </p>
              <Button variant="default" size="default" asChild data-testid="button-about-more">
                <Link href="/hakkimizda">
                  Daha Fazla Bilgi
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">1000+</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Mutlu Hasta</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader>
                  <Award className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">15+</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Yıllık Deneyim</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader>
                  <Heart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">%95</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Başarı Oranı</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">6+</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Tedavi Alanı</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4 text-foreground" data-testid="text-services-title">
              Hizmetlerimiz
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Modern ekipmanlarımız ve uzman kadromuzla geniş bir yelpazede fizik tedavi hizmeti sunuyoruz.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover-elevate transition-all" data-testid={`card-service-${service.id}`}>
                <div className="relative h-48">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground p-3 rounded-lg">
                    <service.icon className="h-6 w-6" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Button variant="outline" size="sm" asChild data-testid={`button-service-${service.id}`}>
                    <Link href={`/hizmetler#${service.id}`}>
                      Detaylı Bilgi
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="default" size="lg" asChild data-testid="button-all-services">
              <Link href="/hizmetler">Tüm Hizmetlerimiz</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4 text-foreground" data-testid="text-testimonials-title">
              Hastalarımız Ne Diyor?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tedavi sürecinden geçen hastalarımızın deneyimlerini okuyun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover-elevate" data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 fill-primary"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">"{testimonial.text}"</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.treatment}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold mb-6 text-foreground" data-testid="text-contact-title">
                Bize Ulaşın
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Telefon</p>
                    <a href="tel:+905326127244" className="text-muted-foreground hover:text-primary transition-colors" data-testid="text-contact-phone">
                      +90 532 612 72 44
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Adres</p>
                    <p className="text-muted-foreground" data-testid="text-contact-address">
                      19 Mayıs, Dicle Sk. No:40, 34522 Büyükçekmece/İstanbul
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button variant="default" size="lg" asChild data-testid="button-contact-page">
                  <Link href="/iletisim">İletişim Sayfası</Link>
                </Button>
              </div>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.701604!2d28.585!3d41.024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAxJzI2LjQiTiAyOMKwMzUnMDYuMCJF!5e0!3m2!1str!2str!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="İnsan Fizik Tedavi Konum"
                data-testid="map-location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
