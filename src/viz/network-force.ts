/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'

const colorScale = d3.scaleOrdinal(d3.schemeTableau10)

const drag = (
  simulation: d3.Simulation<SimulationNodeDatum, SimulationLinkDatum>
) => {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: any) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

export interface NodeDatum {
  id: string | number
  group: string
  scaler?: number
  label?: string
}

export interface EdgeDatum {
  source: string | number
  target: string | number
}

// Types for force simulation.
// When nodes and edges are copied in the node below
// they become these objects
interface SimulationNodeDatum extends NodeDatum, d3.SimulationNodeDatum {}
type SimulationLinkDatum = d3.SimulationLinkDatum<SimulationNodeDatum>

/**
 * Network analysis force graph.
 */
@customElement('dharpa-network-force')
export class NetworkForce extends LitElement {
  /** Width of the SVG element */
  @property({ type: Number }) width = 600
  /** Height of the SVG element */
  @property({ type: Number }) height = 400
  /** Height of the SVG element */
  @property({ type: Boolean }) displayIsolatedNodes = false

  /** Nodes of the graph */
  @property({ attribute: false }) nodes: NodeDatum[] = []
  /** Edges of the graph */
  @property({ attribute: false }) edges: EdgeDatum[] = []
  /** A list of IDs of nodes representing the shortest path between two nodes */
  @property({ attribute: false }) shortestPath: (string | number)[] = []

  render() {
    return html`
      <svg>
        <g class="nodes"></g>
        <g class="edges"></g>
      </svg>
    `
  }

  updated() {
    const svg = d3.select(this.shadowRoot!.firstElementChild)
    const viewBox = this.displayIsolatedNodes
      ? [0, 0, this.width, this.height]
      : [-this.width / 2, -this.height / 2, this.width, this.height]
    svg.attr('viewBox', viewBox.join(' '))

    // create a copy because simulation modifies them.
    const nodes: SimulationNodeDatum[] = this.nodes.map((v) => ({ ...v })) ?? []
    const edges: SimulationLinkDatum[] = this.edges.map((v) => ({ ...v })) ?? []

    const simulPrep = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNodeDatum, SimulationLinkDatum>(edges)
          .id((d) => String(d.id))
      )
      .force('charge', d3.forceManyBody())

    const simulation = this.displayIsolatedNodes
      ? simulPrep.force(
          'center',
          d3.forceCenter(this.width / 2, this.height / 2)
        )
      : simulPrep.force('x', d3.forceX()).force('y', d3.forceY())

    const edgesGroup = svg
      .select('g.edges')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)

    const shortestPathIsProvided = this.shortestPath?.length > 0

    const link = edgesGroup
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'graph-links')
      .attr('stroke-width', (d) => {
        const sourceId = (d.source as SimulationNodeDatum).id
        const targetId = (d.target as SimulationNodeDatum).id

        if (shortestPathIsProvided) {
          return this.edgeIsInShortestPath(sourceId, targetId) ? 1 : 0.5
        }
        return 0.5
      })
      .attr('opacity', (d) => {
        const sourceId = (d.source as SimulationNodeDatum).id
        const targetId = (d.target as SimulationNodeDatum).id

        if (shortestPathIsProvided) {
          return this.edgeIsInShortestPath(sourceId, targetId) ? 1 : 0.2
        }
        return 1
      })

    const nodesGroup = svg
      .select('g.nodes')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)

    // nodes scaler
    const scaleNode = d3
      .scaleLinear((this.nodes ?? []).map((node) => node.scaler ?? 0))
      .range([3, 20])

    const node = nodesGroup
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'graph-node')
      .attr('opacity', (d) => {
        if (shortestPathIsProvided) {
          return this.shortestPath.includes(d.id) ? 1 : 0.2
        }
        return 1
      })
      .attr('r', (d) => scaleNode(d.scaler ?? 0) ?? 5)
      .attr('fill', (d) => colorScale(d.group))
      .call((drag(simulation) as unknown) as any)
      .on('click', (_e, node) => {
        this.dispatchEvent(new CustomEvent('node-clicked', { detail: node }))
      })

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0)
    })

    return svg.node()
  }

  edgeIsInShortestPath(
    source: EdgeDatum['source'],
    target: EdgeDatum['target']
  ): boolean {
    const sourceIdx = this.shortestPath.findIndex((id) => source === id)
    if (sourceIdx >= 0) {
      const targetId = this.shortestPath[sourceIdx + 1]
      return targetId === target
    }
    return false
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dharpa-network-force': NetworkForce
  }
}
