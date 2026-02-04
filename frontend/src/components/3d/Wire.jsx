import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function Wire({ wire, fromPosition, toPosition, isSelected }) {
  const color = isSelected ? '#22c55e' : '#f97316';
  const lineWidth = isSelected ? 3 : 2;

  // Create curved line for better visibility
  const points = [];
  const midY = Math.max(fromPosition[1], toPosition[1]) + 0.5;

  points.push(new THREE.Vector3(...fromPosition));
  points.push(new THREE.Vector3(fromPosition[0], midY, fromPosition[2]));
  points.push(new THREE.Vector3(toPosition[0], midY, toPosition[2]));
  points.push(new THREE.Vector3(...toPosition));

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={0.8}
    />
  );
}
