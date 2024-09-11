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
} from 'reactflow';
import 'reactflow/dist/style.css';

const StartNode = ({ data, isConnectable, selected }) => (
  <div style={{ 
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '5px',
    width: '100px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: selected ? '2px solid blue' : '1px solid black',
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
        borderRadius: '5px',
        width: '150px',
        height: '220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: selected ? '2px solid blue' : '1px solid black',
      }}>
        <div>{data.label}</div>
        <div 
          onClick={handleImageClick}
          style={{ 
            width: '100%', 
            height: '120px', 
            border: '1px dashed gray', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {data.image ? (
            <img 
              src={data.image} 
              alt={`Page ${data.id}`} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <p>クリックして画像を追加</p>
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

const ContentEdit = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    // コンポーネントのマウント時に「Start」ノードのみを設定
    setNodes([
      { 
        id: 'start', 
        type: 'startNode', 
        position: { x: 0, y: 0 }, 
        data: { label: 'Start' } 
      }
    ]);
    console.log('Initial Start node set');
  }, []); // 依存配列を空にして、一度だけ実行されるようにする

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
    type: 'bezier',
    style: { strokeWidth: 3, stroke: '#555' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#555',
    },
    curvature: 0.5,
  };

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)), 
  [defaultEdgeOptions]);

  const nodeTypes = useMemo(() => ({ 
    startNode: StartNode,
    pageNode: PageNode 
  }), []);

  const onAddPage = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length !== 1) {
      alert('ノードを1つ選択してください。');
      return;
    }

    const sourceNode = selectedNodes[0];
    const newNode = {
      id: `page-${nextId}`,
      type: 'pageNode',
      position: { 
        x: sourceNode.position.x + 250, 
        y: sourceNode.position.y 
      },
      data: { 
        label: `Page ${nextId}`, 
        image: null,
        onAddImage: onAddImage,
        id: `page-${nextId}`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      { 
        id: `e${sourceNode.id}-${newNode.id}`, 
        source: sourceNode.id, 
        target: newNode.id,
        ...defaultEdgeOptions,
      },
    ]);
    setNextId((id) => id + 1);
    console.log('New page added:', newNode);
  }, [nextId, nodes, setNodes, setEdges, onAddImage, defaultEdgeOptions]);

  const onDeletePage = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.id === 'start' || !node.selected));
    setEdges((eds) => eds.filter((edge) => 
      !nodes.find((node) => node.selected && (node.id === edge.source || node.id === edge.target))
    ));
    console.log('Page(s) deleted');
  }, [nodes, setNodes, setEdges]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: selectedNodes.some((selectedNode) => selectedNode.id === node.id)
      }))
    );
    console.log('Selection changed:', selectedNodes);
  }, [setNodes]);

  useEffect(() => {
    console.log('Current nodes:', nodes);
  }, [nodes]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
        <button onClick={onAddPage}>新規ページ</button>
        <button onClick={onDeletePage}>選択したページを削除</button>
      </div>
    </div>
  );
};

export default ContentEdit;