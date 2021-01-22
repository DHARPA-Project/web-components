import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'

interface ChordData extends Array<Array<number>> {
  names?: string[]
  colors?: string[]
}

/**
 * Chord diagram.
 */
@customElement('dharpa-chord-diagram')
export class ChordDiagram extends LitElement {
  /** Width of the SVG element */
  @property({ type: Number }) width = 0
  /** Height of the SVG element */
  @property({ type: Number }) height = 0

  /**
   * Data to render. Diagram is re-rendered every time this property is modifed.
   * @see {ChordData} for more information about data format.
   */
  @property({ attribute: false }) data: ChordData = []

  render() {
    return html`
      <svg>
        <g class="groups"></g>
        <g class="chords"></g>
      </svg>
    `
  }

  updated() {
    const svg = d3.select(this.shadowRoot!.firstElementChild)

    svg.attr(
      'viewBox',
      [-this.width / 2, -this.height / 2, this.width, this.height].join(' ')
    )

    const chords = this.getChord(this.data)

    const colorScale = this.colorScale

    const group = svg
      .select('g.groups')
      .selectAll('g.group')
      .data(chords.groups)
      .join('g')
      .attr('class', 'group')

    // chord
    group
      .selectAll('path')
      .data((d) => [d])
      .join('path')
      .attr('fill', (d) => colorScale(this.data?.names?.[d.index] ?? ''))
      .attr('d', this.arc)

    // title
    group
      .selectAll('title')
      .data((d, index) => [[this.data?.names?.[index] ?? '', d.value]])
      .join('title')
      .text(([label, value]) => `${label} ${value}`)

    const ticksFn = this.getTicksFn()

    const groupTicks = group
      .selectAll('g.ticks')
      .data((d) => [d])
      .join('g')
      .attr('class', 'ticks')

    const groupTick = groupTicks
      .selectAll('g.tick')
      .data((d) => ticksFn(d).map((data) => ({ data, groupIndex: d.index })))
      .join('g')
      .attr('class', 'tick')
      .attr(
        'transform',
        (d) =>
          `rotate(${(d.data.angle * 180) / Math.PI - 90}) translate(${
            this.outerRadius
          },0)`
      )

    groupTick
      .selectAll('line')
      .data(() => [null])
      .join('line')
      .attr('stroke', 'currentColor')
      .attr('x2', 6)

    groupTick
      .selectAll('text')
      .data((d) => [d])
      .join('text')
      .attr('x', 8)
      .attr('dy', '0.35em')
      .attr('transform', (d) =>
        d.data.angle > Math.PI ? 'rotate(180) translate(-16)' : null
      )
      .attr('text-anchor', (d) => (d.data.angle > Math.PI ? 'end' : null))
      .attr('font-weight', (d) => (d.data.value === 0 ? 'bold' : ''))
      .text((d) => {
        if (d.data.value === 0) {
          return d.data.angle > Math.PI
            ? `↑ ${this.data?.names?.[d.groupIndex]}`
            : `${this.data?.names?.[d.groupIndex]} ↓`
        } else {
          return d.data.value
        }
      })

    svg
      .select('g.chords')
      .selectAll('path.chord')
      .data(chords)
      .join('path')
      .attr('class', 'chord')
      .style('mix-blend-mode', 'multiply')
      .attr('fill', (d) => colorScale(this.data?.names?.[d.source.index] ?? ''))
      .attr('d', this.ribbon)
      .append('title')
      .text(
        (d) =>
          `${d.source.value} ${this.data?.names?.[d.target.index]} → ${
            this.data?.names?.[d.source.index]
          }${
            d.source.index === d.target.index
              ? ''
              : `\n${d.target.value} ${this.data?.names?.[d.source.index]} → ${
                  this.data?.names?.[d.target.index]
                }`
          }`
      )
  }

  protected getChord(matrix: number[][]) {
    return d3
      .chord()
      .padAngle(10 / this.innerRadius)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)(matrix)
  }

  protected getTicksFn() {
    const tickStep = d3.tickStep(0, d3.sum(this.data.flat()), 100)

    return ({ startAngle, endAngle, value }: d3.ChordGroup) => {
      const k = (endAngle - startAngle) / value
      return d3.range(0, value, tickStep).map((value) => {
        return { value, angle: value * k + startAngle }
      })
    }
  }

  protected get colorScale() {
    return d3.scaleOrdinal(this.data?.names ?? [], this.colors)
  }

  protected get outerRadius() {
    return Math.min(this.width, this.height) * 0.5 - 60
  }

  protected get innerRadius() {
    return this.outerRadius - 10
  }

  protected get colors() {
    return this.data.colors === undefined
      ? d3.quantize(d3.interpolateYlGnBu, this.data.names?.length ?? 0)
      : this.data.colors
  }

  protected get arc() {
    return d3
      .arc<d3.ChordGroup>()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
  }

  protected get ribbon() {
    return d3
      .ribbon<unknown, d3.Chord>()
      .radius(this.innerRadius - 1)
      .padAngle(1 / this.innerRadius)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dharpa-chord-diagram': ChordDiagram
  }
}
