import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FloorElement } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  elements: FloorElement[];
  style: string;
}

const STYLE_COLORS: Record<string, { floor: number; walls: number; ceiling: number; accent: number }> = {
  modern: { floor: 0xe8e4dc, walls: 0xf5f5f0, ceiling: 0xffffff, accent: 0x4a90d9 },
  minimal: { floor: 0xd4c9b8, walls: 0xffffff, ceiling: 0xfbfbfb, accent: 0x8b7355 },
  luxury: { floor: 0x3d2b1f, walls: 0x1a1a2e, ceiling: 0x16213e, accent: 0xffd700 },
  traditional: { floor: 0x7c5c3a, walls: 0xfffdd0, ceiling: 0xfaebd7, accent: 0x8b4513 },
  scandinavian: { floor: 0xd4c5a9, walls: 0xfafafa, ceiling: 0xffffff, accent: 0x6a8098 },
  industrial: { floor: 0x555555, walls: 0x333333, ceiling: 0x222222, accent: 0xb7410e },
};

export function ThreePreview({ elements, style }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;

    const colors = STYLE_COLORS[style] || STYLE_COLORS.modern;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0a0a1a : 0xf0f0f5);
    scene.fog = new THREE.Fog(isDark ? 0x0a0a1a : 0xf0f0f5, 10, 50);

    const camera = new THREE.PerspectiveCamera(50, el.offsetWidth / el.offsetHeight, 0.1, 100);
    camera.position.set(8, 6, 10);
    camera.lookAt(3, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.offsetWidth, el.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 10, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffeedd, 1.5, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshLambertMaterial({ color: colors.floor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const SCALE = 0.015;

    // Build walls from elements
    elements.forEach(el2 => {
      if (el2.type === 'wall') {
        const dx = (el2.x2 - el2.x1) * SCALE;
        const dz = (el2.y2 - el2.y1) * SCALE;
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len < 0.05) return;

        const wallGeo = new THREE.BoxGeometry(len, 2.5, (el2.thickness || 8) * SCALE);
        const wallMat = new THREE.MeshLambertMaterial({ color: colors.walls });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(
          (el2.x1 * SCALE + el2.x2 * SCALE) / 2,
          1.25,
          (el2.y1 * SCALE + el2.y2 * SCALE) / 2,
        );
        wall.rotation.y = Math.atan2(dz, dx);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
      }

      if (el2.type === 'furniture') {
        const fw = el2.w * SCALE;
        const fh = el2.h * SCALE;
        let height = 0.5;
        if (el2.subtype === 'sofa') height = 0.8;
        else if (el2.subtype === 'bed') height = 0.6;
        else if (el2.subtype === 'table') height = 0.75;
        else if (el2.subtype === 'chair') height = 0.85;
        else if (el2.subtype === 'wardrobe') height = 2.0;
        else if (el2.subtype === 'desk') height = 0.75;
        else if (el2.subtype === 'tv') height = 0.1;
        else if (el2.subtype === 'fridge') height = 1.8;

        const col = el2.color ? parseInt(el2.color.replace('#', ''), 16) : colors.accent;
        const geo = new THREE.BoxGeometry(fw, height, fh);
        const mat = new THREE.MeshLambertMaterial({ color: col });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (el2.x + el2.w / 2) * SCALE,
          height / 2,
          (el2.y + el2.h / 2) * SCALE,
        );
        mesh.rotation.y = ((el2.rotation || 0) * Math.PI) / 180;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });

    // Default room if no walls
    if (!elements.some(e => e.type === 'wall')) {
      const roomWalls = [
        { x1: 0, y1: 0, x2: 400, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 300 },
        { x1: 400, y1: 0, x2: 400, y2: 300 },
        { x1: 0, y1: 300, x2: 400, y2: 300 },
      ];
      roomWalls.forEach(w => {
        const dx = (w.x2 - w.x1) * SCALE;
        const dz = (w.y2 - w.y1) * SCALE;
        const len = Math.sqrt(dx * dx + dz * dz);
        const geo = new THREE.BoxGeometry(len, 2.5, 0.12);
        const mat = new THREE.MeshLambertMaterial({ color: colors.walls });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((w.x1 + w.x2) / 2 * SCALE, 1.25, (w.y1 + w.y2) / 2 * SCALE);
        mesh.rotation.y = Math.atan2(dz, dx);
        scene.add(mesh);
      });

      // Sample furniture
      const sofaGeo = new THREE.BoxGeometry(1.5, 0.8, 0.8);
      const sofa = new THREE.Mesh(sofaGeo, new THREE.MeshLambertMaterial({ color: 0xa5b4fc }));
      sofa.position.set(3, 0.4, 2);
      scene.add(sofa);

      const tableGeo = new THREE.BoxGeometry(1, 0.75, 0.6);
      const table = new THREE.Mesh(tableGeo, new THREE.MeshLambertMaterial({ color: 0xd4b896 }));
      table.position.set(3, 0.375, 3.5);
      scene.add(table);
    }

    // Grid helper
    const grid = new THREE.GridHelper(20, 20, 0x444466, 0x222233);
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMats.forEach(m => { m.transparent = true; m.opacity = 0.3; });
    scene.add(grid);

    // Orbit controls (manual)
    let isDown = false;
    let lastX = 0, lastY = 0;
    let theta = Math.PI / 4, phi = Math.PI / 4, radius = 14;

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(3, 0, 3);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => { isDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onMouseUp = () => { isDown = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      theta -= (e.clientX - lastX) * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, phi - (e.clientY - lastY) * 0.005));
      lastX = e.clientX; lastY = e.clientY;
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      radius = Math.max(4, Math.min(30, radius + e.deltaY * 0.01));
      updateCamera();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.offsetWidth / el.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.offsetWidth, el.offsetHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [elements, style, isDark]);

  return (
    <div ref={mountRef} className="w-full h-full relative">
      <div className="absolute top-3 left-3 text-xs text-indigo-300 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg pointer-events-none">
        🎮 Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}