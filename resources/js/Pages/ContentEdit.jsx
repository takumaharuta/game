import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';

const StartNode = ({ data, isConnectable, selected }) => (
  <div style={{ 
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '10px',
    width: '120px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: selected ? '2px solid blue' : '1px solid black',
    fontSize: '18px',
    fontWeight: 'bold',
  }}>
    {data.label}
    <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
  </div>
);

const PageNode = ({ data, isConnectable, selected }) => {
  const inputRef = useRef(null);

  const handleImageClick = (e) => {
    e.stopPropagation();
    inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && data.onAddImage) {
      data.onAddImage(data.id, file);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div style={{ 
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '10px',
        width: '180px',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: selected ? '2px solid blue' : '1px solid black',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{data.label}</div>
        <div 
          onClick={handleImageClick}
          style={{ 
            width: '100%', 
            height: '240px', 
            border: '1px dashed gray', 
            borderRadius: '8px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {data.image ? (
            <img 
              src={data.image} 
              alt={`Page ${data.id}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <FaImage size={40} color="#888" />
              <p style={{ marginTop: '10px', color: '#888' }}>タップして画像を追加</p>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </>
  );
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3,
  });

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: selected ? 6 : 4,
          stroke: selected ? '#3182ce' : '#555',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#3182ce"
          strokeWidth={10}
          strokeOpacity={0.3}
          pointerEvents="none"
        />
      )}
    </>
  );
};

const ContentEdit = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    setNodes([
      { 
        id: 'start', 
        type: 'startNode', 
        position: { x: 0, y: 150 }, 
        data: { label: 'Start' } 
      }
    ]);
    console.log('Initial Start node set');
  }, []);

  const onAddImage = useCallback((pageId, file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === pageId) {
            return { ...node, data: { ...node.data, image: event.target.result } };
          }
          return node;
        })
      );
    };
    reader.readAsDataURL(file);
  }, [setNodes]);

  const defaultEdgeOptions = {
    type: 'custom',
    style: { 
      strokeWidth: 4,
      stroke: '#555',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 25,
      height: 25,
      color: '#555',
    },
  };

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)), 
  [defaultEdgeOptions]);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => 
    setEdges((els) => els.map((el) => (el.id === oldEdge.id ? newConnection : el))),
  [setEdges]);

  const nodeTypes = useMemo(() => ({ 
    startNode: StartNode,
    pageNode: PageNode 
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const getDistanceFromStart = useCallback((nodeId, edgesArray) => {
    let distance = 0;
    let currentId = nodeId;

    while (currentId !== 'start') {
      const edge = edgesArray.find(e => e.target === currentId);
      if (!edge) break;
      distance++;
      currentId = edge.source;
    }

    return distance;
  }, []);

  const updatePageNumbers = useCallback(() => {
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        if (node.type === 'pageNode') {
          const distance = getDistanceFromStart(node.id, edges);
          return {
            ...node,
            data: {
              ...node.data,
              label: `Page ${distance}`
            }
          };
        }
        return node;
      });
    });
  }, [edges, getDistanceFromStart, setNodes]);

  const onAddPage = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length !== 1) {
      alert('ノードを1つ選択してください。');
      return;
    }

    const sourceNode = selectedNodes[0];
    const newNodeId = `page-${nextId}`;

    const newEdge = { 
      id: `e${sourceNode.id}-${newNodeId}`, 
      source: sourceNode.id, 
      target: newNodeId,
      ...defaultEdgeOptions,
    };

    const distance = getDistanceFromStart(newNodeId, [...edges, newEdge]) + 1;

    const newNode = {
      id: newNodeId,
      type: 'pageNode',
      position: { 
        x: sourceNode.position.x + 250, 
        y: sourceNode.position.y 
      },
      data: { 
        label: `Page ${distance}`, 
        image: null,
        onAddImage: onAddImage,
        id: newNodeId,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setNextId((id) => id + 1);

    updatePageNumbers();

  }, [nextId, nodes, edges, setNodes, setEdges, onAddImage, defaultEdgeOptions, getDistanceFromStart, updatePageNumbers]);

  const onDeletePage = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.id === 'start' || !node.selected));
    setEdges((eds) => eds.filter((edge) => 
      !nodes.find((node) => node.selected && (node.id === edge.source || node.id === edge.target))
    ));
    console.log('Page(s) deleted');
    
    updatePageNumbers();
  }, [nodes, setNodes, setEdges, updatePageNumbers]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: selectedNodes.some((selectedNode) => selectedNode.id === node.id)
      }))
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        selected: selectedEdges.some((selectedEdge) => selectedEdge.id === edge.id)
      }))
    );
    console.log('Selection changed:', { selectedNodes, selectedEdges });
  }, [setNodes, setEdges]);

  useEffect(() => {
    updatePageNumbers();
  }, [edges, updatePageNumbers]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        style={{ height: '100%', width: '100%' }}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        nodesDraggable={false}
      >
        <Controls showZoom={false} />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={onAddPage}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FaPlus /> 新規ページを追加
        </button>
        <button
          onClick={onDeletePage}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FaTrash /> 選択したページを削除
        </button>
      </div>
    </div>
  );
};

export default ContentEdit;