import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function Wire({ wire, fromPosition, toPosition, fromComponent, toComponent, isSelected }) {
  const color = isSelected ? '#22c55e' : '#f97316';
  const lineWidth = isSelected ? 3 : 2;

  // Calculate connection points based on component types
  const getConnectionPoint = (component, position, targetPosition, isFrom) => {
    if (!component) {
      return new THREE.Vector3(...position);
    }

    const width = component.properties?.width || 2;
    const depth = component.properties?.depth || 1;

    // Calculate direction towards the other component
    const sourcePos = new THREE.Vector3(...position);
    const targetPos = new THREE.Vector3(...targetPosition);
    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos).normalize();

    // For solar panels, connect from the side facing the target
    if (component.type === 'solarPanel') {
      // Determine which axis has the largest difference
      const dx = Math.abs(direction.x);
      const dz = Math.abs(direction.z);

      let offsetX = 0;
      let offsetZ = 0;

      if (dx > dz) {
        // Connect from left/right side
        offsetX = direction.x > 0 ? width / 2 : -width / 2;
      } else {
        // Connect from front/back side
        offsetZ = direction.z > 0 ? depth / 2 : -depth / 2;
      }

      return new THREE.Vector3(position[0] + offsetX, position[1], position[2] + offsetZ);
    }

    // For inverters and batteries, connect from the side
    if (component.type === 'inverter' || component.type === 'battery') {
      // Use a fixed side connection point
      return new THREE.Vector3(position[0] + width / 2, position[1], position[2]);
    }

    // Default: center connection
    return new THREE.Vector3(...position);
  };

  const fromConnPoint = getConnectionPoint(fromComponent, fromPosition, toPosition, true);
  const toConnPoint = getConnectionPoint(toComponent, toPosition, fromPosition, false);

  // Create curved line for better visibility
  const points = [];
  const midY = Math.max(fromConnPoint.y, toConnPoint.y) + 0.5;

  points.push(fromConnPoint);
  points.push(new THREE.Vector3(fromConnPoint.x, midY, fromConnPoint.z));
  points.push(new THREE.Vector3(toConnPoint.x, midY, toConnPoint.z));
  points.push(toConnPoint);

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
