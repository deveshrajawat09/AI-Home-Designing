import { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";

export default function ThreePreview({ plan, visible }) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!visible || !mountRef.current || !plan) return;

    // Use full width/height of the container
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500; // default large height

    const scene = new THREE.Scene();
    
    // Add grid background visually consistent with dark mode support
    const isDark = document.documentElement.classList.contains("dark");
    scene.background = new THREE.Color(isDark ? "#0f172a" : "#f8fafc");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Move camera out a bit more to accommodate larger view
    camera.position.set(12, 22, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    // Setup soft shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 20, 10);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Ground plane to receive shadows
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    plan.rooms.forEach((r) => {
      const geometry = new THREE.BoxGeometry(r.width, 2.6, r.height);
      const material = new THREE.MeshStandardMaterial({
        color: r.color || "#cbd5e1",
        opacity: 0.95,
        transparent: true,
        roughness: 0.4,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(r.x + r.width / 2, 1.3, r.y + r.height / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    const gridColor = isDark ? "#334155" : "#cbd5e1";
    const centerGridColor = isDark ? "#475569" : "#94a3b8";
    const grid = new THREE.GridHelper(40, 20, centerGridColor, gridColor);
    scene.add(grid);

    // Dynamic resize observer
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    let controls;
    let animationFrameId;

    import("three/examples/jsm/controls/OrbitControls.js").then(({ OrbitControls }) => {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground
      setReady(true);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (controls) controls.dispose();
      renderer.dispose();
      setReady(false);
    };
  }, [plan, visible]);

  if (!visible) return null;

  return (
    <div className="flex flex-col w-full h-full p-0">
      <div className="px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
          3D Preview
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${ready ? 'text-emerald-500' : 'text-slate-400'}`}>
          {ready ? "Interactive" : "Loading..."}
        </span>
      </div>
      <div className="flex-1 relative bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">Loading 3D Engine...</div>}>
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        </Suspense>
      </div>
    </div>
  );
}
