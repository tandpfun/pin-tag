import React from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';

export default function ParticipantChart() {
  return (
    <div>
      <ReactFlow
        nodes={[
          {
            id: '1',
            type: 'input',
            data: {
              label: 'Input Node',
            },
            position: { x: 250, y: 0 },
          },
        ]}
      />
    </div>
  );
}
