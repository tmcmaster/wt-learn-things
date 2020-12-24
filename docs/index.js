let zoom = 3;

let color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

let path = d3.geoPath();
let svg = d3.select(document.getElementById('map'));

const COLOR_DEFAULT = "rgb(107,174,214)";
const COLOR_CORRECT = "green";
const COLOR_WRONG = "red";


queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "world_population.csv")
    .await(ready);

function ready(error, data, population) {

    let countries = data.features.sort(() => .5 - Math.random()).map((item) => item.properties.name);
    console.log('Countries: ', countries);

    let correctAnswers = 0;
    let wrongAnswers = 0;

    let question = -1;
    let requiredCountry = '';

    let populationById = {};
    const questionElement = document.getElementById('question');
    const remainingElement = document.getElementById('remaining');
    const scoreElement = document.getElementById('score');

    population.forEach(function(d) { populationById[d.id] = +d.population; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    updateQuestion();

    function updateScore() {
        const score = (question < 1 ? 0 : (correctAnswers / question)*100);
        const remaining = (question < 1 ? countries.length : countries.length - question);
        remainingElement.innerText = remaining.toFixed(0);
        scoreElement.innerText = score.toFixed(1);
    }

    function updateQuestion() {
        requiredCountry = countries[++question];
        questionElement.innerText = (requiredCountry === undefined ? '' : requiredCountry);
        questionElement.focus();
        updateScore();
    }

    function checkSelectedCountry(selectedCountry) {
        if ((question + 1) >= countries.length) return;

        if (selectedCountry === requiredCountry) {
            const correctCountry = d3.select(document.getElementById('country-' + requiredCountry));
            correctCountry.style('fill', COLOR_CORRECT);
            correctAnswers++;
            updateQuestion();
            setTimeout(() => {
                correctCountry.style('fill', COLOR_DEFAULT);
            }, 1000);
        } else {
            const correctCountry = d3.select(document.getElementById('country-' + requiredCountry));
            const wrongCountry = d3.select(document.getElementById('country-' + selectedCountry));
            document.getElementById('wrongAnswer').innerText = selectedCountry;
            correctCountry.style('fill', COLOR_CORRECT);
            wrongCountry.style('fill', COLOR_WRONG);
            wrongAnswers++;
            setTimeout(() => {
                correctCountry.style('fill', COLOR_DEFAULT);
                wrongCountry.style('fill', COLOR_DEFAULT);
                document.getElementById('wrongAnswer').innerText = '';
                updateQuestion();
            }, 3000);
        }

    }
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
            .attr('id', function(d) {return 'country-' + d.properties.name})
            .style("fill", function(d) { return "rgb(107,174,214)"; })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity",0.8)
            // tooltips
            .style("stroke","white")
            .style('stroke-width', 0.3)
            .on('click',(d) => {
                console.log('Data: ', d);
                let selectedCountry = d.properties.name;
                checkSelectedCountry(selectedCountry);
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