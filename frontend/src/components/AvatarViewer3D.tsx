// 3D stylized head viewer for CutPreview.
// Uses expo-gl + three. Head is a parametric stylized geometry so we can
// mutate scale/color per-region live from the editor.
//
// NOTE: This is a stylized mock. A real photo-to-3D pipeline would replace
// the geometry behind this component.

import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useEffect, useRef } from "react";
import { PanResponder, StyleSheet, View, useWindowDimensions } from "react-native";
import * as THREE from "three";

import { useTheme } from "../theme";
import type { RegionKey } from "../data/regions";
import type { VariantParams } from "../store";
import { findAvatar } from "../data/avatars";

export type QuickView = "front" | "side" | "back" | "top";

interface Props {
  avatarId: string;
  gender: "men" | "women";
  params: VariantParams;
  selectedRegion: RegionKey | null;
  quickView?: QuickView | null;
  lighting?: "warm" | "cool";
  onRegionTap?: (region: RegionKey) => void;
  height?: number;
}

// map region -> mesh key
type MeshMap = {
  head: THREE.Mesh;
  hairTop: THREE.Mesh;
  hairFringe: THREE.Mesh;
  hairSidesL: THREE.Mesh;
  hairSidesR: THREE.Mesh;
  hairBack: THREE.Mesh;
  sideburnsL: THREE.Mesh;
  sideburnsR: THREE.Mesh;
  beard: THREE.Mesh;
  hairCrown: THREE.Mesh;
  hairLayers: THREE.Mesh;
  hairBangs: THREE.Mesh;
  hairEnds: THREE.Mesh;
};

const REGION_TO_MESH: Record<RegionKey, (keyof MeshMap)[]> = {
  top: ["hairTop"],
  fringe: ["hairFringe"],
  sides: ["hairSidesL", "hairSidesR"],
  back: ["hairBack"],
  sideburns: ["sideburnsL", "sideburnsR"],
  beard: ["beard"],
  crown: ["hairCrown"],
  layers: ["hairLayers"],
  bangs: ["hairBangs"],
  ends: ["hairEnds"],
  parting: ["hairCrown", "hairBangs"],
};

// keep a mutable ref-object holding scene state we can mutate imperatively
interface SceneRef {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: Renderer | null;
  meshes: MeshMap | null;
  targetRotY: number;
  targetRotX: number;
  rotY: number;
  rotX: number;
  zoom: number;
  targetZoom: number;
  raf: number | null;
  lightWarm: THREE.PointLight | null;
  lightCool: THREE.PointLight | null;
  ambient: THREE.AmbientLight | null;
}

export default function AvatarViewer3D({
  avatarId,
  gender,
  params,
  selectedRegion,
  quickView,
  lighting = "warm",
  height = 420,
}: Props) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const ref = useRef<SceneRef>({
    scene: null,
    camera: null,
    renderer: null,
    meshes: null,
    targetRotY: 0,
    targetRotX: 0,
    rotY: 0,
    rotX: 0,
    zoom: 1,
    targetZoom: 1,
    raf: null,
    lightWarm: null,
    lightCool: null,
    ambient: null,
  });

  // Gesture handling
  const lastTouches = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const lastTap = useRef<number>(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const now = Date.now();
        if (now - lastTap.current < 280) {
          // double tap resets
          ref.current.targetRotX = 0;
          ref.current.targetRotY = 0;
          ref.current.targetZoom = 1;
        }
        lastTap.current = now;
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          lastTouches.current = { x: 0, y: 0, dist: Math.hypot(dx, dy) };
        } else if (touches.length === 1) {
          lastTouches.current = { x: touches[0].pageX, y: touches[0].pageY };
        }
      },
      onPanResponderMove: (e, gs) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2 && lastTouches.current?.dist != null) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / lastTouches.current.dist;
          ref.current.targetZoom = Math.min(2, Math.max(0.6, ref.current.targetZoom * ratio));
          lastTouches.current.dist = dist;
        } else if (touches.length === 1) {
          ref.current.targetRotY += gs.dx * 0.006;
          ref.current.targetRotX = Math.max(
            -0.8,
            Math.min(0.8, ref.current.targetRotX + gs.dy * 0.004),
          );
          lastTouches.current = { x: touches[0].pageX, y: touches[0].pageY };
        }
      },
      onPanResponderRelease: () => {
        lastTouches.current = null;
      },
      onPanResponderTerminate: () => {
        lastTouches.current = null;
      },
    }),
  ).current;

  // Apply quickView imperatively when it changes.
  useEffect(() => {
    if (!quickView) return;
    switch (quickView) {
      case "front":
        ref.current.targetRotY = 0;
        ref.current.targetRotX = 0;
        break;
      case "side":
        ref.current.targetRotY = Math.PI / 2;
        ref.current.targetRotX = 0;
        break;
      case "back":
        ref.current.targetRotY = Math.PI;
        ref.current.targetRotX = 0;
        break;
      case "top":
        ref.current.targetRotY = 0;
        ref.current.targetRotX = 0.7;
        break;
    }
  }, [quickView]);

  // Apply lighting
  useEffect(() => {
    if (!ref.current.lightWarm || !ref.current.lightCool) return;
    if (lighting === "warm") {
      ref.current.lightWarm.intensity = 1.1;
      ref.current.lightCool.intensity = 0.15;
    } else {
      ref.current.lightWarm.intensity = 0.35;
      ref.current.lightCool.intensity = 1.0;
    }
  }, [lighting]);

  // Apply params to meshes on every change.
  useEffect(() => {
    applyParamsToMeshes(ref.current.meshes, params, gender, selectedRegion);
  }, [params, gender, selectedRegion]);

  // Update skin color when avatar changes.
  useEffect(() => {
    const a = findAvatar(avatarId);
    if (a && ref.current.meshes) {
      (ref.current.meshes.head.material as THREE.MeshStandardMaterial).color.set(a.skinTone);
    }
  }, [avatarId]);

  const onContextCreate = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    // Opaque clear color — transparent (alpha 0) GL surfaces render black on
    // several Android GL drivers, so keep it opaque for reliable rendering.
    renderer.setClearColor(0x0a0a0a, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.2, 5.4);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const warm = new THREE.PointLight(0xffb066, 1.1, 30);
    warm.position.set(3, 3, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x88bbff, 0.15, 30);
    cool.position.set(-3, 2, 2);
    scene.add(cool);

    // Root group so all meshes rotate together.
    const root = new THREE.Group();
    scene.add(root);

    const avatar = findAvatar(avatarId);
    const skin = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatar?.skinTone ?? "#D9AC8C"),
      roughness: 0.7,
      metalness: 0,
    });

    // Head (slightly stretched sphere)
    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 40), skin);
    head.scale.set(0.85, 1.05, 0.9);
    root.add(head);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.45, 20), skin);
    neck.position.set(0, -1.05, 0);
    root.add(neck);

    // Eyes (dark disks)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), eyeMat);
    eyeL.position.set(-0.27, 0.08, 0.78);
    root.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.27;
    root.add(eyeR);

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1B1B1B"),
      roughness: 0.55,
      metalness: 0.05,
    });

    // Build hair meshes for both genders — we just show/hide via visible flag.
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), hairMat.clone());
    hairTop.scale.set(0.9, 0.55, 0.95);
    hairTop.position.set(0, 0.55, 0);
    root.add(hairTop);

    const hairFringe = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20, 0, Math.PI, 0, Math.PI / 2), hairMat.clone());
    hairFringe.rotation.x = Math.PI / 2.2;
    hairFringe.position.set(0, 0.55, 0.62);
    hairFringe.scale.set(1.1, 0.6, 0.5);
    root.add(hairFringe);

    const hairSidesL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.6), hairMat.clone());
    hairSidesL.position.set(-0.78, 0.05, 0);
    root.add(hairSidesL);
    const hairSidesR = hairSidesL.clone();
    hairSidesR.material = (hairSidesL.material as THREE.MeshStandardMaterial).clone();
    hairSidesR.position.x = 0.78;
    root.add(hairSidesR);

    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), hairMat.clone());
    hairBack.scale.set(0.9, 0.7, 0.55);
    hairBack.position.set(0, 0.2, -0.55);
    hairBack.rotation.x = Math.PI;
    root.add(hairBack);

    const sideburnsL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), hairMat.clone());
    sideburnsL.position.set(-0.68, -0.28, 0.35);
    root.add(sideburnsL);
    const sideburnsR = sideburnsL.clone();
    sideburnsR.material = (sideburnsL.material as THREE.MeshStandardMaterial).clone();
    sideburnsR.position.x = 0.68;
    root.add(sideburnsR);

    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), hairMat.clone());
    beard.scale.set(0.95, 0.45, 0.55);
    beard.position.set(0, -0.58, 0.35);
    beard.rotation.x = Math.PI;
    root.add(beard);

    // Women-specific
    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), hairMat.clone());
    hairCrown.scale.set(1, 0.65, 1);
    hairCrown.position.set(0, 0.58, 0);
    root.add(hairCrown);

    const hairLayers = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 1.1, 24, 6, true), hairMat.clone());
    hairLayers.position.set(0, 0.1, 0);
    root.add(hairLayers);

    const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.35), hairMat.clone());
    hairBangs.position.set(0, 0.55, 0.72);
    root.add(hairBangs);

    const hairEnds = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.6, 0.9, 24, 4, true), hairMat.clone());
    hairEnds.position.set(0, -0.9, -0.15);
    root.add(hairEnds);

    const meshes: MeshMap = {
      head,
      hairTop,
      hairFringe,
      hairSidesL,
      hairSidesR,
      hairBack,
      sideburnsL,
      sideburnsR,
      beard,
      hairCrown,
      hairLayers,
      hairBangs,
      hairEnds,
    };

    ref.current.scene = scene;
    ref.current.camera = camera;
    ref.current.renderer = renderer;
    ref.current.meshes = meshes;
    ref.current.ambient = ambient;
    ref.current.lightWarm = warm;
    ref.current.lightCool = cool;

    applyParamsToMeshes(meshes, params, gender, selectedRegion);

    const loop = () => {
      // ease rotation and zoom
      ref.current.rotY += (ref.current.targetRotY - ref.current.rotY) * 0.15;
      ref.current.rotX += (ref.current.targetRotX - ref.current.rotX) * 0.15;
      ref.current.zoom += (ref.current.targetZoom - ref.current.zoom) * 0.15;
      root.rotation.y = ref.current.rotY;
      root.rotation.x = ref.current.rotX;
      camera.position.z = 5.4 / ref.current.zoom;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      // @ts-ignore
      gl.endFrameEXP();
      ref.current.raf = requestAnimationFrame(loop);
    };
    loop();
  };

  useEffect(() => {
    return () => {
      if (ref.current.raf) cancelAnimationFrame(ref.current.raf);
    };
  }, []);

  return (
    <View
      style={[styles.wrap, { height, width, backgroundColor: colors.surface }]}
      testID="avatar-viewer-3d"
      {...pan.panHandlers}
    >
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
}

function applyParamsToMeshes(
  meshes: MeshMap | null,
  params: VariantParams,
  gender: "men" | "women",
  selectedRegion: RegionKey | null,
) {
  if (!meshes) return;

  const men = gender === "men";
  // toggle visibility per gender
  meshes.hairTop.visible = men;
  meshes.hairFringe.visible = men;
  meshes.hairSidesL.visible = men;
  meshes.hairSidesR.visible = men;
  meshes.hairBack.visible = men;
  meshes.sideburnsL.visible = men;
  meshes.sideburnsR.visible = men;
  meshes.beard.visible = men;
  meshes.hairCrown.visible = !men;
  meshes.hairLayers.visible = !men;
  meshes.hairBangs.visible = !men;
  meshes.hairEnds.visible = !men;

  const highlight = (m: THREE.Mesh, on: boolean) => {
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissive = new THREE.Color(on ? 0xe5a93c : 0x000000);
    mat.emissiveIntensity = on ? 0.4 : 0;
  };

  const set = (mesh: THREE.Mesh, lengthCm: number, base: THREE.Vector3, axis: "x" | "y" | "z", regionKey: RegionKey) => {
    const norm = Math.max(0.02, lengthCm / 15); // 0..1
    const s = mesh.scale.clone();
    s[axis] = base[axis] * (0.3 + norm * 1.6);
    mesh.scale.copy(s);
    highlight(mesh, selectedRegion === regionKey);
  };

  // Men region mapping
  if (men) {
    if (params.top) set(meshes.hairTop, params.top.lengthCm, new THREE.Vector3(0.9, 0.55, 0.95), "y", "top");
    if (params.fringe) set(meshes.hairFringe, params.fringe.lengthCm, new THREE.Vector3(1.1, 0.6, 0.5), "z", "fringe");
    if (params.sides) {
      const norm = Math.max(0.02, params.sides.lengthCm / 8);
      meshes.hairSidesL.scale.set(0.35 * (0.3 + norm * 1.6), 0.9, 0.6);
      meshes.hairSidesR.scale.copy(meshes.hairSidesL.scale);
      highlight(meshes.hairSidesL, selectedRegion === "sides");
      highlight(meshes.hairSidesR, selectedRegion === "sides");
      // Move sides down with fade height (fake)
      const fadeY = 0.05 - ((params.sides.fadeHeight ?? 0) / 100) * 0.35;
      meshes.hairSidesL.position.y = fadeY;
      meshes.hairSidesR.position.y = fadeY;
    }
    if (params.back) set(meshes.hairBack, params.back.lengthCm, new THREE.Vector3(0.9, 0.7, 0.55), "y", "back");
    if (params.sideburns) {
      const norm = Math.max(0.02, params.sideburns.lengthCm / 5);
      meshes.sideburnsL.scale.set(1, 0.5 + norm * 2, 1);
      meshes.sideburnsR.scale.copy(meshes.sideburnsL.scale);
      highlight(meshes.sideburnsL, selectedRegion === "sideburns");
      highlight(meshes.sideburnsR, selectedRegion === "sideburns");
    }
    if (params.beard) {
      const norm = Math.max(0.02, params.beard.lengthCm / 10);
      meshes.beard.scale.set(0.95, 0.45 * (0.3 + norm * 1.6), 0.55);
      highlight(meshes.beard, selectedRegion === "beard");
    }
  } else {
    if (params.crown) set(meshes.hairCrown, params.crown.lengthCm, new THREE.Vector3(1, 0.65, 1), "y", "crown");
    if (params.layers) {
      const norm = Math.max(0.05, params.layers.lengthCm / 40);
      meshes.hairLayers.scale.set(1, 0.4 + norm * 1.6, 1);
      highlight(meshes.hairLayers, selectedRegion === "layers");
    }
    if (params.bangs) {
      const norm = Math.max(0.02, params.bangs.lengthCm / 20);
      meshes.hairBangs.scale.set(1, 0.4 + norm * 1.5, 1);
      highlight(meshes.hairBangs, selectedRegion === "bangs");
    }
    if (params.ends) {
      const norm = Math.max(0.05, params.ends.lengthCm / 80);
      meshes.hairEnds.scale.set(1, 0.5 + norm * 2, 1);
      meshes.hairEnds.position.y = -0.6 - norm * 0.9;
      highlight(meshes.hairEnds, selectedRegion === "ends");
    }
    if (params.parting) {
      const pos = (params.parting.partingPos ?? 50) / 100 - 0.5;
      meshes.hairBangs.position.x = pos * 0.6;
      highlight(meshes.hairBangs, selectedRegion === "parting");
    }
  }

  // Global hair color
  const globalColor = params.globalColor ?? "#1B1B1B";
  const paintKeys: (keyof MeshMap)[] = [
    "hairTop",
    "hairFringe",
    "hairSidesL",
    "hairSidesR",
    "hairBack",
    "sideburnsL",
    "sideburnsR",
    "beard",
    "hairCrown",
    "hairLayers",
    "hairBangs",
    "hairEnds",
  ];
  paintKeys.forEach((k) => {
    const m = (meshes as any)[k] as THREE.Mesh;
    (m.material as THREE.MeshStandardMaterial).color.set(globalColor);
  });
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
});

// Small helper to check region visibility exports (unused externally).
export { REGION_TO_MESH };
