import { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";

export default function ThreePreview({ plan, visible }) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!visible || !mountRef.current || !plan) return;
    const width = mountRef.current.clientWidth;
    const height = 320;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#78a9d9");
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 18, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    plan.rooms.forEach((r) => {
      const geometry = new THREE.BoxGeometry(r.width, 2.6, r.height);
      const material = new THREE.MeshStandardMaterial({
        color: r.color || "#95b6df",
        opacity: 0.9,
        transparent: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(r.x + r.width / 2, 1.3, r.y + r.height / 2);
      scene.add(mesh);
    });

    const grid = new THREE.GridHelper(40, 20, "#94a3b8", "#e2e8f0");
    scene.add(grid);

    import("three/examples/jsm/controls/OrbitControls.js").then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      setReady(true);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      renderer.dispose();
      setReady(false);
    };
  }, [plan, visible]);

  if (!visible) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 p-3">
      <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-300">
        <span>3D Preview</span>
        <span>{ready ? "Interactive" : "Loading�"}</span>
      </div>
      <Suspense fallback={<div className="text-gray-500">Loading 3D�</div>}>
        <div ref={mountRef} className="w-full h-[320px]" />
      </Suspense>
    </div>
  );
}
