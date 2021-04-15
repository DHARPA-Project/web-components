import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'


/**
 * Network analysis force graph.
 */
@customElement('network-force')
export class NetworkForce extends LitElement {
    /** Width of the SVG element */
    @property({ type: Number }) width = 600
    /** Height of the SVG element */
    @property({ type: Number }) height = 400

    /**
     * Data to render. Map is re-rendered every time this property is modifed.
     * @see {NetworkForceData} for more information about data format.
     */
    @property({ type: Array }) data = []

    render() {
        return html`
      <svg width = '600' height = '400'><g></g></svg>`
    }

    updated() {

        //const NetworkForceData = this.data

        const svg = d3.select(this.shadowRoot!.firstElementChild)


        svg.attr('width', this.width)
            .attr('height', this.height)



    }
}

declare global {
    interface HTMLElementTagNameMap {
        'dharpa-network-force': NetworkForce
    }
}
