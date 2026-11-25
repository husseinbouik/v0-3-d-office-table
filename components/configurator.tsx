"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import {
  DEFAULT_CONFIG,
  FINISHES,
  FINISH_ORDER,
  LEG_STYLES,
  LEG_ORDER,
  LIMITS,
  computeParts,
  computePrice,
  formatMAD,
  type DrawerSide,
  type FinishId,
  type LegStyle,
  type TableConfig,
} from "@/lib/config"

type SceneProps = { config: TableConfig }

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="cfg-slider-row">
      <div className="cfg-slider-head">
        <label htmlFor={id}>{label}</label>
        <span className="cfg-slider-value" data-testid={`value-${id}`}>
          {value} cm
        </span>
      </div>
      <input
        id={id}
        data-testid={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function Configurator() {
  const [config, setConfig] = useState<TableConfig>(DEFAULT_CONFIG)
  const [SceneComp, setSceneComp] = useState<ComponentType<SceneProps> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    import("@/components/scene")
      .then((mod) => {
        if (!cancelled) setSceneComp(() => mod.Scene)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load 3D scene")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const parts = useMemo(() => computeParts(config), [config])
  const price = useMemo(() => computePrice(config), [config])

  const set = <K extends keyof TableConfig>(key: K, value: TableConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }))

  return (
    <div className="cfg-root">
      {/* 3D canvas (or loading / error state) */}
      {error ? (
        <div className="cfg-center">
          <p>Error loading 3D scene: {error}</p>
        </div>
      ) : SceneComp ? (
        <SceneComp config={config} />
      ) : (
        <div className="cfg-center">
          <div className="cfg-spinner" />
          <p>Loading 3D scene…</p>
        </div>
      )}

      {/* title chip */}
      <header className="cfg-title">
        <h1>Office Table Studio</h1>
        <p>Real-time 3D configurator</p>
      </header>

      {/* hint */}
      <div className="cfg-hint">Drag to orbit · Scroll or pinch to zoom</div>

      {/* control panel */}
      <aside className="cfg-panel" data-testid="panel">
        <section className="cfg-section">
          <h2>Dimensions</h2>
          <Slider
            id="dim-width"
            label="Width"
            value={config.width}
            {...LIMITS.width}
            onChange={(v) => set("width", v)}
          />
          <Slider
            id="dim-depth"
            label="Depth"
            value={config.depth}
            {...LIMITS.depth}
            onChange={(v) => set("depth", v)}
          />
          <Slider
            id="dim-height"
            label="Height"
            value={config.height}
            {...LIMITS.height}
            onChange={(v) => set("height", v)}
          />
          <p className="cfg-readout" data-testid="dim-readout">
            {config.width} × {config.depth} × {config.height} cm
          </p>
        </section>

        <section className="cfg-section">
          <h2>Legs</h2>
          <div className="cfg-segments" role="group" aria-label="Leg style">
            {LEG_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                data-testid={`legs-${id}`}
                className={config.legStyle === id ? "cfg-seg active" : "cfg-seg"}
                onClick={() => set("legStyle", id as LegStyle)}
              >
                {LEG_STYLES[id].name}
              </button>
            ))}
          </div>
        </section>

        <section className="cfg-section">
          <h2>Top finish</h2>
          <div className="cfg-swatches">
            {FINISH_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                data-testid={`finish-${id}`}
                className={config.finish === id ? "cfg-swatch active" : "cfg-swatch"}
                onClick={() => set("finish", id as FinishId)}
                aria-label={FINISHES[id].name}
                title={FINISHES[id].name}
              >
                <span className="cfg-swatch-dot" style={{ background: FINISHES[id].color }} />
                <span className="cfg-swatch-name">{FINISHES[id].name.replace("Natural ", "").replace("Nordic ", "")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cfg-section">
          <h2>Add-ons</h2>
          <div className="cfg-addon-row">
            <span>Drawer unit</span>
            <div className="cfg-segments small" role="group" aria-label="Drawer unit">
              {(["none", "left", "right"] as DrawerSide[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  data-testid={`drawer-${side}`}
                  className={config.drawer === side ? "cfg-seg active" : "cfg-seg"}
                  onClick={() => set("drawer", side)}
                >
                  {side === "none" ? "None" : side === "left" ? "Left" : "Right"}
                </button>
              ))}
            </div>
          </div>
          <div className="cfg-addon-row">
            <span>Cable tray</span>
            <button
              type="button"
              role="switch"
              aria-checked={config.cableTray}
              data-testid="tray-toggle"
              className={config.cableTray ? "cfg-switch on" : "cfg-switch"}
              onClick={() => set("cableTray", !config.cableTray)}
            >
              <span className="cfg-switch-knob" />
            </button>
          </div>
        </section>

        <section className="cfg-section cfg-summary">
          <div className="cfg-price-row">
            <span className="cfg-price-label">Total</span>
            <span className="cfg-price" data-testid="price-value">
              {formatMAD(price)} MAD
            </span>
          </div>
          <ul className="cfg-parts" data-testid="parts-list">
            {parts.map((p) => (
              <li key={p.name}>
                <div>
                  <span className="cfg-part-name">{p.name}</span>
                  <span className="cfg-part-detail">{p.detail}</span>
                </div>
                <span className="cfg-part-price">{p.price === 0 ? "Included" : `${formatMAD(p.price)} MAD`}</span>
              </li>
            ))}
          </ul>
          <p className="cfg-demo-note">Demo pricing — calculated live from your configuration.</p>
        </section>
      </aside>
    </div>
  )
}
