import React from 'react';
import { Helmet } from 'react-helmet';

export function SEO({
  title,
  description,
  image,
  url,
}) {
  const siteUrl = 'http://localhost:3000';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/logo512.png`;

  return (
    <Helmet>
      <title>{title} | EventDeco</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
