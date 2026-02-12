"use client"

import dynamic from "next/dynamic"

const Scene = dynamic(() => import("@/components/scene").then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f0eb]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5c3a1e] border-t-transparent" />
        <p className="text-sm text-[#5c3a1e] font-sans">Loading 3D Scene...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main>
      <Scene />
    </main>
  )
}
