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
        // TODO
        this.bigRadius = Math.floor(Math.min(width, height) * .3);

        this.initGraphs();
    }


    /**
     * Création des SVG.
     */
    initGraphs() {
        function createSvg(container, classname) {
            d3.select(container + ' .graph')
                .append('svg')
                .attr('height', this.height)
                .attr('width', this.width)
                .append('g')
                .classed(classname, true);
        }

        createSvg.call(this, '#container1', 'circles');
        createSvg.call(this, '#container2', 'shapes');
        this.closureShapes();
    }

    /**
     * Initialisation.
     */
    init() {
        // Join
        const circles = d3.select('#container1 .circles')
            .selectAll('.circle')
            .data(this.data);
        const t = d3.transition().duration(2000);

        // Update
        circles.transition(t)
            .attr('r', this.radius)
            .attr('cx', (d, i) => this.offsetX + (i % 4) * this.interval)
            .attr('cy', (d, i) => this.offsetY + Math.floor(i / 4) * this.interval)
            .attr('fill', 'rgb(31, 119, 180)')
            .attr('class', 'circle');

        // Enter
        circles.enter()
            .append('circle')
            .attr('r', 0)
            .attr('cx', (d, i) => this.offsetX + (i % 4) * this.interval)
            .attr('cy', (d, i) => this.offsetY + Math.floor(i / 4) * this.interval)
            .attr('class', 'circle')
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

        const circles = d3.select('#container1 .circles')
            .selectAll('.circle')
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
                let result = this.offsetY + Math.floor(i / 4) * newInterval;
                if (i > 7) {
                    result += divide;
                }
                return result;

            })
            .attr('class', 'circle');
    }

    /**
     * Similarity.
     */
    similarity() {
        this.init();
        const t = d3.transition().duration(1000);

        const circles = d3.select('#container1 .circles')
            .selectAll('.circle')
            .transition(t).delay(2000)
            .attr('fill', (d, i) => (i > 7) ? 'red' : 'rgb(31, 119, 180)');

        // TODO : remplacer les circle par des rect ?
    }


    /**
     * Initialisation des formes pour la partie 2.
     */
    closureShapes() {
        const x0 = Math.floor(this.width/2);
        const y0 = Math.floor(this.height/2);
        const c = 80;
        const square =
            `M ${x0 - c}, ${y0 - c/2}
             v ${-c /2}
             h ${c * 2}         
             v ${c * 2}         
             h ${-c * 2} 
             Z       
        `;

        const triangle =
            `M ${x0 + c/2}, ${y0 - c * 2}
             L ${x0 + c * 7/4}, ${y0}
             h ${-c * 2.5}
             Z
            `;

        const svg = d3.select('#container2 .graph .shapes');
        svg.append('path')
            .attr('id', 'closure-triangle')
            .attr('stroke','black')
            .attr('fill','red')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '')
            .attr('d', triangle);

        svg.append('circle')
            .attr('id', 'closure-circle')
            .attr('cx', x0 - c)
            .attr('cy', y0 - c)
            .attr('r', c)
            .attr('stroke','black')
            .attr('fill','yellow')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '');


        svg.append('path')
            .attr('id', 'closure-square')
            .attr('stroke','black')
            .attr('fill','green')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '')
            .attr('d', square);

    }

    /**
     * Closure part 1.
     */
    closure1() {
        const c = 80;
        const t1 = d3.transition().duration(3000);
        const t2 = d3.transition().duration(2000);

        const svg = d3.select('#container2 .graph .shapes');
        svg.select('#closure-triangle')
            .transition(t1)
            .attr('fill-opacity', 1)
            .attr('transform', 'translate(0, 0)')
            .transition(t2)
            .attr('stroke-dasharray', '')
            ;

        svg.select('#closure-circle')
            .transition(t1)
            .attr('fill-opacity', 1)
            .attr('transform', 'translate(0, 0)')
            .transition(t2)
            .attr('stroke-dasharray', '');

        svg.select('#closure-square')
            .transition(t1)
            .attr('fill-opacity', 1)
            .attr('transform', 'translate(0, 0)')
            .transition(t2)
            .attr('stroke-dasharray', '');

    }

    /**
     * Closure part 2.
     */
    closure2() {
        const c = 80;
        const t1 = d3.transition().duration(3000);
        const t2 = d3.transition().duration(2000);

        const svg = d3.select('#container2 .graph .shapes');
        svg.select('#closure-triangle')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(50, -50)')
            .transition(t2)
            .attr('stroke-dasharray', '40 100 100 100 100 100');

        svg.select('#closure-circle')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(-50, -50)')
            .transition(t2)
            .attr('stroke-dasharray', c);

        svg.select('#closure-square')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(0, 50)')
            .transition(t2)
            .attr('stroke-dasharray', c);

    }


    display(index) {
        console.log(`Display #${index}`);
    }
}