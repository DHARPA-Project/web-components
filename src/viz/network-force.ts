import { LitElement, customElement, html, property } from 'lit-element'
import * as d3 from 'd3'
import { Runtime, Inspector } from '@observablehq/runtime'
import notebook from "22e391431987b712"
import { drag } from 'd3'

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
        return html`
      <div></div>`
    }

    updated() {

        const div = this.shadowRoot!.firstElementChild

        const main = new Runtime().module(notebook, name => {
            console.log(name)
            if (name === "chart") {
                return new Inspector.into(div)()
            }
        })

        const newData = {
            nodes: this.data.nodes,
            links: this.data.links
        }

        main.redefine("data", newData)
        main.redefine("chartParams", this.data.chartParams)


    }
}

declare global {
    interface HTMLElementTagNameMap {
        'dharpa-network-force': NetworkForce
    }
}
