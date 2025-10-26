import { Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { useState } from "react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const { data: posts, isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const safePosts = posts || [];
  const categories = ["Tümü", ...Array.from(new Set(safePosts.map((p) => p.category)))];

  const filteredPosts =
    selectedCategory === "Tümü"
      ? safePosts
      : safePosts.filter((post) => post.category === selectedCategory);

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
            <h1
              className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground"
              data-testid="text-blog-title"
            >
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Fizik tedavi, rehabilitasyon ve sağlıklı yaşam hakkında güncel bilgiler, uzman
              tavsiyeleri ve egzersiz önerileri.
            </p>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  className="cursor-pointer hover-elevate px-4 py-2"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`badge-category-${category.toLowerCase()}`}
                >
                  <Tag className="h-3 w-3 mr-2" />
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="text-center">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : isError ? (
            <div className="text-center">
              <p className="text-muted-foreground">Blog yazıları yüklenirken hata oluştu.</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover-elevate overflow-hidden flex flex-col"
                  data-testid={`card-blog-${post.id}`}
                >
                  {post.imageUrl && (
                    <div className="relative h-48">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4">{post.category}</Badge>
                    </div>
                  )}
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
                      <span>
                        {post.published && new Date(post.published).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">Henüz blog yazısı bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
