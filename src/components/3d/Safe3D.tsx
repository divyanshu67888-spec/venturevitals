import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox, Cylinder } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function SafeModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: "#fbbf24", // Amber/Gold
    metalness: 1.0,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });

  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: "#1e293b",
    metalness: 0.9,
    roughness: 0.3,
  });

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Main Safe Body */}
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.15} smoothness={4}>
        <primitive object={darkMetal} attach="material" />
      </RoundedBox>

      {/* Safe Door Frame */}
      <RoundedBox args={[1.4, 1.4, 0.1]} radius={0.1} smoothness={4} position={[0, 0, 0.76]}>
        <primitive object={goldMaterial} attach="material" />
      </RoundedBox>

      {/* Safe Door Inner */}
      <RoundedBox args={[1.2, 1.2, 0.1]} radius={0.05} smoothness={4} position={[0, 0, 0.78]}>
        <primitive object={darkMetal} attach="material" />
      </RoundedBox>

      {/* Spinning Lock Dial */}
      <group position={[0, 0, 0.85]}>
        <Cylinder args={[0.3, 0.3, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <primitive object={goldMaterial} attach="material" />
        </Cylinder>
        <Cylinder args={[0.2, 0.2, 0.15, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
          <meshPhysicalMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
        </Cylinder>
        <mesh position={[0, 0.15, 0.13]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Lock Handle/Spokes */}
      <group position={[0, 0, 0.85]}>
        <Cylinder args={[0.04, 0.04, 1.2, 16]} rotation={[0, 0, 0]}>
          <primitive object={goldMaterial} attach="material" />
        </Cylinder>
        <Cylinder args={[0.04, 0.04, 1.2, 16]} rotation={[0, 0, Math.PI / 2]}>
          <primitive object={goldMaterial} attach="material" />
        </Cylinder>
      </group>
    </group>
  );
}

const Safe3D = () => {
  return (
    <div className="w-full h-[250px] md:h-[300px] relative">
      <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
      <Canvas camera={{ position: [2, 1.5, 4], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#fcd34d" />
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <SafeModel />
          </Float>
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Safe3D;
