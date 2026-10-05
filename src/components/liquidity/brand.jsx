import Link from "next/link";

export function Brand({ compact = false }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Liquidity Bias home"
    >
      <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
        L
      </span>
      {!compact && (
        <span className="text-sm font-semibold text-foreground">
          Liquidity <span className="text-brand">Bias</span>
        </span>
      )}
    </Link>
  );
}
