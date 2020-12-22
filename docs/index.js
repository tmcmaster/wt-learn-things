let format = d3.format(",");

// Set tooltips
// let tip = d3.tip()
//     .attr('class', 'd3-tip')
//     .offset([-10, 0])
//     .html(function(d) {
//         return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) +"</span>";
//     })

// const width = window.innerWidth - 16;
// const weight = window.innerHeight - 16;

let margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;

let color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

let path = d3.geoPath();

let svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 -120 ${width} ${height}`)
    .append('g')
    .attr('class', 'map');

const resizeMap = () => {
    const newWidth = window.innerWidth - 16;
    const newHeight = window.innerHeight - 16;
    d3.select("svg")
        .attr("width", newWidth)
        .attr("height", newHeight);
};


resizeMap();

let projection = d3.geoMercator()
    .scale(150)
    .translate( [width / 2, height / 2]);

path = d3.geoPath().projection(projection);

window.addEventListener('resize', resizeMap);
//svg.call(tip);

queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.tsv, "world_population.tsv")
    .await(ready);

function ready(error, data, population) {

    // let question = document.getElementById('question');
    // const onMouseMove = (e) =>{
    //     question.style.left = (e.pageX + 30) + 'px';
    //     question.style.top = (e.pageY - 30) + 'px';
    // }
    // document.addEventListener('mousemove', onMouseMove);

    let populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.population; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color(populationById[d.id]); })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('click',function(d){
            console.log('Data: ', d);
        })
        .on('mouseover',function(d){
            //tip.show(d);

            d3.select(this)
                .style("opacity", 1)
                .style("stroke","orange")
                .style("stroke-width",0.3);
        })
        .on('mouseout', function(d){
            //tip.hide(d);

            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke","white")
                .style("stroke-width",0.3);
        });

    svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);

    d3.select("body").on("zoom", () => {
        alert('ZOOM!!!');
        console.log("zoom event");
    });
}