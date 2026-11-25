"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { FINISHES, type TableConfig } from "@/lib/config"

/* All dimensions in metres. Config arrives in cm and is converted here. */

const TOP_T = 0.045 // top slab thickness
const METAL = "#1a1a1a"
const HOLE_R = 0.08 // cable grommet radius (Ø 160 mm, as the original model)

const cm = (v: number) => v / 100

function useTopGeometry(w: number, d: number, hx: number, hz: number) {
  return useMemo(() => {
    const s = new THREE.Shape()
    const hw = w / 2
    const hd = d / 2
    const r = 0.03

    s.moveTo(-hw + r, -hd)
    s.lineTo(hw - r, -hd)
    s.quadraticCurveTo(hw, -hd, hw, -hd + r)
    s.lineTo(hw, hd - r)
    s.quadraticCurveTo(hw, hd, hw - r, hd)
    s.lineTo(-hw + r, hd)
    s.quadraticCurveTo(-hw, hd, -hw, hd - r)
    s.lineTo(-hw, -hd + r)
    s.quadraticCurveTo(-hw, -hd, -hw + r, -hd)

    // Shape Y maps to world -Z after the -90° X rotation, so flip the hole's Z.
    const holePath = new THREE.Path()
    holePath.absarc(hx, -hz, HOLE_R, 0, Math.PI * 2, false)
    s.holes.push(holePath)

    return new THREE.ExtrudeGeometry(s, {
      depth: TOP_T,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 3,
    })
  }, [w, d, hx, hz])
}

function MetalBox({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.8} envMapIntensity={0.7} />
    </mesh>
  )
}

function WoodBox({
  position,
  size,
  color,
  roughness,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  roughness: number
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.05} envMapIntensity={0.5} />
    </mesh>
  )
}

/* ------------------------------- leg sets ------------------------------ */

function PostLegs({ w, d, legH }: { w: number; d: number; legH: number }) {
  const px = w / 2 - 0.1
  const pz = d / 2 - 0.1
  const post: [number, number, number] = [0.05, legH, 0.05]
  return (
    <group>
      <MetalBox position={[-px, legH / 2, -pz]} size={post} />
      <MetalBox position={[px, legH / 2, -pz]} size={post} />
      <MetalBox position={[-px, legH / 2, pz]} size={post} />
      <MetalBox position={[px, legH / 2, pz]} size={post} />
      {/* low braces, as the original model */}
      <MetalBox position={[0, 0.135, -pz]} size={[px * 2, 0.06, 0.06]} />
      <MetalBox position={[0, 0.135, pz]} size={[px * 2, 0.06, 0.06]} />
      <MetalBox position={[-px, 0.135, 0]} size={[0.06, 0.06, pz * 2]} />
      <MetalBox position={[px, 0.135, 0]} size={[0.06, 0.06, pz * 2]} />
    </group>
  )
}

function PanelLegs({
  w,
  d,
  legH,
  topUnderside,
  color,
  roughness,
}: {
  w: number
  d: number
  legH: number
  topUnderside: number
  color: string
  roughness: number
}) {
  const px = w / 2 - 0.12
  const panelDepth = d - 0.24
  return (
    <group>
      <WoodBox position={[-px, legH / 2, 0]} size={[0.035, legH, panelDepth]} color={color} roughness={roughness} />
      <WoodBox position={[px, legH / 2, 0]} size={[0.035, legH, panelDepth]} color={color} roughness={roughness} />
      {/* modesty / cross panel at the back */}
      <WoodBox
        position={[0, topUnderside - 0.19, -(d / 2 - 0.14)]}
        size={[px * 2, 0.34, 0.025]}
        color={color}
        roughness={roughness}
      />
    </group>
  )
}

function UFrameLegs({ w, d, legH, topUnderside }: { w: number; d: number; legH: number; topUnderside: number }) {
  const px = w / 2 - 0.1
  const pz = d / 2 - 0.1
  const span = pz * 2 + 0.06
  return (
    <group>
      {[-px, px].map((x) => (
        <group key={x}>
          <MetalBox position={[x, legH / 2, -pz]} size={[0.05, legH, 0.05]} />
          <MetalBox position={[x, legH / 2, pz]} size={[0.05, legH, 0.05]} />
          {/* floor foot + top rail turn the posts into a sled frame */}
          <MetalBox position={[x, 0.025, 0]} size={[0.07, 0.05, span]} />
          <MetalBox position={[x, topUnderside - 0.025, 0]} size={[0.07, 0.05, span]} />
        </group>
      ))}
      {/* back stretcher between the two frames */}
      <MetalBox position={[0, 0.25, -pz]} size={[px * 2, 0.05, 0.04]} />
    </group>
  )
}

/* ------------------------------- add-ons ------------------------------- */

function DrawerUnit({
  cfg,
  w,
  d,
  topUnderside,
}: {
  cfg: TableConfig
  w: number
  d: number
  topUnderside: number
}) {
  const finish = FINISHES[cfg.finish]
  const unitW = 0.46
  const unitH = 0.34
  const unitD = Math.min(d - 0.18, 0.68)
  const dir = cfg.drawer === "left" ? -1 : 1
  const x = dir * (w / 2 - 0.1 - unitW / 2)
  const y = topUnderside - unitH / 2
  const z = d / 2 - 0.05 - unitD / 2 // front-aligned
  const frontZ = z + unitD / 2

  return (
    <group>
      <WoodBox position={[x, y, z]} size={[unitW, unitH, unitD]} color={finish.dark} roughness={finish.roughness} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <WoodBox
            position={[x, y + s * (unitH / 4), frontZ + 0.009]}
            size={[unitW - 0.03, unitH / 2 - 0.025, 0.018]}
            color={finish.color}
            roughness={finish.roughness}
          />
          <MetalBox position={[x, y + s * (unitH / 4) + unitH / 4 - 0.045, frontZ + 0.024]} size={[0.15, 0.012, 0.012]} />
        </group>
      ))}
    </group>
  )
}

function CableTray({ w, d, topUnderside }: { w: number; d: number; topUnderside: number }) {
  return (
    <group>
      <MetalBox
        position={[0, topUnderside - 0.055, -(d / 2 - 0.17)]}
        size={[w * 0.55, 0.09, 0.13]}
      />
      {/* power strip resting in the tray */}
      <mesh position={[0, topUnderside - 0.028, -(d / 2 - 0.17)]} castShadow>
        <boxGeometry args={[0.32, 0.035, 0.07]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

/* --------------------------------- table -------------------------------- */

export function OfficeTable({ config }: { config: TableConfig }) {
  const finish = FINISHES[config.finish]
  const w = cm(config.width)
  const d = cm(config.depth)
  const h = cm(config.height)
  const legH = h - TOP_T
  const topY = legH // bottom face of the top slab
  const topUnderside = legH

  const hx = w / 2 - 0.28
  const hz = -(d / 2 - 0.2)
  const topGeometry = useTopGeometry(w, d, hx, hz)

  return (
    <group>
      {/* top */}
      <mesh position={[0, topY, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow geometry={topGeometry}>
        <meshStandardMaterial color={finish.color} roughness={finish.roughness} metalness={0.05} envMapIntensity={0.5} />
      </mesh>

      {/* grommet rim + inner wall */}
      <mesh position={[hx, topY + TOP_T + 0.004, hz]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[HOLE_R - 0.005, HOLE_R + 0.014, 40]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[hx, topY + TOP_T / 2, hz]}>
        <cylinderGeometry args={[HOLE_R, HOLE_R, TOP_T + 0.02, 40, 1, true]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} side={THREE.BackSide} />
      </mesh>

      {/* aprons (post + u-frame; panel legs carry their own structure) */}
      {config.legStyle !== "panel" && (
        <group>
          <WoodBox position={[0, topUnderside - 0.07, -(d / 2 - 0.1)]} size={[w - 0.2, 0.14, 0.03]} color={finish.dark} roughness={finish.roughness} />
          <WoodBox position={[0, topUnderside - 0.07, d / 2 - 0.1]} size={[w - 0.2, 0.14, 0.03]} color={finish.dark} roughness={finish.roughness} />
          <WoodBox position={[-(w / 2 - 0.1), topUnderside - 0.07, 0]} size={[0.03, 0.14, d - 0.2]} color={finish.dark} roughness={finish.roughness} />
          <WoodBox position={[w / 2 - 0.1, topUnderside - 0.07, 0]} size={[0.03, 0.14, d - 0.2]} color={finish.dark} roughness={finish.roughness} />
        </group>
      )}

      {config.legStyle === "post" && <PostLegs w={w} d={d} legH={legH} />}
      {config.legStyle === "panel" && (
        <PanelLegs w={w} d={d} legH={legH} topUnderside={topUnderside} color={finish.color} roughness={finish.roughness} />
      )}
      {config.legStyle === "uframe" && <UFrameLegs w={w} d={d} legH={legH} topUnderside={topUnderside} />}

      {config.drawer !== "none" && <DrawerUnit cfg={config} w={w} d={d} topUnderside={topUnderside} />}
      {config.cableTray && <CableTray w={w} d={d} topUnderside={topUnderside} />}
    </group>
  )
}
