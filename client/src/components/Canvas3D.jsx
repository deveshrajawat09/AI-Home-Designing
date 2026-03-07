import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { useDesignerStore } from "../store/useDesignerStore";

const BoxItem = ({ item }) => {
  const scale = 0.2;
  return (
    <mesh position={[item.position.x * 0.01, 0.6, item.position.y * 0.01]} castShadow receiveShadow>
      <boxGeometry args={[2 * scale, 1 * scale, 2 * scale]} />
      <meshStandardMaterial color={item.color || "#0ea5e9"} metalness={0.1} roughness={0.5} />
    </mesh>
  );
};

const Canvas3D = () => {
  const { items, room } = useDesignerStore();

  return (
    <Canvas shadows camera={{ position: [6, 6, 6], fov: 45 }}>
      <color attach="background" args={[0.97, 0.97, 0.95]} />
      <hemisphereLight intensity={0.6} groundColor="#e2e8f0" />
      <spotLight position={[5, 8, 2]} angle={0.3} penumbra={0.5} intensity={1} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width * 0.02, room.height * 0.02]} />
        <meshStandardMaterial color="#f5f1e8" />
      </mesh>
      {items.map((item) => (
        <BoxItem key={item.id} item={item} />
      ))}
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      <Environment preset="apartment" />
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
};

export default Canvas3D;
