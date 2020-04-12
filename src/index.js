$( "#buttonHelp" ).on( "click", function()
{
    createHelp();
} );

function createHelp() {
  var parameters = new Object();

  parameters.helpArray = [ 
    {linkType:"dotOnly", divToHelpId:"title_TD", text:"Top-Down: based on energy & agricultural data and ground observations", marginTop:20, marginLeft:-380},
    {linkType:"dotOnly", divToHelpId:"title_BU", text:"based on measured atmospheric CH4 concentrations and inversion models", marginTop:20, marginLeft:-300},
    {linkType:"right", divToHelpId:"info_agree", text:"There is good consistency between TD and BU approaches in the partition of anthropogenic emissions between Agriculture & Waste, Fossil fuel production, and Biofuel & Biomass burning.", marginTop:10, marginLeft:10, textLengthByLine:40}
  ];

  new Help( parameters );
}

$(window).resize(function(event){
     var size = $("#breakpoints div:visible").first().data("size");
     //do something with your size
}); 
// Sankey diagram with highlight and tooltip
// http://bost.ocks.org/mike/sankey/
// http://bl.ocks.org/git-ashish/8959771

// Global stats for sources
// Table 3 of preprint https://www.earth-syst-sci-data-discuss.net/essd-2019-128/
var TD_sourceStats =   [
  {sourceName:"Fossil", mean: 109, min:79, max:168},
  {sourceName:"AgriWaste", mean: 219, min:175, max:239},
  {sourceName:"BioBurBiof", mean: 30, min:22, max:36},
  {sourceName:"Wetlands", mean:178, min:155, max:200},
  {sourceName:"OtherNatural", mean: 37, min:21, max:50}
  ];
var BU_sourceStats = [
  {sourceName:"Fossil", mean: 127, min:111, max:154},
  {sourceName:"AgriWaste", mean:206, min:191, max:223},
  {sourceName:"BioBurBiof", mean: 30, min:26, max:40},
  {sourceName:"Wetlands", mean:149, min:102, max:182},
  {sourceName:"OtherNatural", mean: 222, min:143, max:306}
  ];

// Regional stats. From sumSources in text files (see notebooks)
var TD_regionStats = [{sourceName: "USA", mean: 47, min: 34, max: 62}, {sourceName: "Canada", mean: 20, min: 16, max: 30}, {sourceName: "Central_America", mean: 12, min: 9, max: 16}, {sourceName: "Northern_South_America", mean: 20, min: 14, max: 27}, {sourceName: "Brazil", mean: 61, min: 46, max: 78}, {sourceName: "Southwest_South_America", mean: 27, min: 19, max: 35}, {sourceName: "Europe", mean: 32, min: 25, max: 41}, {sourceName: "Northern_Africa", mean: 27, min: 9, max: 34}, {sourceName: "Equatorial_Africa", mean: 44, min: 33, max: 60}, {sourceName: "Southern_Africa", mean: 18, min: 12, max: 24}, {sourceName: "Russia", mean: 34, min: 17, max: 47}, {sourceName: "Central_Asia", mean: 10, min: 7, max: 15}, {sourceName: "Middle_East", mean: 24, min: 15, max: 31}, {sourceName: "China", mean: 54, min: 43, max: 68}, {sourceName: "Korean_Japan", mean: 4, min: 3, max: 5}, {sourceName: "South_Asia", mean: 58, min: 42, max: 73}, {sourceName: "Southeast_Asia", mean: 60, min: 47, max: 67}, {sourceName: "Oceania", mean: 11, min: 8, max: 15}];

var BU_regionStats = [{sourceName: "USA", mean: 36, min: 29, max: 48}, {sourceName: "Canada", mean: 16, min: 9, max: 29}, {sourceName: "Central_America", mean: 13, min: 9, max: 20}, {sourceName: "Northern_South_America", mean: 18, min: 10, max: 32}, {sourceName: "Brazil", mean: 41, min: 28, max: 53}, {sourceName: "Southwest_South_America", mean: 27, min: 21, max: 35}, {sourceName: "Europe", mean: 28, min: 24, max: 32}, {sourceName: "Northern_Africa", mean: 27, min: 18, max: 36}, {sourceName: "Equatorial_Africa", mean: 41, min: 26, max: 54}, {sourceName: "Southern_Africa", mean: 15, min: 8, max: 24}, {sourceName: "Russia", mean: 37, min: 21, max: 54}, {sourceName: "Central_Asia", mean: 9, min: 8, max: 12}, {sourceName: "Middle_East", mean: 26, min: 22, max: 30}, {sourceName: "China", mean: 69, min: 48, max: 80}, {sourceName: "Korean_Japan", mean: 4, min: 3, max: 5}, {sourceName: "South_Asia", mean: 53, min: 38, max: 55}, {sourceName: "Southeast_Asia", mean: 55, min: 29, max: 74}, {sourceName: "Oceania", mean: 11, min: 6, max: 15}, {sourceName: "Not affected", mean: "--", min: "--", max: "--"}];  

//Top-down Sankey
var chart_div1 = "#chart_TD",
  jsonFile1 = "data/Sankey_TD_2008-2017_31mar2020_mean_noZeros.json";
makeSankey(chart_div1, jsonFile1, TD_sourceStats, TD_regionStats);  

//Bottum-up Sankey
var chart_div2 = "#chart_BU",
  jsonFile2 = "data/Sankey_BU_2008-2017_31mar2020_mean_3levels.json";
makeSankey(chart_div2, jsonFile2, BU_sourceStats, BU_regionStats);

var minStat, maxStat; //objects to store min and max statistics
var yshift_tooltip = 90; //amount to raise tooltip in y-dirn

function makeSankey(chart_div, jsonFile, sourceStats, regionStats) {          
  var margin = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
  };

  var width = 470 - margin.left - margin.right,
    height = 775 - margin.top - margin.bottom;

  var formatNumber = d3.format(".0f"), //d3.format(".2f"),
    format = function(d) {
      return formatNumber(d);
    },
    color = d3.scale.category20();

  // append the svg canvas to the page
  var svg = d3.select(chart_div).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.style("border", "1px solid black")
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  //Position BU Sankey beside TD Sankey
  $("#chart_BU svg").css({
    top: 44,
    left: 0,
    position: "absolute"
  });

  // set the sankey diagram properties
  var sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .size([width, height]);

  var path = sankey.link();

  var col_xcoord = []; //x-coords of Sankey cols

  var units = "Tg CH4 yr <sup>-1</sup>";

  var colour_dict = {
    //regions
    "Canada": "#C399D9",
    "USA": "#A6D4FF",
    "Central_America": "#9ecae1",
    "Southwest_South_America": "#65dfd1",
    "Northern_South_America": "#EA2B0D",
    "Northern_Africa": "#ffd880",
    "Southern_Africa": "#989F60",
    "Russia": "#EACE75",
    "Oceania": "#AAA993",
    "Europe": "#FCAA70",
    "China": "#7FA0FF",
    "South_Asia": "#dd1c77",
    "Southeast_Asia": "#ff80af",
    "Korean_Japan": "#000",
    "Brazil":"#33a02c",
    "Equatorial_Africa":"#386cb0",
    "Central_Asia":"#a6611a",
    "Middle_East":"#018571",
    "Not affected": "#b8b0e6",
    //sources
    "AgriWaste": "#87f4ff",
    "BioBurBiof": "#b0df65",
    "Fossil": "#d3d3d3",
    "OtherNatural": "#ffb5c5",
    "Wetlands": "#928941",
    //sub-categories
    "Coal": "#e9e9e9",
    "GasAndOilIndustry": "#e9e9e9",
    "Industry":"#e9e9e9",
    "Transport":"#e9e9e9",
    "EntericFermentationAndManure": "#aef8ff",
    "LandfillsAndWaste": "#aef8ff",
    "Rice": "#aef8ff",
    "BiofuelBurning": "#b0df65",
    "BiomassBurning": "#b0df65",
    "Termites": "#ffdae2",
    "BiogenicOceanic": "#ffdae2",
    "WildAnimals": "#ffdae2",
    "GeologicalSources": "#ffdae2",
    "Permafrost": "#ffdae2",        
    "Freshwater": "#ffdae2",
    "fakeSource": "#67a9cf"
  };

  var name_dict = {
    //regions
    "Canada": "Canada",
    "USA": "USA",
    "Central_America": "Central America",
    "Southwest_South_America": "Southwest South America",
    "Northern_South_America": "Northern South America",
    "Northern_Africa": "Northern Africa",
    "Southern_Africa": "Southern Africa",
    "Russia": "Russia",
    "Oceania": "Oceania",
    "Europe": "Europe",
    "China": "China",
    "South_Asia": "South Asia",
    "Southeast_Asia": "Southeast Asia",
    "Korean_Japan": "Korea & Japan",
    "Brazil":"Brazil",
    "Equatorial_Africa":"Equatorial Africa",
    "Central_Asia":"Central Asia",
    "Middle_East":"Middle East",
    "Not affected": "Not (yet) spatially distributed",
    //sources
    "AgriWaste": "Agriculture & Waste",
    "BioBurBiof": "Biofuel & Biomass burning",
    "Fossil": "Fossil fuel production & use",
    "OtherNatural": "Other Natural",
    "Wetlands": "Wetlands",
    //sub-categories
    "Industry":"Industry",
    "Transport":"Transport",
    "Termites": "Termites",
    "BiogenicOceanic": "Biogenic Oceanic",
    "WildAnimals": "Wild Animals",
    "EntericFermentationAndManure": "Ruminants",
    "LandfillsAndWaste": "Waste",
    "GeologicalSources": "Geological",
    "Permafrost": "Permafrost",
    "Rice": "Rice",
    "Coal": "Coal",
    "GasAndOilIndustry": "Gas/Oil",
    "BiofuelBurning": "Biofuel",
    "BiomassBurning": "Biomass",
    "Freshwater": "Freshwater",
    "fakeSource": "fakeSource"
  };

  var reverse_name_dict = {
    "Agriculture & Waste": "AgriWaste",
    "Biofuel & Biomass burning": "BioBurBiof",
    "Fossil fuel production & use": "Fossil",
    "Other Natural": "OtherNatural",
    "Wetlands": "Wetlands"
  };

  //class labels for category  nodes only
  var categories = ["AgriWaste", "OtherNatural", "BioBurBiof", "Wetlands", "Fossil"];
  //class labels for sub-category  nodes only
  var subCategories = ["WildAnimals", "Freshwater", "GeologicalSources", "Transport", 
                      "LandfillsAndWaste", "BiomassBurning", "Permafrost", "GasAndOilIndustry",
                      "BiogenicOceanic", "Rice", "Termites", "Industry", "BiofuelBurning", "Coal", 
                      "EntericFermentationAndManure", "fakeSource"];

  var minFile, maxFile;

  if (chart_div === "#chart_BU") {
    minFile = "data/Sankey_BU_2008-2017_31mar2020_min_3levels.json";
    maxFile = "data/Sankey_BU_2008-2017_31mar2020_max_3levels.json";
  } else {
    minFile = "data/Sankey_TD_2008-2017_31mar2020_min_noZeros.json";
    maxFile = "data/Sankey_TD_2008-2017_31mar2020_max_noZeros.json";
  }

  // load the data
  d3.json(maxFile, function(error, maxStat) {
    d3.json(minFile, function(error, minStat) {
      d3.json(jsonFile, function(error, graph) {
        make(graph, minStat, maxStat);
      });
    });
  });

  function make(graph, minStat, maxStat) {          
    // Display info text for Sankey diagram
    d3.select("#infotext")
      .html("Methane source estimates over the period 2008&ndash;2017 from Top-Down (left) and Bottom-Up (right) approaches showing contributions (mean [min, max]) from 18 continental regions with respect to five broad source categories (Fossil fuel production & use, Agriculture & Waste, Biofuel & Biomass burning, Wetlands, and Other Natural sources). Total source estimates from the Bottom-Up approach are further classed into finer subcategories. Data source: <a target='_blank' href='https://www.earth-syst-sci-data-discuss.net/essd-2019-128/'>Saunois et al. (2019)</a>.")
      .style("display", "block");

    var nodeMap = {};
    graph.nodes.forEach(function(x) {
      nodeMap[x.name] = x;
    });
    graph.links = graph.links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });

    graph.nodes.sort(function(a, b) {
      return d3.descending(a.value, b.value);
    });

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    // tooltip div
    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // add in the links
    var link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", function (d) {
        if (chart_div === "#chart_BU") {
          if (categories.indexOf(d.target.name) != -1 ){
            if (subCategories.indexOf(d.source.name) != -1) {
              return "link link-subsources belongsTo-" + d.target.name;
            }
          } else return "link"; 
        } else return "link";
      })
      .attr("d", path)
      .attr("id", function (d, i) {
        d.id = i;
        if (d.source.name === "fakeSource") return "link-fake";
        else return "link-" + i;
      })
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .style("stroke", function (d) {
        if (chart_div === "#chart_TD") return colour_dict[d.source.name];
        else return colour_dict[d.target.name];
      })
      .style("opacity", function (d) {
        if (d.source.name === "fakeSource") return 0;
        else return 1;
      })
      .style("cursor", function (d) {
        if (d.source.name === "fakeSource") {
          return "auto";
        } 
        else return "crosshair";
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });
    // .call(function () {
    //   DO NOT PUT CALL IN link, PUT IN node (see below)
    //   manualLayout();
    // });
    d3.selectAll(".link-subsources").style("display", "none");

    // add the link tooltip
    link.on("mousemove", function(d) {
      //Remove display of sub-source nodes and links if hovering over plain link
      if (d3.select(this).attr("class") === "link") {
        d3.selectAll(".link-subsources").style("display", "none");
        d3.selectAll(".node.sub-sources").style("display", "none");
      }

        var minValue = getStat(minStat, d),
          maxValue = getStat(maxStat, d);

        //Reduce opacity of all but link that is moused over
        if (this.id != "link-fake") {
          d3.selectAll(".link:not(#" + this.id + ")").style("opacity", 0.5);
        }
        d3.select("#link-fake").style("opacity", 0);
        
        if (d.source.name != "fakeSource") {
          if (chart_div === "#chart_BU") xshift = 250;
          else xshift = 0;

          //Tooltip
          div.transition()
            .style("opacity", .9);
          div.html(
            name_dict[d.source.name] + ": " + name_dict[d.target.name] + "<br><br>" +
            "<table>" +
              "<tr>" + 
              "<td>" + "mean: " + "</td>" +
                "<td><b>" + format(d.value) + "</b>" + " [" + format(minValue) + "&ndash;" + format(maxValue) + "]" + "</td>" +
                "<td>" + " " + units + "</td>" +
              "</tr>" +
            "</table>"
            )
            .style("left", (d3.event.pageX - xshift) + "px")
            .style("top", (d3.event.pageY - yshift_tooltip) + "px");
        }
      })
      .on("mouseout", function(d) {   

        //Restore opacity
        d3.selectAll(".link:not(#" + this.id + ")").style("opacity", 1)
        d3.select("#link-fake").style("opacity", 0);

        div.transition()
          .style("opacity", 0);
      });

    function getStat(statObj, d) {
      for (i = 0; i < Object.keys(statObj.links).length; i++) {
        if (statObj.links[i].target == d.target.name && statObj.links[i].source == d.source.name) {
          return statObj.links[i].value;
        }
      }
    }

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", function(d) {
        if (categories.indexOf(d.name) != -1) return "node class-sources";
        else if (subCategories.indexOf(d.name) != -1) {
          return "node sub-sources belongsTo-" + d.sourceLinks[0].target.name;
        }                  
        else return "node regions";
      })
      .attr("transform", function(d) {
        col_xcoord.push(d.x); //x-coord of each Sankey col
        return "translate(" + d.x + "," + d.y + ")";
      })
      .style("opacity", function (d) {
        if (d.name === "fakeSource") return 0;
        else return 1;
      })
      .style("cursor", function (d) {
        if (d.name === "fakeSource") {
          return "auto";
        } 
        else return "crosshair";
      })
      .on("click", highlight_node_links)
      .call(function() {
        manualLayout();
      })
    .call(d3.behavior.drag() //moves nodes with mouse drag
      .origin(function(d) {
        return d;
      })
      .on("drag", dragmove)
    );
    col_xcoord = uniques(col_xcoord);

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d, idx) {
        return colour_dict[d.name];
      })
      .style("stroke-width", "2px")
      .style("stroke", "#555")
      .style("display", function(d) {
        if (subCategories.indexOf(d.name) != -1) {
          d3.selectAll(".sub-sources").style("display", "none");
        }
      });

      // add the node tooltip
      node.on("mousemove", function(d) {

        if (d3.select(this).attr("class") === "node class-sources") {
          //Only display subsource nodes and links belonging to current node
          var this_source = reverse_name_dict[d3.select(this).text()];
          d3.selectAll(".link-subsources:not(.belongsTo-" + this_source + ")")
            .style("display", "none");
          d3.selectAll(".node.sub-sources:not(.belongsTo-" + this_source + ")")
            .style("display", "none");

          //Retrieve mean, min, max for sources
          var gloStat = getGlobalStat(sourceStats, d);

          if (chart_div === "#chart_BU") {
            //show all sub-sources and their links belonging to source
            d3.selectAll(".belongsTo-" + reverse_name_dict[d3.select(this).text()])
              .style("display", "inline");
          }
    
          if (chart_div === "#chart_BU" && name_dict[d.name] === "Wetlands") {
            //Tooltip
            div.transition()
              .style("opacity", .9);
            div.html(
              name_dict[d.name] + ":<br><br>" +
               "<table>" +
                "<tr>" +
                  "<td>" + "sum of means: " + "</td>" +
                  "<td><b>" + format(d.value) + "</b>" + " " + units + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "global mean: " + "</td>" +
                  "<td>" + gloStat[0] +
                           " [" + gloStat[1] + "&ndash;" + gloStat[2] + "]" +
                           " " + units + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "<br>" + "</td>" +
                "</tr>" +
                "<tr>" +  
                  "<td>" + "No sub-categories for Wetlands " + "</td>" +
                "</tr>" +
              "</table>"
              )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - yshift_tooltip - 40) + "px");
          } else { //chart_TD
            //Tooltip
            div.transition()
              .style("opacity", .9);
            div.html(
              name_dict[d.name] + ":<br><br>" +
               "<table>" +
                "<tr>" +
                  "<td>" + "sum of means: " + "</td>" +
                  "<td><b>" + format(d.value) + "</b>" + " " + units + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "global mean: " + "</td>" +
                  "<td>" + gloStat[0] +
                           " [" + gloStat[1] + "&ndash;" + gloStat[2] + "]" +
                           " " + units + "</td>" +
                "</tr>" +
              "</table>"
              )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - yshift_tooltip - 40) + "px");
          }
        
        }
        else if (d3.select(this).attr("class") === "node sub-sources") {

          var minValue = getSubStats(minStat, d),
              maxValue = getSubStats(maxStat, d);

          //Tooltip
          div.transition()
             .style("opacity", .9);
          div.html(
            name_dict[d.name] + ": " + name_dict[d.sourceLinks[0].target.name] + "<br><br>" +
              "<table>" +
                "<tr>" + 
                "<td>" + "mean: " + "</td>" +
                  "<td><b>" + format(d.value) + "</b>" + " [" + format(minValue) + "&ndash;" +format(maxValue) + "]" + "</td>" +
                  "<td>" + " " + units + "</td>" +
                "</tr>" +
              "</table>"
            )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - yshift_tooltip) + "px");
        }

        else {//node regions
          //regional stats
          var regStat = getGlobalStat(regionStats, d);
          if (chart_div === "#chart_BU") xshift = 250;
          else xshift = 0;

          if (d.name === "Not affected") {
            div.transition()
              .style("opacity", .9);
            div.html(
              name_dict[d.name] + "<br><br>" +
               "<table>" +
                "<tr>" +
                  "<td>" + "mean: " + "</td>" +
                  "<td><b>" + format(d.value) + "</b>" + " " + units + "</td>" +
                "</tr>" +
              "</table>"
              )
              .style("left", (d3.event.pageX - xshift) + "px")
              .style("top", (d3.event.pageY - yshift_tooltip + 50) + "px");

          }

          else if (d.name != "fakeSource") {
           
            div.transition()
              .style("opacity", .9);
            div.html(
              // name_dict[d.name] + ":<br><br>" +
              // "sum of means: " + "<b>" + format(d.value) + "</b>" + " " + units 

              name_dict[d.name] + ":<br><br>" +
               "<table>" +
                "<tr>" +
                  "<td>" + "sum of means: " + "</td>" +
                  "<td><b>" + format(d.value) + "</b>" + " " + units + "</td>" +
                "</tr>" +
                "<tr>" +
                  "<td>" + "regional mean: " + "</td>" +
                  "<td>" + regStat[0] +
                           " [" + regStat[1] + "&ndash;" + regStat[2] + "]" +
                           " " + units + "</td>" +
                "</tr>" +
              "</table>"
              )
              .style("left", (d3.event.pageX - xshift) + "px")
              .style("top", (d3.event.pageY - yshift_tooltip - 10) + "px");
          }
        } 

      })
      .on("mouseenter", highlight_node_links)
      .on("mouseout", function(d) {

        d3.selectAll(".clicked").classed("clicked", false);
        d3.selectAll(".link").style("stroke-opacity", 0.5);

        div.transition()
          .style("opacity", 0);
      });

    function getSubStats(statObj, d) {
      for (i = 0; i < Object.keys(statObj.links).length; i++) {
        if (statObj.links[i].source == d.name ) {
          return statObj.links[i].value;
        }
      }
    }      

    function getGlobalStat(statObj, d) {
      for (i = 0; i < Object.keys(statObj).length; i++) {
        if (statObj[i].sourceName == d.name) {
        return [statObj[i].mean, statObj[i].min, statObj[i].max];
        }
      }              
    }  

    // add in the title for the nodes
    node.append("text")
      .attr("x", -6)
      .attr("y", function(d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {
        return name_dict[d.name];
      })
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr("transform",
        "translate(" + (
          d.x = d.x
        ) + "," + (
          d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
        ) + ")");

      //move the attached links
      sankey.relayout();
      link.attr("d", path);
    }

    // manually customize node position
    function manualLayout() {
      //For sources only
      var displacement_dict = {
        "Fossil": 0,
        "AgriWaste": 124,        
        "BioBurBiof": 320,
        "Wetlands": 376,
        "OtherNatural": 537        
      };
      //For sources only
      var sub_displacement_dict = {
        "Coal": 0,
        "GasAndOilIndustry": 42,
        "Industry":124,
        "Transport":107,
        "EntericFermentationAndManure": 96,
        "LandfillsAndWaste": 198,
        "Rice": 266,
        "BiofuelBurning": 309,
        "BiomassBurning": 337,        
        "Freshwater": 479,
        "GeologicalSources": 617,
        "Termites": 666,
        "WildAnimals": 703,
        "BiogenicOceanic": 688,
        "Permafrost": 716,
        "fakeSource": 300
      };
      var link = d3.selectAll("path.link");


      //Translate sources
      if (chart_div === "#chart_TD") deltaX = 0;
      else deltaX = 125; //215;
      translateNode(chart_div,"g.node.class-sources", deltaX, displacement_dict);

      //Translate sub-sources
      translateNode(chart_div,"g.node.sub-sources", 0, sub_displacement_dict);

      //Sort region rects of TD chart in descending order. Use same order for BU regions.
      //Call only once.
      if (chart_div === "#chart_BU") sortRegions();

      sankey.relayout();
      link.attr("d", path);

    }

    //Translate nodes
    function translateNode(chart_div, nodeClass, deltaX, displacement_dict) {

      d3.select(chart_div).selectAll(nodeClass)
        .each(function(d, idx) {                  
          d3.select(this).attr("transform",
            "translate(" + (
              d.x = d.x - deltaX
            ) + "," + (
              d.y = displacement_dict[d.name]
            ) + ")");
        });

    }

    //Sorts region rects of TD chart and uses this order for BU chart
    function sortRegions() {
      var idx = 0;
      var yheight = []; //array to store sorted rect height array
      var yheight_BU = []; //stores heights of rects in BU chart
      var yval = [],
        yval_BU = []; //array to store calculated ycoords
      var ynames = []; //array to store sorted names
      var store_place = []; //placeholder
      delta = 8; //spacing between rects. DO NOT CHANGE; PRESET BY ALGORITHM        

      // Sort the rect heights in descending order and store in array
      d3.select("#chart_TD").selectAll(".node:not(." + "class-sources" + ")")
        .each(function(d, idx) {

          yheight.push(d.dy);
          yheight.sort(sortDescending);
          return yheight;

          function sortDescending(a, b) {
            return b - a; //use a - b to sort in increasing order
          }
        });

      //Find names corresponding to yheight
      //Used in last selection loop to find rank of rects
      d3.select("#chart_TD").selectAll(".regions")
        .each(function(d, idx) {

          var idx_place = yheight.indexOf(d.dy); //order for sorted names
          //handle case when yheight contains two equal numbers
          if (store_place[idx_place] === -99) {
            idx_place = idx_place + 1; //need to find next available place in 
            //the case of > 2 equal heights
          }
          store_place[idx_place] = -99;

          ynames[idx_place] = d.name; //rect names ranked by decreasing height

        });

      //Add "Not affected" to ynames for BU chart only!!!
      ynames[ynames.length] = "Not affected";

      //Store heights of BU rects in dict
      var yheightBU_dict = {
         "Brazil": 0,
          "South_Asia": 0,
          "Southeast_Asia": 0,
          "China": 0,
          "USA": 0,
          "Equatorial_Africa": 0,
          "Russia": 0,
          "Europe": 0,
          "Northern_Africa": 0,
          "Southwest_South_America": 0,
          "Middle_East": 0,
          "Canada": 0,
          "Northern_South_America": 0,
          "Southern_Africa": 0,
          "Central_America": 0,
          "Oceania": 0,
          "Central_Asia": 0,
          "Korean_Japan": 0,
          "Not affected": 0
      };
      d3.select("#chart_BU").selectAll(".regions")
        .each(function(d, idx) {
          yheightBU_dict[d.name] = d.dy;
        });

      //Calculate new y-coords of TD rects.
      yval[0] = 0;
      for (i = 1; i < yheight.length; i++) {
        yval[i] = yval[i - 1] + yheight[i - 1] + delta;
      }

      //Calculate new y-coords of TU rects based on order of ynames.
      yval_BU[0] = 0
      for (i = 1; i < ynames.length; i++) {
        yval_BU[i] = yval_BU[i - 1] + yheightBU_dict[ynames[i - 1]] + delta;
      }              

      //Plot TD region rects according to rank
      plotRects("#chart_TD", yval);
      //Plot BU region rects according to TD rank
      plotRects("#chart_BU", yval_BU);

      function plotRects(chart_div, ycoords) {
        d3.select(chart_div).selectAll(".regions")
          .each(function(d, idx) {
              var idx_place = ynames.indexOf(d.name);

              d3.select(this).attr("transform",
                "translate(" + (
                  d.x = d.x
                ) + "," + (
                  d.y = ycoords[idx_place]
                ) + ")");
          });
      }

    } //end sortRegions()

  } //end makeSankey()

  //=================================================
  // FUNCTIONS
  //=================================================
  // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
  function uniques(arr) {
    var a = [];
    for (var i = 0, l = arr.length; i < l; i++)
      if (a.indexOf(arr[i]) === -1 && arr[i] !== "")
        a.push(arr[i]);
    return a;
  }

  //Modified from http://bl.ocks.org/git-ashish/8959771
  function highlight_node_links(node, i) {

    if (node.name != "fakeSource") {

      var remainingNodes = [],
        nextNodes = [];

      var stroke_opacity = 1.0;

      var traverse = [{
        linkType: "sourceLinks",
        nodeType: "target"
      }, {
        linkType: "targetLinks",
        nodeType: "source"
      }];

      traverse.forEach(function(step) {
        node[step.linkType].forEach(function(link) {
          remainingNodes.push(link[step.nodeType]);
          highlight_link(link.id, stroke_opacity);
        });

        while (remainingNodes.length) {
          nextNodes = [];
          remainingNodes.forEach(function(node) {
            node[step.linkType].forEach(function(link) {
              nextNodes.push(link[step.nodeType]);
              highlight_link(link.id, stroke_opacity);
            });
          });
          remainingNodes = nextNodes;
        }
      });
    } //end if
  }

  function highlight_link(id, opacity) {
    var stroke_opacity_clicked = 0.2;

    //Highlight links
    d3.select(chart_div).select("#link-" + id).style("stroke-opacity", opacity)
      .classed("clicked", true);

    //Reduce opacity of links not part of highlight group
    d3.selectAll(".link:not(." + "clicked" + ")")
      .style("stroke-opacity", stroke_opacity_clicked);

  }

} // end fn make(graph)