function LodView(width, height, viewingElement){
	this.width =  width;
	this.height = height;
	this.colors = d3.scale.category10();
    this.layoutRunning = true;
	    
	this.svg = d3.select("#"+viewingElement)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("xmlns", "http://www.w3.org/2000/svg") 
		.attr("version", "1.1");
		
	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'end-arrow')
	    //.attr('viewBox', '0 -5 10 10')
	    .attr('refX', 9.5)
	    .attr('refY', 6)
	    .attr('markerWidth', 13)
	    .attr('markerHeight', 13)
	    .attr('orient', 'auto')
  	.append('svg:path')
	    //.attr('d', 'M0,-5L10,0L0,5')
	    .attr('d', 'M2,2 L2,11 L10,6')
	    .style("fill", "#ccc");

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'start-arrow')
	    .attr('viewBox', '0 -5 10 10')
	    .attr('refX', 4)
	    .attr('markerWidth', 3)
	    .attr('markerHeight', 3)
	    .attr('orient', 'auto')
  	.append('svg:path')
    	.attr('d', 'M10,-5L0,0L10,5')
    	.attr('fill', '#000');
    	    
    this.rootSvg = this.svg;	
    this.svg = this.svg.append("svg:g");    
    	
    	this.nodes = this.svg.append("svg:g").selectAll("g");
		this.edges = this.svg.append("svg:g").selectAll("line");
		this.linktext = this.svg.append("svg:g").selectAll("g.linklabelholder");
		
		//this.prefixes = this.svg.select("#divPrefixList").selectAll("div");
		
				// create the zoom listener
		var zoomListener = d3.behavior.zoom()
		  .scaleExtent([0.1, 2])
		  .on("zoom", zoomHandler);
		  //.on("dblclick.zoom", function(){});
		
		var mainG = this.svg;
		// function for handling zoom event
		function zoomHandler() {
			var scale = 1 - ( (1 - d3.event.scale) * 0.1 );
		  mainG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}
				
		zoomListener(this.rootSvg);
		this.rootSvg.on("dblclick.zoom", null);
		
		this.initControls();
};

LodView.prototype.initControls = function() {

	var view = this;
	
	d3.select("#btnLayout").on("click", function(){
		if(view.layoutRunning) {
			view.layout.stop();
			view.layoutRunning = false;
		}
		else {
			view.layout.start();
			view.layoutRunning = true;
			for(var i=0; i<view.model.nodes.length; i++) view.model.nodes[i].fixed = false;
		}
	});
	
	d3.select("#boxViewSets").on("click", function() {
		view.updateView();
	})
};

LodView.prototype.startLayout = function() {
	var thisView = this;
	this.layout = d3.layout.force()
	    .size([this.width, this.height])
	    .nodes(this.model.nodes)
	    .links(this.model.links)
	    .linkDistance(220) //200
	    .charge(-6000) //-1500
	    .on("tick", function() {
	    	thisView.tick();	
	    	
	    });
	var forceLayout = this.layout;
	//this.layout.drag().on("dragstart", function() { d3.event.sourceEvent.stopPropagation();});
};

LodView.prototype.setData = function(model) {
	this.model = model;
	this.startLayout();
};

LodView.prototype.tick = function() {
	if(this.model.links.length>0 && this.edges.length>0){
		this.edges.attr("x1", function(d) { d.countStartFromIntersection(); return d.startX; })
	     .attr("y1", function(d) { return d.startY; })
	     .attr("x2", function(d) { d.countEndFromIntersection(); return d.endX;})
	     .attr("y2", function(d) { return d.endY; });
	     
	    this.linktext.attr('transform', function(d) {
	    	p = d.getMiddlePoint();
    		return 'translate(' + p.x + ',' + p.y + ')';}); 
    }
    
    if(this.model.nodes.length>0 && this.nodes.length>0){
		/*this.nodes.attr("cx", function(d) { 
			return d.x; })
	     .attr("cy", function(d) { 
	     	return d.y; });*/
	    this.nodes.attr('transform', function(d) {
    		return 'translate(' + d.x + ',' + d.y + ')';
  		});
    }
};

LodView.prototype.updateView = function() {
    
    this.edges = this.edges.data(this.model.links, function(d) {return d.id;});    
    
	this.edges.enter()
	        .append("line")
	        .style("stroke", "#ccc")
	        .style("stroke-width", 2)
		    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
		    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
		    
		    
	this.linktext = this.linktext.data(this.model.links, function(d) {return d.id;});
    var linktextEnter =this.linktext.enter().append("g").attr("class", "linklabelholder");
    
     var linktextEnterText = linktextEnter.append("text")
     .attr("class", "linklabel")
     .attr("x", 1)
     .attr("y", function (d) {return d.labels.length/2*(-12);})//".35em")
     .attr("text-anchor", "middle");
     //.text(function(d) { return d.getName(); });

     
     	for(var i=0; i<this.model.labelIndexLimit; i++) {
     		linktextEnterText.append("tspan")
     		.attr("x", 0)
     		.attr("dy", 12) //function(d) {return d.getLabelY(i) * 12;})
     		.text(function(d) {return d.getLabel(i);});
     	}
    
    //if(this.model.getNodes().length>0){  
    	this.edges.exit().remove();
    	this.linktext.exit().remove();
    	  
    	//var canvasSvg = this.svg;
	    this.nodes = this.nodes.data(this.model.nodes, function(d) {return d.id;});  
	    
	    var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        
        var view = this;

	    function dragstart(d, i) {
	        view.layout.stop(); // stops the force auto positioning before you start dragging
	        d3.event.sourceEvent.stopPropagation();
	    }
	
	    function dragmove(d, i) {
	        d.px += d3.event.dx;
	        d.py += d3.event.dy;
	        d.x += d3.event.dx;
	        d.y += d3.event.dy; 
	        view.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
	    }
	
	    function dragend(d, i) {
	        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
	        view.tick();
	        if(view.layoutRunning) view.layout.resume();
	        view.drawVocabPaths();
	    }
	    
	    //this.nodes.enter()
	    var nodesEnter = this.nodes.enter().append("g")			
	        .call(node_drag)
	        .classed("node",true); 
	        //.append("circle")
	        //.attr("r", 10)
	    nodesEnter.append("path")
	        .attr("d", function(d) {
	        	return d.getPathData();});	        	
	        //.style("fill", "#ccc");
	        
	    nodesEnter.append("text")
	    	.classed("nodename", true)
	    	.text(function(d) { return d.getName(); })	    	
      		.style("font-size", function(d) { 
      			return Math.max(Math.min(16, Math.min(d.width, (d.width - 8) 
      			/ this.getComputedTextLength() * 14)), 13) + "px"; })      			
			.attr("x","0")//function(d) {return d.width/2+2;})
			.attr("y","0") 
		     .attr("dx", 1)
		     .attr("dy", ".35em");
		     
		 this.nodes.selectAll(".nodename").text(function(d) {return d.getName();});   
		 this.nodes.selectAll("path").classed("selected", function(d) {return d.selected;});
		 
		 d3.selectAll(".node").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 })
		 
		 d3.selectAll("line").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 })
		 
		 d3.selectAll(".linklabelholder").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 })
		 
		this.nodes.exit().remove();
		 
		this.prefixes = d3.select("#divPrefixList").selectAll("div");
	    this.prefixes = this.prefixes.data(this.model.prefixes);
	    var prefixEnter = this.prefixes.enter().append("div")
		    	.text(function (d) {return d;});
	    this.prefixes.exit().remove();    
    
    d3.select("#spanDatasetName").text(this.model.dataset);
    
    if(this.layoutRunning) this.layout.start();
    this.tick();
};
