import type { ReactNode } from "react";

type StudioPageProps = {
  title: string;
  context?: ReactNode;
  summary?: ReactNode;
  footnote: string;
  children: ReactNode;
};

export function StudioPage({
  title,
  context,
  summary,
  footnote,
  children,
}: StudioPageProps) {
  return (
    <main
      className="w-full px-6 pt-7 pb-8 max-[520px]:px-4 max-[520px]:pt-[22px] max-[520px]:pb-6"
      id="main-content"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="m-0 text-[28px] leading-tight font-bold tracking-[-0.8px] max-[520px]:text-[26px]">
          {title}
        </h1>
        {context && <div className="text-[13px] text-subtle">{context}</div>}
      </div>
      {summary && (
        <div className="mb-[26px] text-[13px] text-subtle max-[520px]:mb-5">
          {summary}
        </div>
      )}
      {children}
      <p className="mt-[13px] mb-0 text-xs text-subtle">{footnote}</p>
    </main>
  );
}
