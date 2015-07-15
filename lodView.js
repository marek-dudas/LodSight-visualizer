function LodView(width, height, viewingElement){
	this.width =  width;
	this.height = height;
	this.colors = d3.scale.category20();
    this.layoutRunning = true;
    
    this.textSize = minTextSize;
	    
	this.svg = d3.select("#"+viewingElement)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("xmlns", "http://www.w3.org/2000/svg") 
		.attr("version", "1.1")
		.attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink");
		
	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'end-arrow')
	    //.attr('viewBox', '0 -5 10 10')
	    .attr('refX', 3)//9.5
	    .attr('refY', 2)//6
	    //.attr('markerUnits', 'userSpaceOnUse')
	    .attr('markerWidth', 4)//13
	    .attr('markerHeight', 4)//13
	    .attr('orient', 'auto')
  	.append('svg:path')
	    //.attr('d', 'M0,-5L10,0L0,5')
	    //.attr('d', 'M2,2 L2,11 L10,6')
  		.attr('d', 'M0 0 L4 2 L0 4 Z')
	    .style("fill", "#ccc");

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'start-arrow')
	    .attr('viewBox', '0 -5 10 10')
	    .attr('refX', 4)
	    .attr('markerWidth', 3)//3
	    .attr('markerHeight', 3)//3
	    .attr('orient', 'auto')
  	.append('svg:path')
    	.attr('d', 'M10,-5L0,0L10,5')
    	.attr('fill', '#000');
    	    
    this.rootSvg = this.svg;	
    this.svg = this.svg.append("svg:g");    
    
    

		this.edges = this.svg.append("svg:g").selectAll("line");
    	this.nodes = this.svg.append("svg:g").selectAll("g");
		this.linktext = this.svg.append("svg:g").selectAll("g.linklabelholder");
				
		//this.prefixes = this.svg.select("#divPrefixList").selectAll("div");
		var mainG = this.svg;
		// function for handling zoom event
		function zoomHandler() {
			var scale = 1 - ( (1 - d3.event.scale) * 0.1 );
		  mainG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		  LodSight.view.textSize = minTextSize / d3.event.scale;
		  d3.selectAll(".nodename").style("font-size", LodSight.view.textSize+"px");
		}
				// create the zoom listener
		this.zoomListener = d3.behavior.zoom()
		  .scaleExtent([0.1, 2])
		  .on("zoom", zoomHandler);
		  //.on("dblclick.zoom", function(){});		
				
		this.zoomListener(this.rootSvg);
		//this.rootSvg.on("dblclick.zoom", null); //disables zooming on double click
		
};

LodView.prototype.initControls = function(controller) {

	var view = this;
	
	this.rootSvg.on("contextmenu", function(){
		controller.canvasMouseDown(d3.mouse(this), null);
		d3.event.preventDefault();
	});
	
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
	});
	
	d3.select("#btnExamples").on("click", function() {
		controller.loadExamples();
	});
	
	d3.select("#btnChangeExample").on("click", function() {
		controller.changeExampleIndex();
	});
	
	d3.select("#btnUpdate").on("click", function() {
		controller.loadModel(null);
	});
	
	d3.select("#btnUpdatePredicates").on("click", function() {
		controller.loadModel(null);
	});
	
	d3.select("#rngMinFreq").on("input", function() {
		controller.minFrequencyChanged(this.value);
		LodSight.view.updateDetailLabel(this.value);
	});	
	
	d3.select("#rngMaxFreq").on("input", function() {
		controller.maxFrequencyChanged(this.value);
		LodSight.view.updateMaxFreqLabel(this.value);
	})
	
	d3.select("#btnFontPlus").on("click", function() {
		LodSight.view.textSize+=2;
		maxTextSize+=2;
		controller.updateView();
	})
	
	d3.select("#btnFontMinus").on("click", function() {
		LodSight.view.textSize-=2;
		maxTextSize-=2;
		controller.updateView();
	})
	
};

LodView.prototype.updateMaxFreqLabel = function(value) {
	d3.select("#spnMaxFreq").text(
			Math.round(value / d3.select("#rngMaxFreq").property("max") * 100));
}

LodView.prototype.updateDetailLabel = function(value) {
	d3.select("#spnLOD").text(
			Math.round(100 - value / d3.select("#rngMinFreq").property("max") * 100));
}

LodView.prototype.updateControls = function(controller) {
	d3.select("#rngMinFreq").property("max", controller.getMaxFrequency())
	.property("step", Math.ceil(controller.getMaxFrequency()/frequencyStepCount))
	.property("value", controller.getCurrentFrequency());
	this.updateDetailLabel(controller.getCurrentFrequency());
	var maxFreqThreshold = controller.getMaxFrequency();
	d3.select("#rngMaxFreq").property("max", maxFreqThreshold)
	.property("step", 1) //maxFreqThreshold/frequencyStepCount)
	.property("value", controller.getCurrentMaxFrequency());
	this.updateMaxFreqLabel(controller.getCurrentMaxFrequency());
}

LodView.prototype.startLayout = function() {
	var thisView = this;
	this.layout = d3.layout.force()
	    .size([this.width, this.height])
	    .nodes(this.model.nodes)
	    .links(this.model.edges)  //(this.model.links)
	    .linkDistance(layoutLinkDistance) //200
	    .charge(layoutCharge) //-1500
	    .on("tick", function() {
	    	thisView.tick();	
	    	
	    });
	var forceLayout = this.layout;
	//this.layout.drag().on("dragstart", function() { d3.event.sourceEvent.stopPropagation();});
};

LodView.prototype.setData = function(model) {
	this.tickCounter = 0;
	this.model = model;
	this.startLayout();
};

LodView.prototype.tick = function() {
	if(this.model.edges.length>0 && this.edges.length>0){
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
    
	    if(this.tickCounter>=0) this.tickCounter++;
	    if(this.tickCounter>ticksToSetDefaultZoom) {
	    	var minX =10000;
	    	var minY = 10000;
	    	var maxX = 0;
	    	var maxY = 0;
	    	for(var i=0; i<this.model.nodes.length; i++) {
	    		if(this.model.nodes[i].x<minX) minX = this.model.nodes[i].x;
	    		if(this.model.nodes[i].y<minY) minY = this.model.nodes[i].y;
	    		if(this.model.nodes[i].x>maxX) maxX = this.model.nodes[i].x;
	    		if(this.model.nodes[i].y>maxY) maxY = this.model.nodes[i].y;
	    	}
	    	var modelWidth = maxX-minX;
	    	var modelHeight = maxY-minY;
	    	var scale = Math.min(this.width/modelWidth, (this.height-50)/modelHeight)
	    	
	    	zoomWidth = (this.width-scale*this.width)/2
	    	zoomHeight = (this.height-scale*this.height)/2
	    	
	    	this.svg.attr("transform", "translate("+zoomWidth+","+zoomHeight+") scale("+scale+")");
	    	//d3.behavior.zoom().translate([zoomWidth,zoomHeight]).scale(scale);
	    	this.zoomListener.translate([zoomWidth,zoomHeight]).scale(scale);
	    	this.tickCounter = -1;
	    	this.textSize = minTextSize/scale;
	    	this.nodes.selectAll(".nodename")
		 		.style("font-size", this.textSize+"px");   
	    }
    }
};

LodView.prototype.updateView = function(controller) {

    var view = this;
    
    this.edges = this.edges.data(this.model.edges, function(d) {return d.id;});    
    
	this.edges.enter()
	        .append("line")
	        .style("stroke", "#ccc")
	        .style("stroke-width", function(d) {
	        	var strokeWidth = d.frequency / view.model.maxFrequency * maxEdgeWidth;
	        	if(strokeWidth<minEdgeWidth) strokeWidth = minEdgeWidth;
	        	return strokeWidth;
	        }) //2
		    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
		    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });
		    
		    
	this.linktext = this.linktext.data(this.model.linkNodes, function(d) {return d.id;}); //this.linktext.data(this.model.links, function(d) {return d.id;});
    var linktextEnter =this.linktext.enter().append("g").attr("class", "linklabelholder");
    
    var labelCount = this.model.labelIndexLimit;
    
    /*for(var i=0; i<labelCount; i++) {
 		linktextEnter.append("path")
    	.attr("d", function(d) {
    		return d.getLabelBoundingPath(i, d.getLabel(i).visualLength());    		
    	})    	
 		//.attr("x", 0)
 		//.attr("y", function(d) {return (i-d.labels.length/2.0)*labelHeight;})
 		.attr("x-lodsight:pathindex", function(d) {return i;})
 		.on("click", function(d) {
 			controller.linkLabelClick(d, this.attributes[1].value);
 		});
    }*/
    
     
     //.attr("x", 1)
     //.attr("y", function (d) {return d.labels.length/2*(-12);})//".35em")
     //.attr("text-anchor", "middle");
     //.text(function(d) { return d.getName(); });

     
     	for(var i=0; i<this.model.labelIndexLimit; i++) {     	
     		var linktextEnterText = linktextEnter.append("g")
     	     .attr("class", "linklabel");
     		
     		linktextEnterText.append("path") //linktextEnter.append
        	.attr("d", function(d) {
        		return d.getLabelBoundingPath(i, d.getLabel(i).visualLength());    		
        	})    	
     		.attr("x-lodsight:pathindex", function(d) {return i;})
     		.on("click", function(d) {
     			controller.linkLabelClick(d, this.attributes[1].value);
     		});
     		
     		linktextEnterText.append("text") //tspan
     		.attr("class", "linklabelpart")
     	     .attr("text-anchor", "middle")
     		.attr("x", 0)
     		.attr("y", function(d) {return d.getLabelY(i)+(labelHeight/2.0); }) //function(d) {return d.getLabelY(i) * 12;})
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
	    }
	    
	    //this.nodes.enter()
	    var nodesEnter = this.nodes.enter().append("g")
        	.on("click", function(d){
        		controller.canvasMouseDown(d3.mouse(this), d);
        	})			
	        .call(node_drag)
	        .classed("node",true); 
	        //.append("circle")
	        //.attr("r", 10)
	    nodesEnter.append("path")
	        .attr("d", function(d) {
	        	return d.getPathData();})	        	
	        .attr("fill", function(d) {
	        	return controller.view.colors(controller.getPrefixColorCode(d.prefix));
	        });
	        
	    nodesEnter.append("text")
	    	.classed("nodename", true)
	    	.style("font-size", this.textSize+"px")
	    	.text(function(d) { return d.getName(); })	    	
      		/*.style("font-size", function(d) { 
      			return Math.max(Math.min(
      								maxTextSize, 
      								Math.min(d.width, (d.width - 8) / this.getComputedTextLength() * 14)), 
      							minTextSize) + "px"; })*/	    	
			.attr("x","0")//function(d) {return d.width/2+2;})
			.attr("y","0") 
		     .attr("dx", 1)
		     .attr("dy", 0);//".35em");
	    
	    nodesEnter.append("path")
	    	.classed("exampleLabelClickArea", true)
	    	.attr("x", function(d){
	    		return -d.width/2.0;
	    	})
	    	.attr("y", function(d){
	    		return -(d.height*0.1 + labelHeight);
	    	})
	    	.attr("d", function(d) {
        		return RectanglePathPositioned(-100, -(d.height*0.1 + labelHeight), 270, labelHeight);    		
        	})
        	.on("click", function(d) {var uri=d.getExampleUri(LodSight.control.selectedExampleIndex); if(uri!="") window.open(uri, "_blank");});
	    	
	    nodesEnter.append("text")
	    	.classed("exampleLabelHolder", true)
	    	.attr("x", function(d){
	    		return -d.width/2.0;
	    	})
	    	.attr("y", function(d){
	    		return -(d.height*0.1 + labelHeight);
	    	});
	    
	    /*
	    nodesEnter.append("svg:a")
    	.classed("exampleLabelUriHolder", true)
    	.attr("x", function(d){
    		return -d.width/2.0;
    	})
    	.attr("y", function(d){
    		return -(d.height*0.1 + labelHeight);
    	})
    	.attr("target", "_blank")
    	.append("text").classed("exampleLabelHolder", true);*/
		     
		 this.nodes.selectAll(".nodename")
		 	.text(function(d) {return d.getName();})
		 	.style("font-size", this.textSize+"px"); ;   
		 this.nodes.selectAll("path").classed("selected", function(d) {return d.selected;});
		 
		 d3.selectAll(".node").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 });
		 
		 //d3.selectAll(".nodename").style("font-size", minTextSize); 
				 /*function(d) { 
   			return Math.max(Math.min(
						maxTextSize, 
						Math.min(d.width, (d.width - 8) / this.getComputedTextLength() * 14)), 
					minTextSize) + "px"; });*/
		 
		 d3.selectAll("line").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 });
		 
		 d3.selectAll(".linklabelholder").style("visibility", function(d) {
			 if( (d.fromCSet && d3.select("#boxViewSets").node().checked == true) || !d.fromCSet) return "visible";
			 else return "hidden";
		 });
		 
		 d3.selectAll(".linklabelpart").classed("selected", function (d) {
			 if(d.getLabel(d.selectedLabelIndex)!="" && d.getLabel(d.selectedLabelIndex) == this.innerHTML) {
				 return true;
			 }
			 else return false;
		 });
		 
		 this.nodes.selectAll(".exampleLabelHolder").text( function(d) { 
			 return d.getExample(LodSight.control.selectedExampleIndex).shortenTo(exampleStringLength); 
		 }).on("click", function(d) {window.open(d.getExampleUri(LodSight.control.selectedExampleIndex), "_blank");});
		 
		/* this.nodes.selectAll(".exampleLabelUriHolder").attr( "xlink:xlink:href", function(d) { 
			 return d.getExampleUri(LodSight.control.selectedExampleIndex); 
		 });*/
		 		 
		this.nodes.exit().remove();
		 
		this.prefixes = d3.select("#divPrefixList").selectAll("div");
	    this.prefixes = this.prefixes.data(this.model.prefixes);
	    var prefixEnter = this.prefixes.enter().append("div");
	    prefixEnter.append("input").attr("type", "checkbox")
	    	.on("mouseup", function(d) {
	    		d.selected = !d3.select(this).node().checked;
	    	})
	    	.property("checked", function(d) {return d.selected});
	    prefixEnter.append("span")
		.style("color", function(d) {return view.colors(view.model.getPrefixIndex(d.str))})  //prefixes.indexOf(d.str))})
    	.text(function (d) {return d.str;});
	    this.prefixes.exit().remove();    
	    
	    this.predicates = d3.select("#divPredicateList").selectAll("tr");
	    this.predicates = this.predicates.data(this.model.predicates);
	    var predicateRows = this.predicates.enter().append("tr").style("margin", "none");
	    predicateRows.append("td").append("input")
    	.attr("type", "checkbox")
    	.on("mouseup", function(d) {
    			d.selected = !d3.select(this).node().checked;
    		})
    	.property("checked", function(d) {return d.selected});
	    predicateRows.append("td").text(function(d) {return d.getName();});
	    this.predicates.exit().remove();
    
    d3.select("#spanDatasetName").text(this.model.dataset);
    
    if(this.layoutRunning) this.layout.start();
    this.tick();
};
