import React, { useState } from 'react';
import { Box, Text } from '@react-three/drei';

export default function Inverter({ component, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { position, rotation, scale, properties } = component;
  const width = properties?.width || 0.5;
  const height = properties?.height || 0.8;
  const depth = properties?.depth || 0.3;
  const capacity = properties?.capacity || 5000;

  const color = isSelected ? '#22c55e' : hovered ? '#86efac' : '#166534';
  const frameColor = isSelected ? '#16a34a' : '#14532d';

  return (
    <group>
      {/* Main body */}
      <Box
        args={[width, height, depth]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          emissive={isSelected ? '#15803d' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </Box>

      {/* LED indicator */}
      <Box args={[0.1, 0.05, 0.02]} position={[0, height / 2 - 0.1, depth / 2 + 0.01]}>
        <meshBasicMaterial color="#10b981" />
      </Box>

      {/* Ventilation slots */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={i}
          args={[width - 0.1, 0.02, 0.01]}
          position={[0, -height / 2 + 0.2 + i * 0.12, depth / 2 + 0.01]}
        >
          <meshStandardMaterial color="#0f172a" />
        </Box>
      ))}

      {/* Label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, height / 2 + 0.2, 0]}
          fontSize={0.15}
          color="#f1f5f9"
          anchorX="center"
          anchorY="middle"
        >
          {capacity}W
        </Text>
      )}
    </group>
  );
}
