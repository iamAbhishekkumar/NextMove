import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "echoscript",
    short_name: "echoscript",
    description: "Auto Captioner",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "icons/icon.svg",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
