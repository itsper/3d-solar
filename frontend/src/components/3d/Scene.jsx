import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  TransformControls,
  PerspectiveCamera,
} from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import SolarPanel from './SolarPanel';
import Inverter from './Inverter';
import Battery from './Battery';
import Roof from './Roof';
import Wall from './Wall';
import Wire from './Wire';

const ComponentMap = {
  solarPanel: SolarPanel,
  inverter: Inverter,
  battery: Battery,
  roof: Roof,
  wall: Wall,
};

function SceneContent() {
  const { scene, settings, selectObject, completeWireConnection, setMode, updateObject, setTransformMode } = useStore();
  const { objects, wires, selectedObjectId, mode, wireStartComponent, transformMode } = scene;
  
  const controlsRef = useRef();
  const keysPressed = useRef({});
  const objectRefs = useRef({});

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  const getComponentPosition = (id) => {
    const obj = objects.find((o) => o.id === id);
    return obj?.position || [0, 0, 0];
  };

  const handleBackgroundClick = () => {
    selectObject(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          import('../../store/useStore').then(({ default: store }) => {
            store.getState().removeObject(selectedObjectId);
          });
        }
      }
      if (e.key === 'Escape') {
        selectObject(null);
        setMode('select');
      }
      if (e.key === 't' || e.key === 'T') setTransformMode('translate');
      if (e.key === 'r' || e.key === 'R') setTransformMode('rotate');
      if (e.key === 's' || e.key === 'S') setTransformMode('scale');
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedObjectId, selectObject, setMode, setTransformMode]);

  useFrame((state, delta) => {
    const speed = 20 * delta; 
    const isMoving = 
      keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] ||
      keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] ||
      keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] ||
      keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'];

    if (isMoving && controlsRef.current) {
      const { camera } = state;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0; 
      forward.normalize();
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      const moveDirection = new THREE.Vector3();
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) moveDirection.add(forward);
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) moveDirection.sub(forward);
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) moveDirection.add(right);
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) moveDirection.sub(right);

      if (moveDirection.lengthSq() > 0) {
        moveDirection.normalize().multiplyScalar(speed);
        camera.position.add(moveDirection);
        controlsRef.current.target.add(moveDirection);
      }
    }
  });

  const gridSize = 50;
  const gridDivisions = 100;

  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />

      <OrbitControls
        ref={controlsRef} 
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />

      {settings.showGrid && (
        <Grid
          args={[gridSize, gridSize]}
          divisions={gridDivisions}
          cellSize={settings.gridSize}
          cellThickness={0.5}
          cellColor="#3b82f6"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#1e40af"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* FIXED TRANSFORM CONTROLS 
         1. Uses key={selectedObjectId} to reset position on change.
         2. Binds directly to the objectRef.
      */}
      {selectedObject && mode === 'select' && objectRefs.current[selectedObjectId] && (
        <TransformControls
          key={selectedObjectId}
          object={objectRefs.current[selectedObjectId]}
          mode={transformMode}
          onObjectChange={(e) => {
             const target = e?.target?.object;
             if (target) {
                const { position, rotation, scale } = target;
                updateObject(selectedObjectId, {
                  position: [position.x, position.y, position.z],
                  rotation: [rotation.x, rotation.y, rotation.z],
                  scale: [scale.x, scale.y, scale.z],
                });
             }
          }}
        />
      )}

      {objects.map((component) => {
        const Component = ComponentMap[component.type];
        if (!Component) return null;

        return (
          <group
            key={component.id}
            ref={(ref) => {
              if (ref) {
                objectRefs.current[component.id] = ref;
              } else {
                delete objectRefs.current[component.id];
              }
            }}
            position={component.position}
            rotation={component.rotation}
            scale={component.scale}
          >
            <Component
              component={component}
              isSelected={component.id === selectedObjectId}
              onClick={(e) => {
                // SAFETY CHECK: e might be undefined if child calls onClick() directly
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                }
                
                if (mode === 'wire') {
                  if (wireStartComponent) {
                    completeWireConnection(component.id);
                  } else {
                    import('../../store/useStore').then(({ default: store }) => {
                      store.getState().startWireConnection(component.id);
                    });
                  }
                } else {
                  selectObject(component.id);
                }
              }}
            />
          </group>
        );
      })}

      {settings.showWires &&
        wires.map((wire) => (
          <Wire
            key={wire.id}
            wire={wire}
            fromPosition={getComponentPosition(wire.fromComponentId)}
            toPosition={getComponentPosition(wire.toComponentId)}
            isSelected={false}
          />
        ))}

      {mode === 'wire' && wireStartComponent && (
        <mesh position={getComponentPosition(wireStartComponent)}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
      )}

      <Environment preset="city" />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      style={{ background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)' }}
    >
      <SceneContent />
    </Canvas>
  );
}