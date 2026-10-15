"use client";

type Props = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export function AnchorLink({ id, children, className }: Props) {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
