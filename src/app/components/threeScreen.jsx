"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Text } from "troika-three-text";

// ⚙️ Default Configuration (Server-Safe)
const DEFAULT_CONFIG = {
  // Scene settings
  MAX_OBJECTS: 300, // Giảm để giảm lag
  SPAWN_INTERVAL: 50, // Tăng để giảm tần suất spawn
  SPAWN_WIDTH: 30,
  SPAWN_DEPTH: 20,
  START_HEIGHT: 20,
  GRAVITY: 0.0005,
  BACKGROUND_COLOR: "#FFFFFF",
  CAMERA_FOV: 60,
  CAMERA_Z_POSITION: 8,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,

  // Heart settings
  HEART_SCALE: 0.7,
  HEART_DEPTH: 0.2,
  HEART_COLOR: "#ff4d6d",
  HEART_EMISSIVE: "#ff1a4d",
  HEART_EMISSIVE_INTENSITY: 0.3, // Giảm thêm để tối ưu
  HEART_ROUGHNESS: 0.3,
  HEART_METALNESS: 0.5,
  HEART_ROTATION_SPEED: 0.01,

  // Text settings
  TEXT_PROBABILITY: 0.4,
  TEXT_CONTENT: [
    "Đào Thị Xuân",
    "04/12/2002",
    "Dưaa",
    "Nhân mã tháng 12",
    "Mỗi ngày là một cơ hội mới",
    "Không sao cả, bắt đầu lại từ đầu nhé",
    "Cứ bước tiếp, dù chậm cũng được",
    "Khó khăn chỉ là tạm thời",
    "Thở sâu, rồi mình sẽ ổn thôi",
    "Từng bước nhỏ cũng là tiến bộ",
    "Lùi một bước để tiến xa hơn",
    "Hãy tử tế với chính mình",
  ],
  TEXT_SIZE: 280,
  TEXT_SCALE: 5,
  TEXT_HEIGHT_SCALE: 4,
  TEXT_COLOR: "#00ccff",
  TEXT_SHADOW_COLOR: "#00ccff",
  TEXT_SHADOW_BLUR: 20,
  TEXT_FONT: 'bold 140px "Montserrat", sans-serif',
  TEXT_CANVAS_SIZE: 1000, // Giảm để tối ưu
  TEXT_Z_OFFSET: 0.1,

  // Lighting settings
  AMBIENT_LIGHT_INTENSITY: 0.3,
  DIRECTIONAL_LIGHT_INTENSITY: 0.5,
  DIRECTIONAL_LIGHT_POSITION: { x: 0, y: 10, z: 10 },

  // Animation settings
  FALL_THRESHOLD: -30,
};

const ThreeScene = () => {
  const mountRef = useRef(null);
  const hearts = [];
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  let fontLoaded = false;
  const textureCache = new Map(); // Cache for text textures

  // Update config based on screen size (client-side only)
  useEffect(() => {
    const updateConfig = () => {
      const isMobile = window.innerWidth < 768;
      setConfig({
        ...DEFAULT_CONFIG,
        MAX_OBJECTS: isMobile ? 15 : 30, // Giảm thêm trên mobile
        CAMERA_FOV: isMobile ? 70 : 60,
        CAMERA_Z_POSITION: isMobile ? 10 : 8,
        HEART_SCALE: isMobile ? 0.4 : 0.7,
        TEXT_SIZE: isMobile ? 90 : 140,
        TEXT_SCALE: isMobile ? 3 : 5,
        TEXT_HEIGHT_SCALE: isMobile ? 1.5 : 2,
        TEXT_CANVAS_SIZE: isMobile ? 384 : 768, // Giảm thêm trên mobile
      });
    };

    updateConfig();
    window.addEventListener("resize", updateConfig);

    return () => {
      window.removeEventListener("resize", updateConfig);
    };
  }, []);

  // 🧱 Create 3D Heart Mesh
  function createHeartMesh() {
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0.25, 0.25);
    heartShape.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
    heartShape.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
    heartShape.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
    heartShape.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
    heartShape.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
    heartShape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: config.HEART_DEPTH,
      bevelEnabled: false,
    });

    const material = new THREE.MeshStandardMaterial({
      color: config.HEART_COLOR,
      emissive: config.HEART_EMISSIVE,
      emissiveIntensity: config.HEART_EMISSIVE_INTENSITY,
      roughness: config.HEART_ROUGHNESS,
      metalness: config.HEART_METALNESS,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(config.HEART_SCALE, config.HEART_SCALE, config.HEART_SCALE);
    mesh.rotation.x = Math.PI;

    mesh.position.set(
      (Math.random() - 0.5) * config.SPAWN_WIDTH,
      config.START_HEIGHT + Math.random() * 5,
      (Math.random() - 0.5) * config.SPAWN_DEPTH
    );

    mesh.velocity = 0;
    return mesh;
  }

  // ✨ Create Neon Text Sprite
  function createNeonTextSprite() {
    if (!fontLoaded) return null;

    const text =
      config.TEXT_CONTENT[
        Math.floor(Math.random() * config.TEXT_CONTENT.length)
      ];

    // Check if texture is already cached
    if (textureCache.has(text)) {
      const texture = textureCache.get(text);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(config.TEXT_SCALE, config.TEXT_HEIGHT_SCALE, 1);

      sprite.position.set(
        (Math.random() - 0.5) * config.SPAWN_WIDTH,
        config.START_HEIGHT + Math.random() * 5,
        (Math.random() - 0.5) * config.SPAWN_DEPTH +
          (Math.random() - 0.5) * config.TEXT_Z_OFFSET
      );
      sprite.velocity = 0;

      return sprite;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.height = config.TEXT_CANVAS_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.font = config.TEXT_FONT.replace("140px", `${config.TEXT_SIZE}px`);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure text width and scale to fit canvas
    const textWidth = ctx.measureText(text).width;
    const maxWidth = canvas.width * 0.8;
    let fontSize = config.TEXT_SIZE;
    if (textWidth > maxWidth) {
      const scaleFactor = maxWidth / textWidth;
      fontSize *= scaleFactor;
      ctx.font = config.TEXT_FONT.replace("140px", `${fontSize}px`);
    }

    ctx.shadowColor = config.TEXT_SHADOW_COLOR;
    ctx.shadowBlur = config.TEXT_SHADOW_BLUR;
    ctx.fillStyle = config.TEXT_COLOR;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    textureCache.set(text, texture); // Cache the texture

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(config.TEXT_SCALE, config.TEXT_HEIGHT_SCALE, 1);

    sprite.position.set(
      (Math.random() - 0.5) * config.SPAWN_WIDTH,
      config.START_HEIGHT + Math.random() * 5,
      (Math.random() - 0.5) * config.SPAWN_DEPTH +
        (Math.random() - 0.5) * config.TEXT_Z_OFFSET
    );
    sprite.velocity = 0;

    return sprite;
  }

  function createTextMesh(content) {
    const text = new Text();
    text.text = content;
    text.font = "/fonts/montserrat-msdf.fnt"; // Đường public tới file .fnt|json
    text.fontSize = 0.8; // Tùy quy mô scene của bạn
    text.color = 0x00ccff;

    // Hiệu ứng viền phát sáng (neon)
    text.outlineWidth = 0.002;
    text.outlineBlur = 0.006;
    text.outlineColor = 0x00ccff;

    text.position.set(
      (Math.random() - 0.5) * config.SPAWN_WIDTH,
      config.START_HEIGHT + Math.random() * 5,
      (Math.random() - 0.5) * config.SPAWN_DEPTH
    );

    text.velocity = 0;
    text.sync(); // Build geometry & upload atlas (chỉ 1 lần)

    return text;
  }

  useEffect(() => {
    // Load Google Font (Montserrat) for Vietnamese support
    const loadFont = () => {
      return new Promise((resolve) => {
        const link = document.createElement("link");
        link.href =
          "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap";
        link.rel = "stylesheet";
        link.onload = () => {
          fontLoaded = true;
          resolve();
        };
        link.onerror = () => {
          console.error("Failed to load font");
          fontLoaded = true;
          resolve();
        };
        document.head.appendChild(link);

        setTimeout(() => {
          if (!fontLoaded) {
            fontLoaded = true;
            resolve();
          }
        }, 2000);
      });
    };

    const initScene = async () => {
      await loadFont();

      const mount = mountRef.current;
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      // 🎬 Scene & Camera
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(config.BACKGROUND_COLOR);

      const camera = new THREE.PerspectiveCamera(
        config.CAMERA_FOV,
        width / height,
        config.CAMERA_NEAR,
        config.CAMERA_FAR
      );
      camera.position.z = config.CAMERA_Z_POSITION;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0)); // Giảm để tối ưu hơn
      renderer.setSize(width, height);
      renderer.sortObjects = true;
      mount.appendChild(renderer.domElement);

      // 🎛️ Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.minDistance = 5;
      controls.maxDistance = 20;
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };

      // 💡 Lighting
      scene.add(
        new THREE.AmbientLight(0xffffff, config.AMBIENT_LIGHT_INTENSITY)
      );
      const light = new THREE.DirectionalLight(
        0xffffff,
        config.DIRECTIONAL_LIGHT_INTENSITY
      );
      light.position.set(
        config.DIRECTIONAL_LIGHT_POSITION.x,
        config.DIRECTIONAL_LIGHT_POSITION.y,
        config.DIRECTIONAL_LIGHT_POSITION.z
      );
      scene.add(light);

      // 🧩 Pre-Spawn Objects to Ensure Immediate Visibility
      for (let i = 0; i < Math.min(3, config.MAX_OBJECTS); i++) {
        // Giảm số lượng pre-spawn
        const isText = Math.random() < config.TEXT_PROBABILITY;
        const obj = isText ? createNeonTextSprite() : createHeartMesh();
        if (obj) {
          scene.add(obj);
          hearts.push(obj);
        }
      }

      // 🧩 Spawn Objects Over Time
      const interval = setInterval(() => {
        if (hearts.length < config.MAX_OBJECTS) {
          const isText = Math.random() < config.TEXT_PROBABILITY;
          const obj = isText ? createNeonTextSprite() : createHeartMesh();
          if (obj) {
            scene.add(obj);
            hearts.push(obj);
          }
        }
      }, config.SPAWN_INTERVAL);

      // 🔄 Animation Loop with Optimized Color Transition
      let colorPhase = 0;
      const animate = () => {
        requestAnimationFrame(animate);

        for (let i = hearts.length - 1; i >= 0; i--) {
          const obj = hearts[i];
          obj.velocity += config.GRAVITY;
          obj.position.y -= obj.velocity;
          if (obj.rotation) obj.rotation.y += config.HEART_ROTATION_SPEED;

          if (obj.position.y < config.FALL_THRESHOLD) {
            scene.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
            hearts.splice(i, 1);
          }
        }

        // Cập nhật màu sắc bằng SpriteMaterial.color (nhẹ hơn)
        colorPhase += 0.01;
        const r = Math.sin(colorPhase) * 127 + 128;
        const g = Math.sin(colorPhase + 2) * 127 + 128;
        const b = Math.sin(colorPhase + 4) * 127 + 128;
        const newColor = new THREE.Color(
          `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
        );

        hearts.forEach((obj) => {
          if (obj.material.map) {
            obj.material.color.set(newColor); // Thay đổi màu trực tiếp
          }
        });

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // 📏 Handle Resize for Responsiveness
      const handleResize = () => {
        const newWidth = mount.clientWidth;
        const newHeight = mount.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.fov = newWidth < 768 ? 70 : 60;
        camera.position.z = newWidth < 768 ? 10 : 8;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener("resize", handleResize);

      // 🧹 Cleanup
      return () => {
        clearInterval(interval);
        window.removeEventListener("resize", handleResize);
        mount.removeChild(renderer.domElement);
        hearts.forEach((obj) => {
          scene.remove(obj);
          obj.geometry?.dispose();
          obj.material?.dispose();
        });
        textureCache.forEach((texture) => texture.dispose());
        textureCache.clear();
        renderer.dispose();
      };
    };

    initScene();
  }, [config]);

  return <div className="w-full h-screen" ref={mountRef}></div>;
};

export default ThreeScene;
