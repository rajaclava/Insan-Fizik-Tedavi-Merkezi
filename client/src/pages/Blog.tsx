import { Clock, Tag, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import manualTherapyImage from "@assets/generated_images/Manual_therapy_service_image_90be64cf.png";
import orthoRehabImage from "@assets/generated_images/Orthopedic_rehabilitation_service_image_60ec52b1.png";
import scoliosisImage from "@assets/generated_images/Scoliosis_treatment_service_image_50477469.png";

export default function Blog() {
  const posts = [
    {
      id: "1",
      title: "Fizik Tedavi Nedir ve Kimlere Uygulanır?",
      excerpt: "Fizik tedavi, kas-iskelet sistemi rahatsızlıkları, hareket kısıtlılıkları ve ağrı yönetiminde kullanılan etkili bir tedavi yöntemidir. Bu yazıda fizik tedavinin temel prensiplerini ve uygulama alanlarını inceliyoruz.",
      category: "Genel Bilgi",
      image: manualTherapyImage,
      readTime: "5 dakika",
      publishedAt: "15 Ekim 2024",
    },
    {
      id: "2",
      title: "Bel Fıtığına Ne İyi Gelir? Evde Yapabileceğiniz Egzersizler",
      excerpt: "Bel fıtığı ağrılarınızı azaltmak için evde uygulayabileceğiniz basit ama etkili egzersizler. Uzman fizyoterapistlerimizin önerileriyle ağrısız bir yaşam için adım adım rehber.",
      category: "Egzersiz",
      image: orthoRehabImage,
      readTime: "8 dakika",
      publishedAt: "10 Ekim 2024",
    },
    {
      id: "3",
      title: "Skolyoz Tedavisinde Erken Müdahalenin Önemi",
      excerpt: "Çocukluk ve ergenlik döneminde görülen skolyoz vakalarında erken teşhis ve doğru tedavi yaklaşımının kritik önemi. Schroth metodu ve egzersiz programları hakkında bilgiler.",
      category: "Tedavi Yöntemleri",
      image: scoliosisImage,
      readTime: "6 dakika",
      publishedAt: "5 Ekim 2024",
    },
    {
      id: "4",
      title: "Manuel Terapi ile Boyun Ağrılarından Kurtulun",
      excerpt: "Uzun saatler bilgisayar başında çalışmanın neden olduğu boyun ağrıları için manuel terapi nasıl bir çözüm sunuyor? Tedavi süreci ve beklenen sonuçlar hakkında bilmeniz gerekenler.",
      category: "Tedavi Yöntemleri",
      image: manualTherapyImage,
      readTime: "7 dakika",
      publishedAt: "1 Ekim 2024",
    },
    {
      id: "5",
      title: "Ameliyat Sonrası Rehabilitasyon Süreci Nasıl İlerler?",
      excerpt: "Ortopedik ameliyatlar sonrası iyileşme sürecinde fizik tedavinin rolü ve rehabilitasyon programlarının önemi. Diz, omuz ve kalça protezi sonrası tedavi süreçleri.",
      category: "Rehabilitasyon",
      image: orthoRehabImage,
      readTime: "10 dakika",
      publishedAt: "25 Eylül 2024",
    },
    {
      id: "6",
      title: "Ofiste Çalışanlar için Postür Düzeltme Egzersizleri",
      excerpt: "Masa başında çalışırken dikkat edilmesi gereken postür kuralları ve gün boyunca yapabileceğiniz kısa egzersiz molaları. Sağlıklı çalışma ortamı için ipuçları.",
      category: "Egzersiz",
      image: manualTherapyImage,
      readTime: "5 dakika",
      publishedAt: "20 Eylül 2024",
    },
  ];

  const categories = ["Tümü", "Genel Bilgi", "Egzersiz", "Tedavi Yöntemleri", "Rehabilitasyon"];

  return (
    <div>
      <SEO
        title="Blog"
        description="Fizik tedavi, rehabilitasyon ve sağlıklı yaşam hakkında güncel bilgiler, uzman tavsiyeleri ve egzersiz önerileri."
        path="/blog"
      />
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground" data-testid="text-blog-title">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Fizik tedavi, rehabilitasyon ve sağlıklı yaşam hakkında güncel bilgiler, uzman tavsiyeleri ve
              egzersiz önerileri.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "Tümü" ? "default" : "outline"}
                className="cursor-pointer hover-elevate px-4 py-2"
                data-testid={`badge-category-${category.toLowerCase()}`}
              >
                <Tag className="h-3 w-3 mr-2" />
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover-elevate overflow-hidden flex flex-col" data-testid={`card-blog-${post.id}`}>
                <div className="relative h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4">
                    {post.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <span>{post.publishedAt}</span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4" data-testid={`button-read-${post.id}`}>
                    Devamını Oku
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center bg-accent rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Sağlığınız İçin Profesyonel Destek</h2>
            <p className="text-muted-foreground mb-6">
              Blog yazılarımız bilgilendirme amaçlıdır. Kesin teşhis ve tedavi için mutlaka bir sağlık
              profesyoneline danışmalısınız.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild data-testid="button-blog-appointment">
                <Link href="/randevu">Randevu Al</Link>
              </Button>
              <Button variant="outline" size="lg" asChild data-testid="button-blog-contact">
                <Link href="/iletisim">Bize Ulaşın</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
