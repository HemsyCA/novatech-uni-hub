import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { OG_IMAGE, SITE_NAME, SITE_URL, getPageSeo } from "@/lib/seo";

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

export function RouteSeo() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();

  useEffect(() => {
    const { seo, indexable, canonicalPath } = getPageSeo(pathname);
    const title = seo.title[lang];
    const description = seo.description[lang];
    const url = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", indexable ? "index, follow" : "noindex, nofollow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", lang === "en" ? "en_US" : "es_PE");
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", OG_IMAGE);
    setCanonical(url);
  }, [pathname, lang]);

  return null;
}
