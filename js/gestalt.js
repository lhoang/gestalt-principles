class Gestalt {
    constructor({width, height}) {
        this.width = width;
        this.height = height;
        this.radius = Math.floor(Math.min(width, height) * .05);
        this.interval = Math.floor(Math.min(width, height) * .15);
        this.offsetX = Math.floor(this.interval);
        this.offsetY = Math.floor(this.interval);
        this.data = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ];

        this.drawGraph();
    }


    /**
     * Création du SVG.
     */
    drawGraph() {
        const svg = d3.select('#graph')
            .append('svg')
            .attr('height', this.height)
            .attr('width', this.width);

        svg.append('g').classed('circles', true);

    }

    /**
     * Initialisation.
     */
    init() {
        // Join
        const circles = d3.select(".circles")
            .selectAll(".circle")
            .data(this.data);
        const t = d3.transition().duration(2000);

        // Update
        circles.transition(t)
            .attr('r', this.radius)
            .attr('cx', (d, i) => this.offsetX + (i % 4) * this.interval)
            .attr('cy', (d, i) => this.offsetY + Math.floor(i / 4) * this.interval)
            .attr('fill', 'rgb(31, 119, 180)')
            .attr('class', "circle");

        // Enter
        circles.enter()
            .append('circle')
            .attr('r', 0)
            .attr('cx', (d, i) => this.offsetX + (i % 4) * this.interval)
            .attr('cy', (d, i) => this.offsetY + Math.floor(i / 4) * this.interval)
            .attr('class', "circle")
            .attr('fill', 'rgb(31, 119, 180)')
            .transition(t)
            .attr('r', this.radius);
    }

    /**
     * Proximity.
     */
    proximity() {
        const newInterval = this.interval * 0.8;
        const divide = this.interval;
        const t = d3.transition().duration(2000);

        const circles = d3.select(".circles")
            .selectAll(".circle")
            .transition(t)
            .attr('cx', (d, i) => {
                let modulo = (i % 4);
                let result = this.offsetX + modulo * newInterval;
                if (modulo > 1) {
                    result += divide;
                }
                return result;
            })
            .attr('cy', (d, i) => {
                let result =  this.offsetY + Math.floor(i / 4) * newInterval;
                if (i > 7) {
                    result += divide;
                }
                return result;

            })
            .attr('class', "circle");
    }

    similarity() {
        this.init();
        const t = d3.transition().duration(2000);

        const circles = d3.select(".circles")
            .selectAll(".circle")
            .transition(t).delay(2000)
            .attr('fill', (d, i) => (i > 7) ? 'red' : 'rgb(31, 119, 180)');
    }




    display(index) {
        console.log(`Display #${index}`);
    }
}