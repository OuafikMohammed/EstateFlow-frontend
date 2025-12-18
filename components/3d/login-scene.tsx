"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

function Building() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireframeRef = useRef<THREE.LineSegments>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.2
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = t * 0.2
      wireframeRef.current.position.y = Math.sin(t * 0.5) * 0.2
    }
  })

  return (
    <group>
      {/* Main building structure */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} transparent opacity={0.8} />
      </mesh>

      {/* Gold wireframe */}
      <lineSegments ref={wireframeRef} position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.5, 3, 1.5)]} />
        <lineBasicMaterial color="#C5A059" linewidth={2} />
      </lineSegments>

      {/* Additional geometric shapes */}
      <mesh position={[-2, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#1B4332" metalness={0.6} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      <lineSegments position={[-2, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.8, 0.8)]} />
        <lineBasicMaterial color="#E8D4A0" />
      </lineSegments>

      <mesh position={[2, -0.5, 0.5]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
      </mesh>
      <lineSegments position={[2, -0.5, 0.5]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <edgesGeometry args={[new THREE.OctahedronGeometry(0.6)]} />
        <lineBasicMaterial color="#C5A059" />
      </lineSegments>
    </group>
  )
}

export function LoginScene() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#C5A059" />

        <Building />

        <fog attach="fog" args={["#0B0B0B", 5, 15]} />
      </Canvas>
    </div>
  )
}
