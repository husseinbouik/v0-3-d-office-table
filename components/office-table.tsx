"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"

// Table dimensions
const TABLE_WIDTH = 4
const TABLE_DEPTH = 2
const TABLE_HEIGHT = 0.12
const TABLE_Y = 1.5 // height off the ground
const LEG_THICKNESS = 0.1
const LEG_HEIGHT = TABLE_Y
const HOLE_RADIUS = 0.18
const HOLE_SEGMENTS = 32

// Apron (frame under the tabletop)
const APRON_HEIGHT = 0.2
const APRON_THICKNESS = 0.08

function TableTop() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const hw = TABLE_WIDTH / 2
    const hd = TABLE_DEPTH / 2
    const r = 0.06 // corner radius

    s.moveTo(-hw + r, -hd)
    s.lineTo(hw - r, -hd)
    s.quadraticCurveTo(hw, -hd, hw, -hd + r)
    s.lineTo(hw, hd - r)
    s.quadraticCurveTo(hw, hd, hw - r, hd)
    s.lineTo(-hw + r, hd)
    s.quadraticCurveTo(-hw, hd, -hw, hd - r)
    s.lineTo(-hw, -hd + r)
    s.quadraticCurveTo(-hw, -hd, -hw + r, -hd)

    // Cable management hole (back-right area of the desk)
    const holePath = new THREE.Path()
    holePath.absarc(1.2, 0.6, HOLE_RADIUS, 0, Math.PI * 2, false)
    s.holes.push(holePath)

    return s
  }, [])

  const extrudeSettings = useMemo(
    () => ({
      depth: TABLE_HEIGHT,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
    }),
    []
  )

  return (
    <mesh position={[0, TABLE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="#5c3a1e" roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

function HoleRim() {
  return (
    <mesh position={[1.2, TABLE_Y + 0.005, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[HOLE_RADIUS - 0.01, HOLE_RADIUS + 0.025, HOLE_SEGMENTS]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
    </mesh>
  )
}

function Leg({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[LEG_THICKNESS, LEG_HEIGHT, LEG_THICKNESS]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.8} />
    </mesh>
  )
}

function LegBrace({
  start,
  end,
}: {
  start: [number, number, number]
  end: [number, number, number]
}) {
  const midX = (start[0] + end[0]) / 2
  const midY = (start[1] + end[1]) / 2
  const midZ = (start[2] + end[2]) / 2
  const lenX = Math.abs(end[0] - start[0])
  const lenZ = Math.abs(end[2] - start[2])
  const width = Math.max(lenX, lenZ)

  return (
    <mesh position={[midX, midY, midZ]} castShadow>
      <boxGeometry args={[lenX > lenZ ? width : 0.06, 0.06, lenZ > lenX ? width : 0.06]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.8} />
    </mesh>
  )
}

function Apron({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#4a2e14" roughness={0.4} metalness={0.05} />
    </mesh>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#e8e0d4" roughness={0.8} metalness={0.0} />
    </mesh>
  )
}

export function OfficeTable() {
  const groupRef = useRef<THREE.Group>(null)

  // Leg positions
  const inset = 0.2
  const hw = TABLE_WIDTH / 2 - inset
  const hd = TABLE_DEPTH / 2 - inset
  const legY = LEG_HEIGHT / 2

  // Apron Y position (just under the tabletop)
  const apronY = TABLE_Y - APRON_HEIGHT / 2

  return (
    <group ref={groupRef}>
      {/* Tabletop with hole */}
      <TableTop />
      <HoleRim />

      {/* Legs */}
      <Leg position={[-hw, legY, -hd]} />
      <Leg position={[hw, legY, -hd]} />
      <Leg position={[-hw, legY, hd]} />
      <Leg position={[hw, legY, hd]} />

      {/* Horizontal braces between legs */}
      <LegBrace start={[-hw, 0.3, -hd]} end={[hw, 0.3, -hd]} />
      <LegBrace start={[-hw, 0.3, hd]} end={[hw, 0.3, hd]} />
      <LegBrace start={[-hw, 0.3, -hd]} end={[-hw, 0.3, hd]} />
      <LegBrace start={[hw, 0.3, -hd]} end={[hw, 0.3, hd]} />

      {/* Aprons (wooden frame under tabletop) */}
      <Apron
        position={[0, apronY, -hd]}
        size={[TABLE_WIDTH - inset * 2, APRON_HEIGHT, APRON_THICKNESS]}
      />
      <Apron
        position={[0, apronY, hd]}
        size={[TABLE_WIDTH - inset * 2, APRON_HEIGHT, APRON_THICKNESS]}
      />
      <Apron
        position={[-hw, apronY, 0]}
        size={[APRON_THICKNESS, APRON_HEIGHT, TABLE_DEPTH - inset * 2]}
      />
      <Apron
        position={[hw, apronY, 0]}
        size={[APRON_THICKNESS, APRON_HEIGHT, TABLE_DEPTH - inset * 2]}
      />

      {/* Floor */}
      <Floor />
    </group>
  )
}
