/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'

const scale = d3.scaleOrdinal(d3.schemeTableau10)

const drag = (simulation: any) => {
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

/**
 * Network analysis force graph.
 */
@customElement('dharpa-network-force')
export class NetworkForce extends LitElement {
  /** Width of the SVG element */
  @property({ type: Number }) width = 600
  /** Height of the SVG element */
  @property({ type: Number }) height = 400

  /**
   * Data to render. Map is re-rendered every time this property is modifed.
   * @see {NetworkForceData} for more information about data format.
   */
  @property({}) data: any = {}

  render() {
    return html`<svg></svg>`
  }

  updated() {
    const svg = d3.select(this.shadowRoot!.firstElementChild)
    const viewBox =
      this.data.chartParams.displayIsolatedNodes === 'no'
        ? [0, 0, this.width, this.height]
        : [-this.width / 2, -this.height / 2, this.width, this.height]
    svg.attr('viewBox', viewBox as any)

    const links = this.data.links.map((d: object | null) => Object.create(d))
    const nodes = this.data.nodes.map((d: object | null) => Object.create(d))

    const simulPrep = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())

    const simulation =
      this.data.chartParams.displayIsolatedNodes == 'no'
        ? simulPrep.force(
            'center',
            d3.forceCenter(this.width / 2, this.height / 2)
          )
        : simulPrep.force('x', d3.forceX()).force('y', d3.forceY())

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'graph-links')
      .attr('link-id', (d: any) => `${d.source.index}-${d.target.index}`)
      .attr('stroke-width', 0.5)

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'graph-node')
      .attr('opacity', 1)
      .attr('node-id', (d: any) => d.id)
      .attr(
        'r',
        (d: any) =>
          this.nodesScale(
            d[this.data.chartParams.nodesSize],
            this.data.chartParams.nodesSize
          ) || 5
      )
      .attr('fill', (d: any) => scale(d.group))
      .call(drag(simulation) as any)

    // node.on('click', function () {
    //   return nodeSelected(this.attributes['node-id'].value)
    // })

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
    })

    return svg.node()
  }

  nodesScale(value: d3.NumberValue, param: string | number) {
    const scale = d3
      .scaleLinear()
      .domain([
        d3.min(this.data.nodes, (d: any) => d[param]),
        d3.max(this.data.nodes, (d: any) => d[param])
      ] as any)
      .range([3, 20])
    return scale(value)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dharpa-network-force': NetworkForce
  }
}
