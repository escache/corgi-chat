import type { Metadata } from "next";

interface RoomLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoomLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const title = `Room /${slug} · Corgi Chat`;
  const description = "Join this corgi-chat room for text chat, video, and collaborative activities.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function RoomLayout({ children }: RoomLayoutProps) {
  return children;
}
