class Gestalt {
    constructor({width, height}) {
        this.width = width;
        this.height = height;
        this.radius = Math.floor(Math.min(width, height) * .05);
        this.interval = Math.floor(Math.min(width, height) * .15);
        this.offsetX = Math.floor(this.interval);
        this.offsetY = Math.floor(this.interval);
        this.data = [
            {id: 'c0'}, {id: 'c1'}, {id: 'c2'}, {id: 'c3'},
            {id: 'c4'}, {id: 'c5'}, {id: 'c6'}, {id: 'c7'},
            {id: 'c8'}, {id: 'c9'}, {id: 'c10'}, {id: 'c11'},
            {id: 'c12'}, {id: 'c13'}, {id: 'c14'}, {id: 'c15'},
        ];
        // TODO
        this.bigRadius = Math.floor(Math.min(width, height) * .3);

        this.simulation = null;

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
        d3.select('#container2 .graph svg')
            .append('g').classed('lines', true);
        this.closureShapes();
    }

    /**
     * Initialisation.
     */
    init() {
        // nettoyage
        d3.selectAll('#container1 .link').remove();

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
     * Connectivity.
     */
    connectivity() {
        const svg = d3.select('#container1 svg');

        this.simulation = d3.forceSimulation()
            .nodes(this.data)
            .stop();

        const circles = d3.selectAll('#container1 .circle');
        // Position initiale fixée
        circles.each((d, i, nodes) => {
            const circle = d3.select(nodes[i]);
            this.data[i].fx = +circle.attr('cx');
            this.data[i].fy = +circle.attr('cy');
        });

        // création des liens au hasard
        let ids = [...Array(this.data.length).keys()];
        const nbGroups = 3;

        const parents = [];
        for (let i = 0; i < nbGroups; i++) {
            const idx = Math.floor(Math.random() * (ids.length));
            const selected = ids.splice(idx, 1);
            parents.push(selected);
            const children = [];
            for (let j = 0; j < Math.ceil(Math.random() * 4) + 1; j++) {
                const idx = Math.floor(Math.random() * (ids.length));
                const selectedChild = ids.splice(idx, 1);
                children.push(...selectedChild);
            }
            parents[i].push(...children);
        }
        const linksData = parents
            .filter(each => each.length > 0)
            .map(group => {
                const parent = group.shift();
                return group.map(g => {
                    return {'source': parent, 'target': g};
                });
            }).reduce((a, val) => a.concat(val), []);


        // Ajout des forces
        const sim = this.simulation
            .force('links', d3.forceLink()
                .distance(this.radius * 2)
                .strength(1),
            )
            .force('collide', d3.forceCollide(d => d.r * 4))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('y', d3.forceY(0))
            .force('x', d3.forceX(0))
        ;

        circles.transition().duration(1000)
            .attr('fill', 'rgb(31, 119, 180)');
        circles.call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));


        // Comportement Drag
        function dragstarted(d) {
            // annulation de la position fixe
            sim.nodes().forEach(node => {
                node.fx = null;
                node.fy = null;
            });
            if (!d3.event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            d.x = d.fx;
            d.y = d.fy;
        }

        function dragended(d) {
            if (!d3.event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }


        const links = svg.selectAll('.link')
            .data(linksData)
            .enter().append('line')
            .attr('class', 'link');

        const ticked = () => {
            circles.attr('cx', d => d.x)
                .attr('cy', d => d.y);

            links.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        };

        this.simulation.on('tick', ticked)
            .restart();

        this.simulation
            .force('links')
            .links(linksData);

    }


    /**
     * Initialisation des formes pour la partie 2.
     */
    closureShapes() {
        const x0 = Math.floor(this.width / 2);
        const y0 = Math.floor(this.height / 2);
        const c = 80;
        const square =
            `M ${x0 - c}, ${y0 - c / 2}
             v ${-c / 2}
             h ${c * 2}         
             v ${c * 2}         
             h ${-c * 2} 
             Z       
        `;

        const triangle =
            `M ${x0 + c / 2}, ${y0 - c * 2}
             L ${x0 + c * 7 / 4}, ${y0}
             h ${-c * 2.5}
             Z
            `;

        const shapes = d3.select('#container2 .graph .shapes');
        shapes.append('path')
            .attr('id', 'closure-triangle')
            .attr('stroke', 'black')
            .attr('fill', 'red')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '')
            .attr('d', triangle);

        shapes.append('circle')
            .attr('id', 'closure-circle')
            .attr('cx', x0 - c)
            .attr('cy', y0 - c)
            .attr('r', c)
            .attr('stroke', 'black')
            .attr('fill', 'yellow')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '');


        shapes.append('path')
            .attr('id', 'closure-square')
            .attr('stroke', 'black')
            .attr('fill', 'green')
            .attr('stroke-width', 4)
            .attr('fill-opacity', 1)
            .attr('stroke-dasharray', '')
            .attr('d', square);


        const line1a = `M ${x0 - c * 2} ${y0 + c * 2}
             Q ${x0 - c * 3 / 2 } ${y0 - c * 3 / 2} 
             ${x0} ${y0}
            `;

        const line1b = `M ${x0} ${y0}
             Q ${x0 + c * 3 / 2 } ${y0 + c * 3 / 2} 
             ${x0 + c * 2} ${y0 - c * 2}
            `;

        const line2a = `M ${x0 - c * 2} ${y0 + c * 3 / 2}
             L ${x0} ${y0}
            `;

        const line2b = `M ${x0} ${y0}
             L ${x0 + c * 2} ${y0 - c * 3 / 2}
            `;

        const lines = d3.select('#container2 .graph .lines');
        lines.attr('opacity', '0');

        lines.append('path')
            .attr('id', 'line1a')
            .classed('line1', true)
            .attr('stroke', 'black')
            .attr('stroke-width', 4)
            .attr('fill', 'transparent')
            .attr('d', line1a);
        lines.append('path')
            .attr('id', 'line1a')
            .classed('line1', true)
            .attr('stroke', 'red')
            .attr('stroke-width', 4)
            .attr('fill', 'transparent')
            .attr('d', line1b);
        lines.append('path')
            .attr('id', 'line1a')
            .classed('line2', true)
            .attr('stroke', 'black')
            .attr('stroke-width', 4)
            .attr('fill', 'transparent')
            .attr('d', line2a);
        lines.append('path')
            .attr('id', 'line1a')
            .classed('line2', true)
            .attr('stroke', 'red')
            .attr('stroke-width', 4)
            .attr('fill', 'transparent')
            .attr('d', line2b);


        // comportement pour line1 et line2
        function hoverLine(line) {
            lines.selectAll(line)
                .on('mouseover', () =>
                    d3.selectAll(line).classed('line-hover', true),
                )
                .on('mouseout', () =>
                    d3.selectAll(line).classed('line-hover', false),
                );
        }

        hoverLine('.line1');
        hoverLine('.line2');
    }

    /**
     * Closure part 1.
     */
    closure1() {
        const t1 = d3.transition().duration(3000);
        const t2 = d3.transition().duration(2000);
        const lines = d3.select('#container2 .graph .lines');
        lines.attr('opacity', '0');

        const shapes = d3.select('#container2 .graph .shapes');
        shapes.attr('opacity', '1');
        shapes.select('#closure-triangle')
            .transition(t1)
            .attr('fill-opacity', 1)
            .attr('transform', 'translate(0, 0)')
            .transition(t2)
            .attr('stroke-dasharray', '')
        ;

        shapes.select('#closure-circle')
            .transition(t1)
            .attr('fill-opacity', 1)
            .attr('transform', 'translate(0, 0)')
            .transition(t2)
            .attr('stroke-dasharray', '');

        shapes.select('#closure-square')
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
        const t0 = d3.transition().duration(1000);
        const t1 = d3.transition().duration(3000);
        const t2 = d3.transition().duration(2000);

        const lines = d3.select('#container2 .graph .lines');
        lines.transition(t0)
            .attr('opacity', '0');

        const shapes = d3.select('#container2 .graph .shapes');
        shapes.transition(t0)
            .attr('opacity', '1');
        shapes.select('#closure-triangle')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(50, -50)')
            .transition(t2)
            .attr('stroke-dasharray', '40 100 100 100 100 100');

        shapes.select('#closure-circle')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(-50, -50)')
            .transition(t2)
            .attr('stroke-dasharray', c);

        shapes.select('#closure-square')
            .transition(t1)
            .attr('fill-opacity', 0)
            .attr('transform', 'translate(0, 50)')
            .transition(t2)
            .attr('stroke-dasharray', c);

    }

    /**
     * Continuity.
     */
    continuity() {
        const t0 = d3.transition().duration(1000);

        const shapes = d3.select('#container2 .graph .shapes');
        shapes.transition(t0)
            .attr('opacity', '0');

        const lines = d3.select('#container2 .graph .lines');
        lines.transition(t0)
            .attr('opacity', 1);
    }


    display(index) {
        console.log(`Display #${index}`);
    }
}