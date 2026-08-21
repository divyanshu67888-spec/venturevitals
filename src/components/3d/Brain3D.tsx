import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sphere, Cylinder, Bounds } from "@react-three/drei";
import { useRef, Suspense, useMemo } from "react";
import * as THREE from "three";

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create nodes (spheres) and connections (lines)
  const nodeCount = 30;
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5
      ).normalize().multiplyScalar(Math.random() * 0.8 + 0.4),
    }));
  }, []);

  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: "#a855f7", 
    transparent: true, 
    opacity: 0.3 
  });
  
  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: "#c084fc",
    emissive: "#a855f7",
    emissiveIntensity: 2,
    toneMapped: false
  });

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Central glowing core */}
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial color="#ffffff" emissive="#c084fc" emissiveIntensity={3} />
      </Sphere>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <Sphere key={i} args={[0.04, 16, 16]} position={node.position}>
          <primitive object={nodeMaterial} attach="material" />
        </Sphere>
      ))}

      {/* Connections connecting nearby nodes */}
      <group>
        {nodes.map((node, i) => {
          return nodes.map((otherNode, j) => {
            if (i >= j || node.position.distanceTo(otherNode.position) > 1.2) return null;
            const points = [node.position, otherNode.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            return <primitive key={`${i}-${j}`} object={line} />;
          });
        })}
      </group>
    </group>
  );
}

const Brain3D = () => {
  return (
    <div className="w-full h-[250px] md:h-[300px] relative">
      <div className="absolute inset-0 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#c084fc" />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <NeuralNetwork />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Brain3D;
