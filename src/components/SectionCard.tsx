import type { ReactNode } from "react";

type SectionCardProps = {
  titleId: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function SectionCard({
  titleId,
  title,
  description,
  actions,
  children,
}: SectionCardProps) {
  return (
    <section
      className="overflow-hidden rounded-[9px] border border-line bg-white"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-[18px] py-3.5 max-[520px]:gap-[7px] max-[520px]:px-4 max-[520px]:py-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h2 id={titleId} className="m-0 text-sm font-semibold">
            {title}
          </h2>
          <span className="text-xs text-subtle">{description}</span>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
