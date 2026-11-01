"use client";

import { Button } from "@heroui/react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Fitness Studio</h1>
      <p>Project setup is ready for review.</p>
      <Button isDisabled variant="secondary">
        HeroUI is connected
      </Button>
    </main>
  );
}
