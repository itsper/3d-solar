import React, { useState } from 'react';
import { Box, Text, Cylinder } from '@react-three/drei';

export default function Battery({ component, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { position, rotation, scale, properties } = component;
  const width = properties?.width || 0.6;
  const height = properties?.height || 1.2;
  const depth = properties?.depth || 0.25;
  const capacity = properties?.capacity || 5000;

  const color = isSelected ? '#eab308' : hovered ? '#fde047' : '#713f12';
  const frameColor = isSelected ? '#ca8a04' : '#4a2808';

  return (
    <group>
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
          color={frameColor}
          metalness={0.5}
          roughness={0.5}
        />
      </Box>

      <Box args={[width - 0.1, height - 0.1, depth - 0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.6}
          emissive={isSelected ? '#ca8a04' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </Box>

      <Cylinder args={[0.03, 0.03, 0.05]} position={[width / 2 - 0.05, height / 2, 0]}>
        <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.2} />
      </Cylinder>

      <Cylinder args={[0.03, 0.03, 0.05]} position={[-width / 2 + 0.05, height / 2, 0]}>
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {(isSelected || hovered) && (
        <Text
          position={[0, height / 2 + 0.2, 0]}
          fontSize={0.15}
          color="#f1f5f9"
          anchorX="center"
          anchorY="middle"
        >
          {capacity}Wh
        </Text>
      )}
    </group>
  );
}
