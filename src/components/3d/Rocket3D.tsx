import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Cylinder, Sphere, Cone } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: "#94a3b8",
  metalness: 0.8,
  roughness: 0.2,
});

function RocketModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  const hullMaterial = new THREE.MeshPhysicalMaterial({
    color: "#f8fafc", // White spaceship hull
    metalness: 0.1,
    roughness: 0.2,
    clearcoat: 1.0,
  });

  const accentMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ef4444", // Red accents
    metalness: 0.3,
    roughness: 0.3,
    clearcoat: 0.5,
  });

  const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: "#0f172a", // Dark glass
    metalness: 0.9,
    roughness: 0.0,
    clearcoat: 1.0,
  });
  
  const fireMaterial = new THREE.MeshStandardMaterial({
    color: "#fb923c",
    emissive: "#fb923c",
    emissiveIntensity: 4,
    toneMapped: false
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.5;
      groupRef.current.position.x = Math.sin(t * 20) * 0.01;
      groupRef.current.position.y = Math.cos(t * 20) * 0.01;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, -Math.PI / 6]} scale={0.8}>
      {/* Main Hull Body */}
      <Cylinder args={[0.6, 0.6, 2, 32]} position={[0, 0, 0]}>
        <primitive object={hullMaterial} attach="material" />
      </Cylinder>

      {/* Nose Cone */}
      <Cone args={[0.6, 1.5, 32]} position={[0, 1.75, 0]}>
        <primitive object={accentMaterial} attach="material" />
      </Cone>

      {/* Window */}
      <group position={[0, 0.5, 0.53]} rotation={[Math.PI / 2, 0, 0]}>
        <Cylinder args={[0.3, 0.3, 0.1, 32]}>
          <primitive object={metalMaterial} attach="material" />
        </Cylinder>
        <Cylinder args={[0.2, 0.2, 0.15, 32]} position={[0, -0.05, 0]}>
          <primitive object={windowMaterial} attach="material" />
        </Cylinder>
      </group>

      {/* Thrusters / Fins */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <group position={[0.7, -0.8, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
              <boxGeometry args={[0.8, 1.0, 0.1]} />
              <primitive object={accentMaterial} attach="material" />
            </mesh>
             <Cylinder args={[0.15, 0.3, 0.5, 16]} position={[-0.2, -0.8, 0]}>
               <meshPhysicalMaterial color="#334155" metalness={0.9} roughness={0.4} />
             </Cylinder>
             <Sphere args={[0.2, 16, 16]} position={[-0.2, -1.2, 0]} scale={[1, 1.5, 1]}>
               <primitive object={fireMaterial} attach="material" />
             </Sphere>
          </group>
        </group>
      ))}
      
      {/* Main Center Engine */}
      <Cylinder args={[0.4, 0.6, 0.5, 32]} position={[0, -1.2, 0]}>
        <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </Cylinder>
      {/* Main Fire */}
      <Sphere args={[0.4, 32, 32]} position={[0, -1.6, 0]} scale={[1, 1.8, 1]}>
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={5} />
      </Sphere>
    </group>
  );
}

const Rocket3D = () => {
  return (
    <div className="w-full h-[250px] md:h-[300px] relative">
      <div className="absolute inset-0 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[0, -2, 0]} intensity={2} color="#fb923c" />
          <Float speed={3} rotationIntensity={0.1} floatIntensity={0.5}>
            <RocketModel />
          </Float>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Rocket3D;
