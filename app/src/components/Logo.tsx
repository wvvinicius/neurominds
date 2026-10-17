import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-mark.svg"
        alt=""
        width={72}
        height={43}
        priority
        unoptimized
        className="h-10 w-auto sm:h-12"
      />
      <span className="font-display text-3xl leading-none tracking-[0.1em] text-ink/85 sm:text-4xl">
        NEUROMINDS
      </span>
    </div>
  );
}
