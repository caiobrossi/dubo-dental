import Image from "next/image";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";

export default function Home() {
  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <Image
          src="subframe-logo.svg"
          width={112}
          height={20}
          alt="Subframe logo"
        />

        <div className="flex flex-col gap-1 mt-20">
          <div className="relative mx-auto max-w-4xl gap-12 px-6 lg:px-8">
            <h1 className="text-4xl text-center font-semibold tracking-tight sm:text-6xl sm:leading-[4.25rem]">
              Welcome to Dubo Dental v3
            </h1>
          </div>
          <div className="relative mx-auto max-w-2xl gap-12 px-6 lg:px-8">
            <div className="mt-6 text-lg text-base sm:text-lg text-center max-w-">
              Complete dental practice management system built with Next.js, 
              React, and Supabase.
            </div>
          </div>
        </div>

        <div className="flex gap-2 max-w-md mt-12 gap-4">
          <a
            className="rounded-lg bg-slate-950 text-white px-4 py-2 text-center"
            href="/patients"
          >
            View Patients
          </a>

          <a
            className="rounded-lg text-slate-950 px-4 py-2 text-center border border-slate-300"
            href="/patient-dashboard"
          >
            Dashboard
          </a>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
