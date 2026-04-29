import { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";

export default function ThreePreview({ plan, visible }) {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!visible || !mountRef.current || !plan) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = 360;

    /* ======================================
       SCENE
    ====================================== */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#87b8e8");
    scene.fog = new THREE.Fog("#87b8e8", 20, 70);

    /* ======================================
       CAMERA
    ====================================== */
    const camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      1000
    );

    camera.position.set(16, 20, 20);

    /* ======================================
       RENDERER
    ====================================== */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    /* ======================================
       LIGHTS
    ====================================== */
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(20, 25, 15);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene.add(dir);

    /* ======================================
       FLOOR
    ====================================== */
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#dbeafe",
      roughness: 0.9
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ======================================
       GRID
    ====================================== */
    const grid = new THREE.GridHelper(
      60,
      30,
      "#64748b",
      "#cbd5e1"
    );
    scene.add(grid);

    /* ======================================
       ROOMS
    ====================================== */
    plan.rooms?.forEach((room) => {
      const geo = new THREE.BoxGeometry(
        room.width,
        3,
        room.height
      );

      const mat = new THREE.MeshStandardMaterial({
        color: room.color || "#93c5fd",
        transparent: true,
        opacity: 0.88,
        roughness: 0.35,
        metalness: 0.05
      });

      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        room.x + room.width / 2,
        1.5,
        room.y + room.height / 2
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);

      /* outline */
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: "#0f172a"
        })
      );

      line.position.copy(mesh.position);
      scene.add(line);
    });

    /* ======================================
       CONTROLS
    ====================================== */
    let controls;

    import(
      "three/examples/jsm/controls/OrbitControls.js"
    ).then(({ OrbitControls }) => {
      controls = new OrbitControls(
        camera,
        renderer.domElement
      );

      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 8;
      controls.maxDistance = 60;
      controls.maxPolarAngle = Math.PI / 2.05;

      controlsRef.current = controls;
      setReady(true);

      animate();
    });

    /* ======================================
       ANIMATE
    ====================================== */
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      controls?.update();
      renderer.render(scene, camera);
    };

    /* ======================================
       RESIZE
    ====================================== */
    const handleResize = () => {
      if (!container) return;

      const newWidth = container.clientWidth;

      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, height);
    };

    window.addEventListener("resize", handleResize);

    /* ======================================
       CLEANUP
    ====================================== */
    return () => {
      cancelAnimationFrame(frameRef.current);

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls?.dispose();
      renderer.dispose();

      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      setReady(false);
    };
  }, [plan, visible]);

  if (!visible) return null;

  return (
    <div className="mt-5 card-glass rounded-2xl p-4 shadow-premium">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">
          🏠 3D Preview
        </h3>

        <span
          className={`badge ${ready
              ? "badge-emerald"
              : "badge-indigo"
            }`}
        >
          {ready ? "Interactive" : "Loading..."}
        </span>
      </div>

      {/* BODY */}
      <Suspense
        fallback={
          <div className="h-[360px] flex items-center justify-center text-slate-300">
            Loading 3D Scene...
          </div>
        }
      >
        <div
          ref={mountRef}
          className="w-full h-[360px] rounded-xl overflow-hidden"
        />
      </Suspense>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-slate-300 flex justify-between">
        <span>🖱️ Drag to rotate</span>
        <span>🔍 Scroll to zoom</span>
      </div>
    </div>
  );
}