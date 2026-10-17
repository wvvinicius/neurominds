import { notFound } from "next/navigation";
import { ActionPlayer } from "@/components/ActionPlayer";
import { BackButton } from "@/components/BackButton";
import { getActionBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const action = await getActionBySlug(slug);
  return { title: action ? `${action.name} · NeuroMinds` : "NeuroMinds" };
}

export default async function ActionPage({ params }: Props) {
  const { slug } = await params;
  const action = await getActionBySlug(slug);
  if (!action) notFound();

  return (
    <>
      <div className="nm-stripe" aria-hidden="true" />
      <BackButton />

      <header className="flex items-center justify-center px-24 py-5">
        <h1 className="flex items-center gap-3 font-display text-4xl tracking-wide motion-safe:animate-slide-up sm:text-5xl">
          <span
            className="inline-block motion-safe:animate-wiggle"
            style={{ animationDelay: "250ms" }}
            aria-hidden="true"
          >
            {action.emoji}
          </span>
          {action.name}
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-8 sm:px-6">
        {action.videos.length > 0 ? (
          <ActionPlayer videos={action.videos} />
        ) : (
          <div className="flex max-w-md flex-col items-center gap-4 pt-10 text-center motion-safe:animate-pop">
            <span className="text-7xl" aria-hidden="true">
              🎬
            </span>
            <p className="text-2xl font-extrabold">
              Os vídeos de {action.name.toLowerCase()} ainda estão chegando.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
