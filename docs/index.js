let width = 960*3;
let height = 620*3;
let marginX = 0;//(window.innerWidth - width) / 2;
let marginY = -120;//(window.innerHeight - height) / 2 - 135;

let color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

let path = d3.geoPath();

let svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `${marginX} ${marginY} ${width} ${height}`)
    .append('g')
    .attr('class', 'map');

const resizeMap = () => {
    width = (window.innerWidth - 4);
    height = (window.innerHeight - 8);
    console.log('Zoom: ' + window.visualViewport.scale);
    d3.select("svg")
        .attr("width", width)
        .attr("height", height);
};


//resizeMap();

let projection = d3.geoMercator()
    .scale(450)
    .translate( [width / 2, height / 2]);

path = d3.geoPath().projection(projection);


//window.addEventListener('resize', resizeMap);

queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "world_population.csv")
    .await(ready);

let question = 'Democratic Republic of the Congo';
let questionPoints = [
    {x:220, y: 0},
    {x:220, y: 600},
    {x:500, y: 900},
    {x:600, y: 1200},

]

function ready(error, data, population) {

    let populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.population; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    svg.append("g")
        .attr("class", "question")
        .selectAll("text")
        .data(questionPoints)
        .enter().append("text")
        .attr("x", (d) => { return d.x; })
        .attr("y", (d) => { return d.y; })
        .attr("font-size", "16")
        .attr('stroke', "lightgrey")
        .text(question);

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
}