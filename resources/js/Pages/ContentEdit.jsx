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
import { FaPlus, FaTrash, FaImage, FaEdit, FaSave } from 'react-icons/fa';
import { Inertia } from '@inertiajs/inertia';

const handleStyle = {
  width: '16px',
  height: '16px',
  border: '3px solid #555',
  borderRadius: '50%',
  backgroundColor: '#fff',
};

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
    <Handle 
      type="source" 
      position={Position.Right} 
      isConnectable={isConnectable}
      style={handleStyle}
    />
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
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable}
        style={handleStyle}
      />
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
      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable}
        style={handleStyle}
      />
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
  data,
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [edgeCenterX, edgeCenterY] = [(sourceX + targetX) / 2, (sourceY + targetY) / 2];

  const onEdgeClick = (evt, id) => {
    evt.stopPropagation();
    const newLabel = window.prompt('選択肢のテキストを入力してください:', data?.label || '');
    if (newLabel !== null) {
      data.onEdgeLabelChange(id, newLabel);
    }
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data.showLabel && (
        <foreignObject
          width={100}
          height={40}
          x={edgeCenterX - 50}
          y={edgeCenterY - 20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            style={{
              background: 'white',
              padding: '4px',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '12px',
              pointerEvents: 'all',
            }}
          >
            <span>{data?.label || '選択肢'}</span>
            <button
              className="edgebutton"
              onClick={(event) => onEdgeClick(event, id)}
              style={{
                marginLeft: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 4px',
              }}
            >
              <FaEdit />
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

const ContentEdit = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

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
      strokeWidth: 3,
      stroke: '#555',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#555',
    },
  };

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

  const updateEdgeLabels = useCallback(() => {
    setEdges((currentEdges) => {
      const edgeCounts = {};
      currentEdges.forEach(edge => {
        edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
      });

      return currentEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          showLabel: edgeCounts[edge.source] > 1
        }
      }));
    });
  }, [setEdges]);

  const onEdgeLabelChange = useCallback((edgeId, newLabel) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, label: newLabel } };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const newEdges = addEdge({ 
        ...params, 
        ...defaultEdgeOptions, 
        data: { label: '新しい選択肢', onEdgeLabelChange, showLabel: false } 
      }, eds);
      
      const edgeCounts = {};
      newEdges.forEach(edge => {
        edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
      });

      return newEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          showLabel: edgeCounts[edge.source] > 1
        }
      }));
    });
  }, [defaultEdgeOptions, onEdgeLabelChange]);

  const onAddPage = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length !== 1) {
      alert('ノードを1つ選択してください。');
      return;
    }

    const sourceNode = selectedNodes[0];
    const newNodeId = `page-${nextId}`;
    
    // 新しいページの位置を計算
    const baseX = sourceNode.position.x + 300;
    const baseY = sourceNode.position.y;

    // 既存のノードの位置を取得
    const existingPositions = nodes.map(node => ({ x: node.position.x, y: node.position.y }));

    // 新しい位置を見つける
    let newX = baseX;
    let newY = baseY;
    let attempts = 0;
    const maxAttempts = 100;
    const gridSize = 50;

    while (attempts < maxAttempts) {
      const isOverlapping = existingPositions.some(pos => 
        Math.abs(pos.x - newX) < 200 && Math.abs(pos.y - newY) < 350
      );

      if (!isOverlapping) {
        break;
      }

      // スパイラル状に新しい位置を探す
      const angle = 0.5 * attempts;
      const radius = gridSize * (1 + attempts / 10);
      newX = baseX + radius * Math.cos(angle);
      newY = baseY + radius * Math.sin(angle);

      attempts++;
    }

    if (attempts === maxAttempts) {
      alert('適切な位置が見つかりませんでした。レイアウトを調整してください。');
      return;
    }

    const newEdge = { 
      id: `e${sourceNode.id}-${newNodeId}`, 
      source: sourceNode.id, 
      target: newNodeId,
      type: 'custom',
      data: { label: '新しい選択肢', onEdgeLabelChange, showLabel: false },
      ...defaultEdgeOptions,
    };
    
    const tempEdges = [...edges, newEdge];
    
    const distance = getDistanceFromStart(newNodeId, tempEdges);

    const newNode = {
      id: newNodeId,
      type: 'pageNode',
      position: { x: newX, y: newY },
      data: { 
        label: `Page ${distance}`, 
        image: null,
        onAddImage: onAddImage,
        id: newNodeId,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => {
      const newEdges = [...eds, newEdge];
      const edgeCounts = {};
      newEdges.forEach(edge => {
        edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
      });

      return newEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          showLabel: edgeCounts[edge.source] > 1
        }
      }));
    });
    setNextId((id) => id + 1);

    setNodes((currentNodes) => {
      return currentNodes.map(node => {
        if (node.type === 'pageNode' && node.id !== newNodeId) {
          const nodeDistance = getDistanceFromStart(node.id, tempEdges);
          return {
            ...node,
            data: {
              ...node.data,
              label: `Page ${nodeDistance}`
            }
          };
        }
        return node;
      });
    });
  }, [nextId, nodes, edges, setNodes, setEdges, onAddImage, defaultEdgeOptions, onEdgeLabelChange, getDistanceFromStart]);

  const onDeletePage = useCallback(() => {
    const nodesToDelete = nodes.filter(node => node.selected && node.id !== 'start');
    const nodeIdsToDelete = new Set(nodesToDelete.map(node => node.id));

    setNodes((nds) => nds.filter((node) => !nodeIdsToDelete.has(node.id)));
    setEdges((eds) => {
      const newEdges = eds.filter((edge) => 
        !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target)
      );

      const edgeCounts = {};
      newEdges.forEach(edge => {
        edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
      });

      return newEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          showLabel: edgeCounts[edge.source] > 1
        }
      }));
    });
    
    setNodes((currentNodes) => {
      const currentEdges = edges.filter((edge) => 
        !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target)
      );
      return currentNodes.map(node => {
        if (node.type === 'pageNode') {
          const nodeDistance = getDistanceFromStart(node.id, currentEdges);
          return {
            ...node,
            data: {
              ...node.data,
              label: `Page ${nodeDistance}`
            }
          };
        }
        return node;
      });
    });
  }, [nodes, edges, setNodes, setEdges, getDistanceFromStart]);

  const onNodesDelete = useCallback((deletedNodes) => {
    const nodeIdsToDelete = new Set(deletedNodes.map(node => node.id));

    setEdges((eds) => {
      const newEdges = eds.filter((edge) => 
        !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target)
      );

      const edgeCounts = {};
      newEdges.forEach(edge => {
        edgeCounts[edge.source] = (edgeCounts[edge.source] || 0) + 1;
      });

      return newEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          showLabel: edgeCounts[edge.source] > 1
        }
      }));
    });

    setNodes((currentNodes) => {
      const remainingNodes = currentNodes.filter((node) => !nodeIdsToDelete.has(node.id));
      return remainingNodes.map(node => {
        if (node.type === 'pageNode') {
          const nodeDistance = getDistanceFromStart(node.id, edges);
          return {
            ...node,
            data: {
              ...node.data,
              label: `Page ${nodeDistance}`
            }
          };
        }
        return node;
      });
    });
  }, [edges, setEdges, setNodes, getDistanceFromStart]);

  const onEdgesDelete = useCallback(() => {
    updateEdgeLabels();
  }, [updateEdgeLabels]);

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
  }, [setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ 
    startNode: StartNode,
    pageNode: PageNode 
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const onSave = useCallback(() => {
    setIsSaving(true);
    const contentData = {
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
    };
  
    Inertia.post('/content', contentData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        setIsSaving(false);
        console.log('Save successful', page);
        // 成功時の処理を追加（例：通知やリダイレクト）
      },
      onError: (errors) => {
        console.error('Save failed', errors);
        setIsSaving(false);
        alert('保存中にエラーが発生しました。');
      },
    });
  }, [nodes, edges]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Controls />
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
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FaSave /> {isSaving ? '保存中...' : '保存してプレビュー'}
        </button>
      </div>
    </div>
  );
};

export default ContentEdit;