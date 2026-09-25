import { OpenKeyForm } from "@/components/home/OpenKeyForm";
import { CreateKeyForm } from "@/components/home/CreateKeyForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-soft p-4">
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-ink tracking-tight">
            Paper Trace
          </h1>
          <p className="text-sm text-ink-muted">
            A lightweight, key-based note-taking app.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-hairline bg-surface p-5 shadow-elevation-1">
            <OpenKeyForm />
          </div>
          <div className="rounded-xl border border-hairline bg-surface p-5 shadow-elevation-1">
            <CreateKeyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
