let zoom = 3;

let color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

let path = d3.geoPath();
let svg = d3.select(document.getElementById('map'));

queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "world_population.csv")
    .await(ready);

let question = 'Democratic Republic of the Congo';

function updateQuestion(text) {
    document.getElementById('question').innerText = question;
}


function ready(error, data, population) {

    let populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.population; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    // document.getElementById('zoom').addEventListener('click', () => {
    //     zoom = 3;
    //
    //     buildMap();
    // });

    updateQuestion('Chad');

    function buildMap() {
        let width = 960*zoom;
        let height = 620*zoom;
        let marginX = 0;//(window.innerWidth - width) / 2;
        let marginY = -120;//(window.innerHeight - height) / 2 - 135;

        let projection = d3.geoMercator()
            .scale(150*zoom)
            .translate( [width / 2, height / 2]);

        path = d3.geoPath().projection(projection);

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `${marginX} ${marginY} ${width} ${height}`)
            .append('g')
            .attr('class', 'map');
        svg.select("g").remove();

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
            .on('click',(d) => {
                console.log('Data: ', d);
            })
            .on('mouseover',function(d) {
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke","orange")
                    .style("stroke-width",0.3);
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .style("opacity", 0.8)
                    .style("stroke","white")
                    .style("stroke-width",0.3);
            });
    }

    buildMap();

}