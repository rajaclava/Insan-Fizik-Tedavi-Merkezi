import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
}

export function SEO({ title, description, path = "" }: SEOProps) {
  const fullTitle = `${title} | İnsan Fizik Tedavi ve Rehabilitasyon Merkezi`;
  const siteUrl = "https://insanfiziktedavi.com";
  const fullUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
