import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import type { BlogPost, InsertBlogPost } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Link, useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const blogFormSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  excerpt: z.string().min(1, "Özet gerekli"),
  content: z.string().min(1, "İçerik gerekli"),
  category: z.string().min(1, "Kategori gerekli"),
  imageUrl: z.string().optional(),
  readTime: z.string().default("5 dakika"),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

export default function AdminBlogManager() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız",
      });
    },
  });

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      imageUrl: "",
      readTime: "5 dakika",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => apiRequest("POST", "/api/blog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Blog yazısı oluşturuldu",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Blog yazısı oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertBlogPost> }) =>
      apiRequest("PATCH", `/api/blog/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Blog yazısı güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Blog yazısı güncellenemedi",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setDeletePostId(null);
      toast({
        title: "Silindi",
        description: "Blog yazısı silindi",
      });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl || "",
      readTime: post.readTime,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: BlogFormData) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data as InsertBlogPost);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    form.reset();
  };

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <SEO title="Blog Yönetimi - Admin" description="Blog yazılarını yönet" path="/admin/blog" />

      <header className="bg-card border-b">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Blog Yönetimi</h1>
              <p className="text-sm text-muted-foreground">Hoş geldiniz, {(user as any).username}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Blog Yazıları</h2>
          <Button
            onClick={() => {
              setEditingPost(null);
              form.reset();
              setIsDialogOpen(true);
            }}
            data-testid="button-create-blog"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Yazı
          </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Yazıları ({posts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Yükleniyor...</p>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`blog-post-${post.id}`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-4">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="font-medium">{post.category}</span>
                          <span>{post.readTime}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.published && new Date(post.published).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletePostId(post.id)}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Henüz blog yazısı yok</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Yazı başlığı" data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Özet</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Kısa özet" rows={3} data-testid="input-excerpt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İçerik</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Yazı içeriği" rows={6} data-testid="input-content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Örn: Genel Bilgi, Egzersiz" data-testid="input-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resim URL (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="readTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Okuma Süresi</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="5 dakika" data-testid="input-read-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-blog"
                >
                  {editingPost ? "Güncelle" : "Oluştur"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blog Yazısını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && deleteMutation.mutate(deletePostId)}
              data-testid="button-confirm-delete-blog"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </main>
    </div>
  );
}
