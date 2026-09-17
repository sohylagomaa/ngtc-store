import { LoaderCircle } from "lucide-react";

export default function Spinner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <LoaderCircle
      aria-hidden
      className={`h-4 w-4 animate-spin text-current ${className}`}
    />
  );
}