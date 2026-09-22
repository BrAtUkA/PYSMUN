import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pysmun.com";
  const routes = ["", "/about", "/executive-council", "/pys-bootcamp", "/committees", "/applications", "/applications/pys-bootcamp", "/applications/directorate", "/applications/delegate", "/applications/observer","/applications/campus-ambassador", "/faq", "/contact", "/privacy", "/terms"];
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : route.includes("pys-bootcamp") ? .9 : .7 }));
}
