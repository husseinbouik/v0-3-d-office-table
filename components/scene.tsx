"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Text } from "@react-three/drei"
import { OfficeTable } from "./office-table"
import { Suspense } from "react"

function SceneLabel() {
  return (
    <Text
      position={[0, 2.8, 0]}
      fontSize={0.2}
      color="#1a1a1a"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Geist-Bold.ttf"
    >
      Office Desk — Cable Hole
    </Text>
  )
}

export function Scene() {
  return (
    <div className="w-full h-screen bg-[#f5f0eb]">
      <Canvas
        shadows
        camera={{ position: [4, 3.5, 4], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: 3 }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={30}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-3, 4, -2]} intensity={0.3} />
          <pointLight position={[1.2, 2.2, -0.6]} intensity={0.5} color="#fff5e0" />

          {/* Environment for reflections */}
          <Environment preset="studio" />

          {/* The table */}
          <OfficeTable />

          {/* Label */}
          <SceneLabel />

          {/* Contact shadows for realism */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={12}
            blur={2.5}
            far={4}
          />

          {/* Controls */}
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
