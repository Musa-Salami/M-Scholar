import Image from "next/image";
import { SCHOOL } from "@m-scholar/shared";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 44,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={SCHOOL.logo}
      alt={`${SCHOOL.name} crest`}
      width={size}
      height={size}
      className={cn("rounded-full bg-white object-contain", className)}
      priority
    />
  );
}
