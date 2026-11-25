"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei"
import { Suspense, useEffect, useMemo } from "react"
import * as THREE from "three"
import { OfficeTable } from "./office-table"
import type { TableConfig } from "@/lib/config"

const ACCENT = "#2e6bff"

/** Frame the table for the viewport shape: further back (and view shifted up)
 *  on portrait screens, where the control panel covers the lower half. */
function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const aspect = size.width / size.height
    const dist = aspect < 0.75 ? 5.8 : aspect < 1.1 ? 4.7 : 3.8
    const dir = new THREE.Vector3(2.3, 1.5, 2.5).normalize()
    camera.position.copy(dir.multiplyScalar(dist))
    if (aspect < 0.75) {
      camera.setViewOffset(size.width, size.height, 0, Math.round(size.height * 0.2), size.width, size.height)
    } else {
      camera.clearViewOffset()
    }
    camera.lookAt(0, 0.42, 0)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

/* ------------------------------ room pieces ----------------------------- */

function Room() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#ddd2bf" roughness={0.9} metalness={0} envMapIntensity={0.4} />
      </mesh>

      {/* rug under the desk */}
      <mesh position={[0, 0.004, 0.1]} receiveShadow>
        <boxGeometry args={[3.1, 0.012, 2.1]} />
        <meshStandardMaterial color="#b09672" roughness={1} metalness={0} envMapIntensity={0.3} />
      </mesh>

      {/* back + left walls */}
      <mesh position={[0, 3, -2.4]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#f0e9df" roughness={0.95} envMapIntensity={0.35} />
      </mesh>
      <mesh position={[-3.4, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#e9e1d2" roughness={0.95} envMapIntensity={0.35} />
      </mesh>

      {/* baseboards */}
      <mesh position={[0, 0.045, -2.385]}>
        <boxGeometry args={[30, 0.09, 0.02]} />
        <meshStandardMaterial color="#fbf8f2" roughness={0.8} />
      </mesh>
      <mesh position={[-3.385, 0.045, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 0.09, 0.02]} />
        <meshStandardMaterial color="#fbf8f2" roughness={0.8} />
      </mesh>

      {/* framed print on the left wall */}
      <group position={[-3.36, 1.32, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.92, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.62, 0.82]} />
          <meshStandardMaterial color="#f7f3ec" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.12, 0.019]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshStandardMaterial color={ACCENT} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.22, 0.019]}>
          <planeGeometry args={[0.4, 0.07]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.8} />
        </mesh>
      </group>

    </group>
  )
}

/* ---------------------------- dimension lines ---------------------------- */

function DimLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: ACCENT,
          background: "rgba(255,255,255,0.85)",
          border: `1px solid ${ACCENT}`,
          borderRadius: "999px",
          padding: "2px 8px",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </Html>
  )
}

function DimensionLines({ config }: { config: TableConfig }) {
  const w = config.width / 100
  const d = config.depth / 100
  const h = config.height / 100
  const off = 0.22
  const y = 0.012
  const tick = 0.05

  const geometry = useMemo(() => {
    const pts: number[] = []
    const seg = (a: [number, number, number], b: [number, number, number]) => {
      pts.push(a[0], a[1], a[2], b[0], b[1], b[2])
    }
    // width line (front)
    seg([-w / 2, y, d / 2 + off], [w / 2, y, d / 2 + off])
    seg([-w / 2, y, d / 2 + off - tick], [-w / 2, y, d / 2 + off + tick])
    seg([w / 2, y, d / 2 + off - tick], [w / 2, y, d / 2 + off + tick])
    // depth line (right)
    seg([w / 2 + off, y, -d / 2], [w / 2 + off, y, d / 2])
    seg([w / 2 + off - tick, y, -d / 2], [w / 2 + off + tick, y, -d / 2])
    seg([w / 2 + off - tick, y, d / 2], [w / 2 + off + tick, y, d / 2])
    // height line (front-right corner, vertical)
    const hx = w / 2 + off
    const hz = d / 2 + off
    seg([hx, 0, hz], [hx, h, hz])
    seg([hx - tick, 0, hz], [hx + tick, 0, hz])
    seg([hx - tick, h, hz], [hx + tick, h, hz])

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [w, d, h, off, y, tick])

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.9} />
      </lineSegments>
      <DimLabel position={[0, 0.03, d / 2 + off]} text={`${config.width} cm`} />
      <DimLabel position={[w / 2 + off, 0.03, 0]} text={`${config.depth} cm`} />
      <DimLabel position={[w / 2 + off, h / 2, d / 2 + off]} text={`${config.height} cm`} />
    </group>
  )
}

/* --------------------------------- scene -------------------------------- */

export function Scene({ config }: { config: TableConfig }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#f3ede4" }}>
      <Canvas shadows camera={{ position: [2.3, 1.7, 2.5], fov: 42, near: 0.1, far: 100 }}>
        <color attach="background" args={["#f3ede4"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[3.5, 5, 2.5]}
            intensity={1.15}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />
          <directionalLight position={[-3, 3.5, -2]} intensity={0.3} />
          <pointLight position={[0.9, 1.5, -0.4]} intensity={0.4} color="#fff5e0" />

          <Environment preset="studio" />

          <CameraRig />
          <Room />
          <OfficeTable config={config} />
          <DimensionLines config={config} />

          <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={9} blur={2.5} far={3} />

          <OrbitControls
            makeDefault
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={1.1}
            maxDistance={7}
            target={[0, 0.42, 0]}
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
