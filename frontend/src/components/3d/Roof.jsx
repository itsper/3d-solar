import React, { useState } from 'react';
import { Box } from '@react-three/drei';

export default function Roof({ component, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { position, rotation, scale, properties } = component;
  const width = properties?.width || 10;
  const height = properties?.height || 0.2;
  const depth = properties?.depth || 10;

  const color = isSelected ? '#f97316' : hovered ? '#fb923c' : '#8b4513';

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
          color={color}
          metalness={0.1}
          roughness={0.9}
        />
      </Box>
    </group>
  );
}
