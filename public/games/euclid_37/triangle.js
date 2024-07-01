const sin = Math.sin;
const cos = Math.cos;
const PI = Math.PI;

function vector_add(a, b) {
    return { 
        x: a.x + b.x,
        y: a.y + b.y
    }
}

function vector_mul(a, c) {
    return { 
        x: a.x * c,
        y: a.y * c
    }
}

function vector_length(a) {
    return a.x**2 + a.y**2;
}

function vector_unit(a) {
    return vector_mul(a, 1/vector_length(a));
}

function vector_polar(theta, length) {
    return {
        x: length * cos(theta),
        y: length * sin(theta)
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");


    const radius = 10; 
    const triangleEdgeLength = 20;
    const triangleHeight = Math.sqrt(3) / 2;


    // equalateral triangle
    const center = { x: width / 2, y: height / 2 };
    const circlesData = [
        vector_add(center, vector_polar(PI/2, width/4)),
        vector_add(center, vector_polar(PI/2 + 2*PI/3, width/4)),
        vector_add(center, vector_polar(PI/2 + 4*PI/3, width/4))
    ];

    function syncLines() {
        const edgeData = circlesData.map((d, i, arr) => ({ a: d, b: arr[(i + 1) % arr.length] }));

        lines.data(edgeData)
            .attr("x1", edge => edge.a.x)
            .attr("y1", edge => edge.a.y)
            .attr("x2", edge => edge.b.x)
            .attr("y2", edge => edge.b.y);
    }


    let tempLine = svg.append("line")
        .attr("class", "temp")
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5")
        .style("visibility", "hidden"); // Initially hidden

    const dragHandler = d3.drag()
        .on("start", function(event, p) {
            d3.select(this).raise().attr("stroke", "black");

            const otherPoints = circlesData.filter(p2 => p2 !== p);
            const angle = Math.atan2(otherPoints[1].y - otherPoints[0].y, otherPoints[1].x - otherPoints[0].x);
            tempLine
                .attr("x1", p.x - (width+height) * 2 * Math.cos(angle))
                .attr("y1", p.y - (width+height) * 2 * Math.sin(angle))
                .attr("x2", p.x + (width+height) * 2 * Math.cos(angle))
                .attr("y2", p.y + (width+height) * 2 * Math.sin(angle))
                .style("visibility", "visible");
        })
        .on("drag", function(event, p) {
            // constrain the cursor to the visible window
            const cursor = { x: event.x, y: event.y }

            // calculate the closest point on the line to the cursor
            const x1 = +tempLine.attr("x1");
            const y1 = +tempLine.attr("y1");
            const x2 = +tempLine.attr("x2");
            const y2 = +tempLine.attr("y2");
            const lineLengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
            const t = ((cursor.x - x1) * (x2 - x1) + (cursor.y - y1) * (y2 - y1)) / lineLengthSquared;
            const closest = { 
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };

            // Cancel the drag if the point is out of bounds
            if (closest.x < 0 || closest.x > width || closest.y < 0 || closest.y > height) {
                return; // Simply return without updating anything
            }

            p.x = closest.x;
            p.y = closest.y;


            d3.select(this)
                .attr("cx", p.x)
                .attr("cy", p.y);
            syncLines();
        })
        .on("end", function() {
            d3.select(this).attr("stroke", null);
            tempLine.style("visibility", "hidden");
        });


    // Add connecting lines
    const edgeData = circlesData.map((d, i, arr) => ({ a: d, b: arr[(i + 1) % arr.length] }));
    const lines = svg.selectAll("line.edge")
        .data(edgeData)
        .enter()
        .append("line")
        .attr("class", "edge")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    syncLines();

    // Add circles to the SVG
    svg.selectAll("circle")
        .data(circlesData)
        .enter()
        .append("circle")
        .attr("cx", function(p) { return p.x; })
        .attr("cy", function(p) { return p.y; })
        .attr("r", radius)
        .attr("fill", "steelblue")
        .call(dragHandler);

});
