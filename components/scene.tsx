"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { OfficeTable } from "./office-table"
import { Suspense } from "react"

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#e8e0d4" roughness={0.8} metalness={0.0} />
    </mesh>
  )
}

export function Scene() {
  console.log("[v0] Scene component rendering")
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f5f0eb" }}>
      <Canvas
        shadows
        camera={{ position: [4, 3.5, 4], fov: 45, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-3, 4, -2]} intensity={0.3} />
          <pointLight position={[1.2, 2.2, -0.6]} intensity={0.5} color="#fff5e0" />

          <Environment preset="studio" />

          <OfficeTable />
          <Floor />

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={12}
            blur={2.5}
            far={4}
          />

          <OrbitControls
            makeDefault
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={10}
            target={[0, 1, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
