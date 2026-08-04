import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitQuest — suba de nível na vida real",
    short_name: "FitQuest",
    description:
      "O RPG onde sua evolução física real é o progresso. O seu maior adversário é você mesmo.",
    start_url: "/",
    display: "standalone",
    background_color: "#131009",
    theme_color: "#131009",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
