let data = null;
let tooltipTimer = null;
let colorIndex = -1;
let currentLegendRow = -1;
const height = 570;
const totalHeight = 800;
const width = 1200;
const padding = 60;
const topPadding = 80;
const color = [
  "#EF5350",
  "#EC407A",
  "#AB47BC",
  "#7E57C2",
  "#5C6BC0",
  "#42A5F5",
  "#29B6F6",
  "#66BB6A",
  "#9CCC65",
  "#D4E157",
  "#00E676",
  "#FFEE58",
  "#FFCA28",
  "#FFA726",
  "#FF7043",
  "#8D6E63",
  "#BDBDBD",
  "#455A64"
];
const categoryWiseColor = {};

document.addEventListener("DOMContentLoaded", function() {
  getJsonData();
});

function getJsonData() {
  const url =
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";
  const req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.send();
  req.onload = function() {
    data = JSON.parse(req.responseText);
    createTreeMap();
    console.log(data.name)

  };
}

    const url = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";
    fetch(url)
    .then(response => {response.json()})
    .then(data => { 
        console.log(data)
    })

function createTreeMap() {
  const svg = d3
    .select("body")
    .append("svg")
    .attr("id", "treeMap")
    .attr("height", totalHeight)
    .attr("width", width);

  const title = svg
    .append("text")
    .attr("id", "title")
    .attr("x", 400)
    .attr("y", 30)
    .text(d => data.name);

 const name = svg
    .append("text")
    .attr("id", "title")
    .text(d => data.children[0].children[0].name);
 
  const description = svg
    .append("text")
    .attr("id", "description")
    .attr("x", 400)
    .attr("y", 60)
    .text("Top 100 Most Sold Video Games Grouped by Platform");

  const root = d3.hierarchy(data);
  root.sum(d => d.value).sort(function(a, b) {
    return b.height - a.height || b.value - a.value;
  });

  // treemap sizes 
  const treeMap = d3.treemap();
  treeMap.size([width, height - topPadding]).paddingInner(1);
  treeMap(root);
  ems
  // size of the it
  const leaves = root.leaves();
  const categoryColor = function(category) {
    if (
      categoryWiseColor[category] !== null &&
      categoryWiseColor[category] !== undefined
    ) {
      return categoryWiseColor[category];
    } else {
      colorIndex++;
      categoryWiseColor[category] = color[colorIndex];
      return categoryWiseColor[category];
    }
  };

  const minX0 = d3.min(leaves, d => d.x0);
  const minX1 = d3.min(leaves, d => d.x1);
  const minY0 = d3.min(leaves, d => d.y0);
  const minY1 = d3.min(leaves, d => d.y1);
  const minX = d3.min([minX0, minX1]);
  const minY = d3.min([minY0, minY1]);

  const maxX0 = d3.max(leaves, d => d.x0);
  const maxX1 = d3.max(leaves, d => d.x1);
  const maxY0 = d3.max(leaves, d => d.y0);
  const maxY1 = d3.max(leaves, d => d.y1);
  const maxX = d3.max([maxX0, maxX1]);
  const maxY = d3.max([maxY0, maxY1]);

  // xscale 
  const xScale = d3
    .scaleLinear()
    .domain([minX, maxX])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([minY, maxY])
    .range([topPadding, height]);
  
  // the rect item in 
  const rect = svg
    .selectAll("rect")
    .data(leaves)
    .enter()
    .append("rect")
    .attr("class", "tile")
    .attr("fill", d => categoryColor(d.data.category))
    .attr("x", d => xScale(d.x0))
    .attr("y", d => yScale(d.y0))
    .attr("width", d => xScale(d.x1) - xScale(d.x0))
    .attr("height", d => yScale(d.y1) - yScale(d.y0))
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.value)

    //append text to the rect's
  const te = rect.append("text")
                  .text("hello")

  // legend class at the bottom of the page  
  const legend = svg.append("g").attr("id", "legend");

  // legend items 
  const legendItems = legend.selectAll("rect")
    .data(Object.keys(categoryWiseColor))
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("fill", d => categoryWiseColor[d])
    .attr("x", (d, i) => xPositionLegend(padding, i))
    .attr("y", (d, i) => yPositionLegend(height + padding / 2, i))
    .attr("height", 20)
    .attr("width", 20);

  currentLegendRow = -1;

  const legendLabels = legend
    .selectAll("text")
    .data(Object.keys(categoryWiseColor))
    .enter()
    .append("text")
    .attr("class", "legend-labels")
    .attr("x", (d, i) => xPositionLegend(padding + 25, i))
    .attr("y", (d, i) => yPositionLegend(height + padding / 2 + 15, i))
    .text(d => d);

  const tileElements = document.getElementsByClassName("tile");
  for (const eachTile of tileElements) {
    eachTile.onmouseover = function(event) {
      showToolTip(event);
    };
    eachTile.onmouseout = function(event) {
      hideToolTip(event);
    };
  }
}

// x axis position of the legends
function xPositionLegend(offset, index) {
  if (index % 3 === 0) {
    return offset;
  } else if (index % 3 === 1) {
    return offset + 200;
  } else {
    return offset + 200 + 200;
  }
}

//y position of the legends
function yPositionLegend(offset, index) {
  if (index % 3 === 0) {
    currentLegendRow++;
  }
  return offset + 30 * currentLegendRow;
}

//show tooltip on hover 
function showToolTip(event) {
  if (tooltipTimer !== null) {
    window.clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  // tooltip timer 
  tooltipTimer = window.setTimeout(() => {
    const x = event.pageX + 50;
    const y = event.pageY + 50;
    const cell = event.target;
    const name = cell.getAttribute("data-name");
    const category = cell.getAttribute("data-category");
    const value = cell.getAttribute("data-value");
    const tooltip = document.getElementById("tooltip");
    document.getElementById("name").innerHTML = name;
    document.getElementById("category").innerHTML = category;
    document.getElementById("value").innerHTML = value;
    tooltip.setAttribute("data-value", value);
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.style.visibility = "visible";
  }, 10);
}

function hideToolTip(event) {
  if (tooltipTimer !== null) {
    window.clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  tooltipTimer = window.setTimeout(() => {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.visibility = "hidden";
  }, 10);
}
