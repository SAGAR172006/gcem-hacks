import { MasterContext, MindmapNode } from '../types';

/**
 * Mindmap Agent — Hub and Spoke, Phase 2 Worker.
 *
 * Builds MindmapNode[] directly from MasterContext.coreConcepts.
 * ZERO Gemini calls — the concept graph is already encoded in the Master Context.
 *
 * Layout strategy:
 *   - Root = topic at center (0,0)
 *   - Up to 8 core concepts spread in a radial ring around root
 *   - Each concept's relatedTerms become sub-nodes fanning outward
 */
export function buildMindmapFromContext(masterCtx: MasterContext): MindmapNode[] {
  const nodes: MindmapNode[] = [];

  // Root node
  nodes.push({ id: 'root', label: masterCtx.topic, parent: null, x: 0, y: 0 });

  const concepts = masterCtx.coreConcepts.slice(0, 8);
  const count = concepts.length;

  // Radial positions for concept nodes — evenly spread around a circle
  const RING_RADIUS = 260;
  const SUB_RADIUS = 140;

  concepts.forEach((concept, i) => {
    // Angle in radians, starting from top (-90°), going clockwise
    const angle = ((2 * Math.PI) / count) * i - Math.PI / 2;
    const cx = Math.round(Math.cos(angle) * RING_RADIUS);
    const cy = Math.round(Math.sin(angle) * RING_RADIUS);

    const nodeId = 'c' + i;
    nodes.push({
      id: nodeId,
      label: concept.term,
      parent: 'root',
      x: cx,
      y: cy,
    });

    // Sub-nodes from relatedTerms — fan outward from parent
    const related = concept.relatedTerms.slice(0, 3);
    related.forEach((term, j) => {
      // Offset angle slightly left/right of the parent direction
      const spreadAngle = angle + ((j - (related.length - 1) / 2) * 0.45);
      const sx = Math.round(cx + Math.cos(spreadAngle) * SUB_RADIUS);
      const sy = Math.round(cy + Math.sin(spreadAngle) * SUB_RADIUS);
      nodes.push({
        id: nodeId + 's' + j,
        label: term,
        parent: nodeId,
        x: sx,
        y: sy,
      });
    });
  });

  return nodes;
}
