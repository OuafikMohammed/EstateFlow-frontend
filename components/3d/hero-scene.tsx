"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Environment } from "@react-three/drei"

function FloatingBuilding() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#c5a059" wireframe emissive="#c5a059" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  )
}

function Scene3D() {
  return (
    <group>
      <FloatingBuilding />
      <mesh position={[-2, 0, -2]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color="#1b4332" wireframe emissive="#1b4332" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[2, 0, -1]}>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#c5a059" wireframe emissive="#c5a059" emissiveIntensity={0.3} opacity={0.7} transparent />
      </mesh>
    </group>
  )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ opacity: 0.6, zIndex: 0 }}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }} 
        gl={{ 
          alpha: true, 
          antialias: true, 
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }} 
        dpr={[1, 2]}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        onCreated={(state) => {
          // Ensure the canvas stays visible with transparent background
          state.gl.setClearColor(0x000000, 0)
        }}
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#c5a059" />
        <pointLight position={[-10, 5, -5]} intensity={1.5} color="#c5a059" />
        <directionalLight position={[0, 10, 5]} intensity={0.8} color="#ffffff" />
        <Scene3D />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
