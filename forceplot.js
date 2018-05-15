let width = window.innerWidth-17,
height = 600,
padding = 50; 

let svg = d3.select('#killingbees').append('svg')
.attr('width', width)
.attr('height', height)

    // parse values in dataset
    let parseDate = d3.timeParse("%Y-%m-%d");
    let formatDate = d3.timeFormat("%Y");

    // various scales, could be optimized
    let colors = d3.scaleOrdinal()
    .domain(["0-0", "0-1", "0-2", "0-3", "1-0", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-3", "3-0", "3-1", "3-2", "3-3"])
    .range(["#4c4c4c","#888444","#c3bd3b","#fff533","#336988","#777c71","#bb9059","#ffa343", "#1987c3","#66759e","#b26478","#ff5252","#00a4ff","#556dcb","#aa3796","#ff0062"]);

    let x = d3.scaleLinear()
    .range([0 + padding, width - padding]);

    let y = d3.scaleLinear()
    .range([height - padding, 0 + padding]);

    let urbScale = d3.scalePoint()
    .domain(["1","2","3"])
    .range([0 + padding, height - padding]);

    let mountScale = d3.scalePoint()
    .domain(["NM","T","P"])
    .range([0 + padding, height - padding])

    let size = d3.scaleLinear()
    .range([0.5,15]);

    // starting visualization with:
    let data_set = "interruption_duration";
    let data_setX = "interruption_number";

    // Parse dataset

    d3.csv("accenture.csv", function(error, data) {
      if (error) throw error;

      x.domain(d3.extent(data, function(d) { 
        d[data_setX] = +d[data_setX];
        return d[data_setX]; 

      }));

      // console.log(JSON.stringify(data, null, "\t"));

      y.domain(d3.extent(data, function(d) { 
        d[data_set] = +d[data_set];
        return d[data_set]; 
      }

      ));

      size.domain(d3.extent(data, function(d) { 

        d.client_number = +d.client_number;
        return d.client_number; }

        ));

      // start ticks for animations and transitions

      function tick(){

        d3.selectAll('.circ')
        .attr('cx', function(d){return d.x})
        .attr('cy', function(d){return d.y})

      };

      // Draw axes

//      svg.append("g")
//      .call(dateAxis)
//      .classed("xAxis", true);
//
//      svg.append("g")
//      .attr("transform","translate(" + ( width - padding ) + ",0)")
//      .classed("yAxis", true);

      // Draw circles
      svg.selectAll('.circ')
      .data(data)
      .enter().append('circle').classed('circ', true)
      .attr('r', function(d) { return size(d.client_number) })
      .attr('cx', function(d){return width/2;})
      .attr('cy', function(){return height/2;})
      .attr("fill", function(d) { return colors(d.dur_number); })

      // Start force layout
      let simulation = d3.forceSimulation(data)
      .force('x', d3.forceX( function(d){
        return x(d[data_setX])
      }).strength(0.99))
      .force('y', d3.forceY( function(d){
        return y(d[data_set])
      }).strength(0.99))
      .force('collide', d3.forceCollide(0))
      .alphaDecay(0)
      .alpha(0.12)
      .on('tick', tick) 

      let init_decay; 
      init_decay = setTimeout(function(){
        console.log('init alpha decay')
        simulation.alphaDecay(0.1);
      }, 5000);

      d3.selectAll('.circ').on("mouseenter", function(d){

       console.log(JSON.stringify(d, null, "\t"));

      })

    // Draw UI buttons

    let yButtons = d3.select('#killingbees-ui').append('div').classed('buttons', true);
    yButtons.append('p').text('asse Y: ')
    yButtons.append('button').text('interruption duration').attr('value', 'interruption_duration').classed('d_sel', true).classed('num', true)
    yButtons.append('button').text('interruption number').attr('value', 'interruption_number').classed('d_sel', true).classed('num', true)
    yButtons.append('button').text('mountains').attr('value', 'mountain_region').classed('d_sel', true).classed('cat', true)
    yButtons.append('button').text('urbanization').attr('value', 'urbanization').classed('d_sel', true).classed('cat', true)

    let xButtons = d3.select('#killingbees-ui').append('div').classed('buttons', true);
    xButtons.append('p').text('asse X: ')
    xButtons.append('button').text('interruption duration').attr('value', 'interruption_duration').classed('b_sel', true).classed('num', true)
    xButtons.append('button').text('interruption number').attr('value', 'interruption_number').classed('b_sel', true).classed('num', true)

    // make buttons interactive, vertical categories
    d3.selectAll('.d_sel').on('click', function(){

      d3.selectAll('.d_sel').classed('selected', false)
      d3.select(this).classed('selected', true)

      data_set = this.value;

      console.log(data_set)

      if (data_set === "mountain_region"){
        simulation.force('y', d3.forceY(function(d){
          return mountScale(d[data_set])
        }))
        simulation.force('collide', d3.forceCollide(function(d) { 
          return size(d.client_number) + 1 
        }).iterations(32))
      } else if (data_set === "urbanization"){
        simulation.force('y', d3.forceY(function(d){
          return urbScale(d[data_set])
        }))
        simulation.force('collide', d3.forceCollide(function(d) { 
          return size(d.client_number) + 1 
        }).iterations(32))
      } else {
        simulation.force('collide', d3.forceCollide(0))
        y.domain(d3.extent(data, function(d) { 
          d[data_set] = +d[data_set];
          return d[data_set]; }
          ));

        simulation.force('y', d3.forceY(function(d){
          return y(d[data_set])
        }))
      }

      simulation
      .alphaDecay(0.001)
      .alpha(1)
      .restart()

    })

    // make buttons interactive, horizontal values
    d3.selectAll('.b_sel').on('click', function(){

      d3.selectAll('.b_sel').classed('selected', false)
      d3.select(this).classed('selected', true)

      data_setX = this.value;

      x.domain(d3.extent(data, function(d) { 
        d[data_setX] = +d[data_setX];
        return d[data_setX];
      }));

      console.log(data_setX)

      simulation.force('x', d3.forceX(function(d){
        return x(d[data_setX])
      }))

      simulation
      .alphaDecay(0.01)
      .alpha(0.5)
      .restart()
    })

  })