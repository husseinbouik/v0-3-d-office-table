"use client"

import { useState, useEffect, type ComponentType } from "react"

export function SceneLoader() {
  const [SceneComp, setSceneComp] = useState<ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    console.log("[v0] SceneLoader: starting dynamic import")
    import("@/components/scene")
      .then((mod) => {
        console.log("[v0] SceneLoader: module loaded", mod)
        if (!cancelled) {
          setSceneComp(() => mod.Scene)
        }
      })
      .catch((err) => {
        console.error("[v0] SceneLoader: import failed", err)
        if (!cancelled) {
          setError(err?.message || "Failed to load 3D scene")
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0eb" }}>
        <p style={{ color: "#5c3a1e", fontFamily: "sans-serif" }}>
          {"Error loading 3D scene: " + error}
        </p>
      </div>
    )
  }

  if (!SceneComp) {
    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0eb" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "4px solid #5c3a1e",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#5c3a1e", fontSize: "14px", fontFamily: "sans-serif" }}>
            {"Loading 3D Scene..."}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return <SceneComp />
}
