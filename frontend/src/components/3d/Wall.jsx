import React, { useState } from 'react';
import { Box } from '@react-three/drei';

export default function Wall({ component, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { position, rotation, scale, properties } = component;
  const width = properties?.width || 4;
  const height = properties?.height || 3;
  const depth = properties?.depth || 0.2;

  const color = isSelected ? '#a1a1aa' : hovered ? '#d4d4d8' : '#e5e5e5';

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
          metalness={0}
          roughness={1}
        />
      </Box>
    </group>
  );
}
