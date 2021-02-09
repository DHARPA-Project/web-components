import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'

// interface Feature {
//   type: string
// }

// interface MapData {
//   features: Feature[]
// }

type MapData = unknown

@customElement('dharpa-map')
export class Map extends LitElement {
  /** Width of the SVG element */
  @property({ type: Number }) width = 600
  /** Height of the SVG element */
  @property({ type: Number }) height = 300

  /** Map data */
  @property({ attribute: false }) data: MapData = { features: [] }

  render() {
    return html`
      <svg>
        <g></g>
      </svg>
    `
  }

  updated() {
    const svg = d3.select(this.shadowRoot!.firstElementChild)
    console.log(this.data)

    svg.attr(
      'viewBox',
      [-this.width / 2, -this.height / 2, this.width, this.height].join(' ')
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dharpa-map': Map
  }
}
