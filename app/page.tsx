"use client"

import { useState, useEffect, type ComponentType } from "react"

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f0eb]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5c3a1e] border-t-transparent" />
        <p className="text-sm text-[#5c3a1e] font-sans">
          {"Loading 3D Scene..."}
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const [SceneComponent, setSceneComponent] = useState<ComponentType | null>(
    null
  )

  useEffect(() => {
    import("@/components/scene").then((mod) => {
      setSceneComponent(() => mod.Scene)
    })
  }, [])

  if (!SceneComponent) {
    return <LoadingFallback />
  }

  return (
    <main>
      <SceneComponent />
    </main>
  )
}
