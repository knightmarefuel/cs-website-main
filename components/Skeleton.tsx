"use client";

export function SkeletonText({ width = "100%" }: { width?: string }) {
  return <div className="skeleton skeleton-text" style={{ width }} />;
}

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

export function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <SkeletonText width="30%" />
          <SkeletonText width="80%" />
        </div>
      ))}
    </>
  );
}

export function SkeletonSessionCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-2" style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonText width="40%" />
            <SkeletonText width="70%" />
            <SkeletonText width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}
