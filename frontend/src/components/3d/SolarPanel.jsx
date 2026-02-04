import React, { useState } from 'react';
import { Box, Text } from '@react-three/drei';
import useStore from '../../store/useStore';

export default function SolarPanel({ component, isSelected, onClick }) {
  const { settings, updateObject } = useStore();
  const [hovered, setHovered] = useState(false);

  const { position, rotation, scale, properties } = component;
  const width = properties?.width || 2;
  const height = properties?.height || 0.05;
  const depth = properties?.depth || 1;
  const wattage = properties?.wattage || 400;

  const color = isSelected ? '#60a5fa' : hovered ? '#93c5fd' : '#1e3a5f';
  const frameColor = isSelected ? '#3b82f6' : '#0f172a';

  return (
    <group>
      {/* Solar panel frame */}
      <Box args={[width + 0.1, height + 0.02, depth + 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </Box>

      {/* Solar cells */}
      <Box
        args={[width, height, depth]}
        position={[0, 0.02, 0]}
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
          roughness={0.8}
          emissive={isSelected ? '#1e40af' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </Box>

      {/* Label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, height + 0.3, 0]}
          fontSize={0.2}
          color="#f1f5f9"
          anchorX="center"
          anchorY="middle"
        >
          {wattage}W
        </Text>
      )}
    </group>
  );
}
