import css from "./css/app.scss";
import * as d3 from 'd3';
import * as dc from 'dc'; 
import crossfilter from 'crossfilter';

const settings = {
    minmarkheight: 5
};
const body    = d3.select('body')
const linkid  = body.attr('linkid');
const sidebar = body.append('div').attr('class', 'sidebar')
const svg            = sidebar.append('svg').attr('class','canvas-map');

// sidebar
const canvas         = sidebar.append('canvas').attr('class','canvas-map')
                                               .attr('id','#canvas');
const canvasfiltered = sidebar.append('canvas').attr('class','canvas-map')
                                               .attr('id','#canvas-filtered');
const ctx  = canvas.node().getContext('2d');
const ctxf = canvasfiltered.node().getContext('2d');

const karmaChart = dc.barChart('#karma-histogram');
const userTable  = dc.dataTable('#user-table');

const g = svg.append("g");
const rect = g.selectAll("rect");

// main body
const content  = body.append('div').attr('id', 'content');
const main     = content.append('div').attr('id', 'main').attr('class','max-width-4 mx-auto py1 md-py4');
// metrics
main.append('a').attr('id', 'imglink').text('Download Map');
const metrics = main.append('div').attr('id', 'metrics').attr('class', 'p1 block clearfix')
metrics.append('h2').attr('class', 'mt0').text('Metriken');
metrics.append('div').attr('id', 'karma-histogram');
metrics.append('table').attr('class', 'user-table');

const h1       = main.append("h1");
const textArea = main.append("div").attr('id', 'comments');
const imglink  = d3.select('#imglink').node()

const format = d3.format(",d");

// const API = "http://localhost:4567";
const API = "";
// const test_id = "43attu";
// const test_id = "425zk4";
// const test_id = "415q8j";


const color = d3.scaleLinear()
.range(["red", "gray", "blue"]);
const topic_color = d3.scaleOrdinal(d3.schemeCategory10);
const tree_color = d3.scaleThreshold()
.range(['#ffffff','#f1f1f1','#e2e2e2','#d2d2d2','#c4c4c4','#b6b6b6','#a9a9a9','#9b9b9b','#8e8e8e','#808080'])
.domain([0,1,2,3,4,5,6,7,8,9]);

function getSubmission(ID){
    return new Promise((resolve, reject) =>{
        d3.json(API + "/submissions/" + ID, (error, data) => {
            resolve(data)
        })
    });
};
function getComments(ID){
    return new Promise((resolve, reject) =>{
        d3.json(API + "/comments/" + ID, (error, data) => {
            resolve(data)
        })
    });
};

const state = {}
state.submission = getSubmission(linkid).then(data => {
    console.dir(data.title);
    return data;
});
state.comments = getComments(linkid).then(data=> {
    console.dir("got comments");
    return data;
});

Promise.all([state.submission, state.comments]).then(values =>{
    console.dir("got em");
    let {height: mapHeight, width: mapWidth} = svg.node().getBoundingClientRect();
    values[1].push(values[0]);
    const data = values[1];

    const props = {
        width: mapWidth,
        height: mapHeight,
        karmaMax: d3.max(data, d => d.ups),
        karmaMin: d3.min(data, d => d.ups),
        color: "gray",
        colorfiltered: "red",
        filter: false,
        fisheye: d3_fisheye_scale(d3.scaleIdentity, [0,mapHeight], 0)
    }
    const nbin = 25;
    const karmascale = d3.scaleLinear()
                         .domain([props.karmaMin -5, props.karmaMax + 5])
                         .range([0,nbin]);

    console.dir(props);
    const graphData       = buildGraph(data);
    const partitionLayout = buildPartition(props, graphData);
    props.maplevels = partitionLayout.value;

    const ndx = crossfilter(partitionLayout.descendants());
    const idDimension = ndx.dimension( d=>d.data.id);
    const karmaDimension = ndx.dimension(d => {return Math.round(karmascale(d.data.ups))});
    const karmaGroup = karmaDimension.group();
    karmaChart.width(420)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(karmaDimension)
        .group(karmaGroup)
        .mouseZoomable(true)
        .elasticY(true)
        .x(d3.scaleLinear().domain([0, nbin]))
        // .y(d3.scaleLog().domain([1, data.length]).clamp(true).nice())
        .on('renderlet', (chart, filter)=> {
            console.log(idDimension);
            d3.selectAll('.filtered').classed('filtered', false);
            if(chart.filters().length == 0){

            } else {
                const data = idDimension.top(Infinity);
                data.map(d =>{
                    d3.selectAll("[cid=\"" + d.data.id + "\"]")
                    .classed('filtered', true);
                })
                props.filter = true;
                renderCommentMapCanvas(ctxf, props, data);
            }
        })
        .yAxis().ticks(5);
        // .xAxis().ticks(5);

    const authorDimension = ndx.dimension( d=>d.data.author);
    // const authorGroup = authorDimension.group().reduce((p,v) => p + v.ups,
    //                                     (p,v) => p - v.ups,
    //                                     ()=> 0);
    userTable.dimension(authorDimension)
                .group(d => d.data.author)
                .size(5)
                .columns([{
                    label: 'author',
                    format: d=>d.data.author
                }, {
                    label: 'Upvotes',
                    format: d=>d.data.ups
                }])
                .sortBy( d => d.data.ups)
                .order(d3.descending)
    dc.renderAll()


    
    
    renderCommentMapCanvas(ctx, props,partitionLayout.descendants());
    // renderCommentMapSVG(props,partitionLayout);
    renderComments(props, partitionLayout);
    h1.text(graphData.data.title);

    
    imglink.href = ctx.canvas.toDataURL();

    
    const posmarker = new MiniMapPosition().create(textArea, svg).update();
});

function buildGraph(data){
    const root = d3.stratify()
                .id(function (d) { return d.id })
                .parentId(function (d)  { 
                    if ("parent_id" in d){
                        return d.parent_id.split("_")[1];
                    } else {
                        return null;
                    }})(data);
    // root.sum(function (d) { return d.ups })
    root.count();
    root.sort(function (a, b) 
    { 
        return  b.data.ups - a.data.ups;
    });
    return root;
}

function buildPartition(props, graph){
    const partition = d3.partition()
    .size([props.height, props.width])
    // .round(true);
    // .padding(0.4);
    return partition(graph);
}
function renderCommentMapCanvas(ctx, props, root){
    let fillcolor = d3.color("black");


    ctx.canvas.width = props.width;
    ctx.canvas.height = props.height;
    let cheight = props.height / props.maplevels;
    let alpha = 1;
    if (cheight < 1){
        alpha = cheight;
        cheight = 1;   
    }

    console.log(cheight);
    root.forEach(d =>{
        if (props.filter){
            fillcolor = d3.color(props.colorfiltered);
        } else {
            fillcolor = d3.color(tree_color(d.depth));
        }
        fillcolor.alpha = alpha;
        ctx.fillStyle = fillcolor;
        ctx.fillRect(d.y0,
         Math.round(d.x0),
         d.y1 - d.y0, Math.round(cheight));
    });
}
function renderCommentMapSVG(props, root){
    const cell = svg
        .selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", function (d) { return "translate(" + d.y0 + "," + d.x0 + ")"; });
    cell.append("rect")
        .attr("cid", d=>d.id)
        .attr("width", function (d) { return d.y1 - d.y0; })
        .attr("height", function (d) { 
            return props.height / root.value; 
        })
        .style("fill", d => topic_color(d.data.color))
    }

function renderComments(props, partition){
        partition.eachBefore(d=>{
            const outer = textArea.append('div');
            // outer.attr("class", "p1");
            outer.style("margin-left", d.depth + "em");
            outer.style("background", tree_color(d.depth));
            const current = outer.append('div');
            current.attr("class", "comment");
            current.attr("cid", d.data.id);
            current.attr("ups", d.data.ups);
            current.append('p')
                        .attr("class", "author_name m0 pt1")
                        .text(d.data.author)
                            .append('span')
                            .attr("class", "ml1")
                            .text(d.data.ups);
            current.append('div')
                        .attr("class", "comment_body mb0 pb1")
                        .text(d.data.body)
        });

}



class MiniMapPosition {
    
        createScrollEvent(){
            const map = this;
            window.addEventListener('scroll', e => {
                map.update();
            });
        }
    
        create (source, target)  {
            this.source = source;
            this.target = target;
            this.posmark = target.insert('rect', ":first-child")
                              .attr('width', '100%')
                              .attr('class', 'posmark');
            
            
            this.isUpdated = false;
            this.state = {y: 0, h: window.innerHeight};
    
            this.vertScale = d3.scaleLinear().interpolate(d3.interpolateRound);
            this.createScrollEvent();
            const minpos = this;
            //TODO: move this
            canvasfiltered.on('click', function(){
                let coords = d3.mouse(this);
                let scrollTarget = minpos.vertScale.invert(coords[1]);
                console.dir(scrollTarget);
                window.scrollTo(window.scrollX, scrollTarget);
            })
            return this;
        };
    
        update() {
            let {height, top, bottom} = this.source.node().getBoundingClientRect();
            let {height: mapHeight} = this.target.node().getBoundingClientRect();
            this.state = {
                y: top,
                h: window.innerHeight,
                height: height,
                mapHeight: mapHeight
            };
            this.state.h = Math.max(this.vertScale.invert(settings.minmarkheight),
                                    this.state.h);
            console.log(this.state.h)
            if (!this.isUpdated) {
              window.requestAnimationFrame(() =>  {
                this.render();
                this.isUpdated = false;
              });
            }
            this.isUpdated = true;
            return this;
    
        }
    
        render () {
            this.vertScale.domain([0, this.state.height])
                          .range([0,this.state.mapHeight]);
            this.posmark.attr('y', this.vertScale(0 - this.state.y));
            this.posmark.attr('height', this.vertScale(this.state.h));
        }
    
    
    }

function diagonal(d) {
    return "M" + timeScale(new Date(d.data.created_utc * 1000)) + "," + d.x
        + "L" + (timeScale(new Date(d.parent.data.created_utc * 1000))) + "," + d.x
        + "L " + timeScale(new Date(d.parent.data.created_utc * 1000)) + "," + d.parent.x;
}

const createsvgdownload = function (d, i) {
    // svg download: http://stackoverflow.com/a/38019175
    var svg = document.getElementById("cgraph");

    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);

    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    //set url value to a element's href attribute.
    document.getElementById("link").href = url;
    window.location = url;
};


  
function d3_fisheye_scale(scale, d, a) {
// Source: https://github.com/d3/d3-plugins/tree/master/fisheye
      function fisheye() {
        var x = scale(_),
            left = x < a,
            {min, max} = d3.extent(scale.range()),
            // min = range[0],
            // max = range[1],
            m = left ? a - min : max - a;
        if (m == 0) m = max - min;
        return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
      }
  
      fisheye.distortion = function(_) {
        if (!arguments.length) return d;
        d = +_;
        return fisheye;
      };
  
      fisheye.focus = function(_) {
        if (!arguments.length) return a;
        a = +_;
        return fisheye;
      };
  
      fisheye.copy = function() {
        return d3_fisheye_scale(scale.copy(), d, a);
      };
  
    //   fisheye.nice = scale.nice;
    //   fisheye.ticks = scale.ticks;
    //   fisheye.tickFormat = scale.tickFormat;
    //   fisheye.domain = scale.domain;
    //   fisheye.range = scale.range;
      return fisheye;
    //   return d3.rebind(fisheye, scale, "domain", "range");
    }
