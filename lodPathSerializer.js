LodPathSerializer = {};

LodPathSerializer.setModel = function(model) {this.model = model};

LodPathSerializer.isDatatype = function(node) {
	return node.isDatatype();
};

LodPathSerializer.createContext = function() {
	this.context = {
			'@vocab': "https://w3id.org/lodsight/rdf-path#",
			rdfs: "http://www.w3.org/2000/01/rdf-schema#",
			edgeProperty: {'@type': '@id'},
			edges: {'@container': "@list"}
	};
	for(var i=0; i<this.model.prefixes.length; i++) {
		this.context[this.model.prefixes[i].prefix] = this.model.prefixes[i].namespace;
	}
};

LodPathSerializer.addType = function(node) {
	var typeSpec = {
			'@id': node.getName(),
			'@type': (this.isDatatype(node)?"rdfs:Datatype":"rdfs:Class")
	};
	this.graph.push(typeSpec);
};

LodPathSerializer.addPathHop = function(link) {
	this.orderedLinks.push(link);
	var start = link.start;
	var end = link.end;
	
		var startType = {'@type': start.getName()};
		var endType = {'@type': end.getName()};
		this.addType(start); this.addType(end);
		var predicate = link.getSelectedLabel();
		var edge = {
				start: startType,
				end: endType,
				edgeProperty: predicate
		}
		this.path.edges.push(edge);	
};

LodPathSerializer.findFirstLink = function() {
	for(var i=0; i<this.links.length; i++) {
		var isStart = true;
		for(var j=0; j<this.links.length; j++) {
			if(this.links[i].start == this.links[j].end && i!=j) isStart = false;
		}
		if(isStart) return this.links[i];
	}
	return false;
};

LodPathSerializer.getNextLink = function(link) {
	for(var i=0; i<this.links.length; i++) {
		if(this.links[i].start == link.end) return this.links[i];
	}
	return false;
}

LodPathSerializer.init = function() {
	this.graph = Array();
	this.path = {};
	this.path["@type"] = "Path";
	this.path.edges = Array();
	this.graph.push(this.path);
	this.links = Array();
	this.orderedLinks = [];
}

LodPathSerializer.createPathObject = function() {	
	for(var i=0; i<this.model.links.length; i++)	{
		var start = this.model.links[i].start;
		var end = this.model.links[i].end;
		if(start.selected && end.selected && (this.model.links[i].isSomeLabelSelected() || start != end)) {
			this.links.push(this.model.links[i]);
			/*
			var startType = {'@type': start.getName()};
			var endType = {'@type': end.getName()};
			this.addType(start); this.addType(end);
			var predicate = this.model.links[i].getSelectedLabel();
			var edge = {
					start: startType,
					end: endType,
					edgeProperty: predicate
			}
			this.path.edges.push(edge);*/
		}	
	}
	var link = this.findFirstLink();
	this.addPathHop(link);
	while(link = this.getNextLink(link)) {
		this.addPathHop(link);
	}
};

LodPathSerializer.processExamples= function(data) {
	$.get('pathExampleFrame.json', function(frame) {
	jsonld.frame(data, frame, function(err, framed) {
			LodPathSerializer.showExamples(framed);
		});	});
}

LodPathSerializer.addExample= function(from, to) {
	if(from.hasOwnProperty("@id")) to.addExample(from["@id"], from["@id"]);
	else if(from.hasOwnProperty("@value")) to.addExample(from["@value"], from["@value"]);
	else to.addExample(from, from);
}

LodPathSerializer.showExamples = function(data) {
	var examplePaths = data["@graph"];
	this.model.setExampleCount(examplePaths.length);
	for(var i=0; i<examplePaths.length; i++) {
		for(var j=0; j<examplePaths[i].edges.length; j++) {
			var edge = examplePaths[i].edges[j];
			this.addExample(edge.start, this.orderedLinks[j].start);
			if(j==examplePaths[i].edges.length-1) this.addExample(edge.end, this.orderedLinks[j].end);
		}
	}
	this.callWhenLoaded();
}

LodPathSerializer.clearExamples = function() {
	for(var i=0; i<this.model.objectNodes.length; i++) this.model.objectNodes[i].examples = [];
}

LodPathSerializer.createPathFromLinks = function(links) {
	for(var i=0; i<links.length; i++) this.addPathHop(links[i]);
}

LodPathSerializer.getJSONpathFromGivenLinks = function(links) {
	this.init();
	this.createContext();
	this.createPathFromLinks(links);
	this.jsonLDPath = {
			'@context': this.context,
			"@graph": this.graph
	}
	return JSON.stringify(this.jsonLDPath);
}

LodPathSerializer.loadExamples = function(callback, samplingMethod) {
	this.init();
	this.method = samplingMethod;
	this.clearExamples();
	this.callWhenLoaded = callback;
	this.createContext();
	this.createPathObject();
	this.jsonLDPath = {
			'@context': this.context,
			"@graph": this.graph
	}
	var jsonStringPath = JSON.stringify(this.jsonLDPath);
	/*
	 * DEBUG config: changed endpoint from this.model.endpoint to proprietary hardcoded
	 */
	var url = pathExampleGeneratorUrl+'?sparql-endpoint='+
		encodeURIComponent("http://lod2-dev.vse.cz:4004/vvz/query")+'&selection-method='+this.method;
	//$.get('debug/pathExamples.json', function(data){LodPathSerializer.processExamples(data);});
	$.post({
				contentType: 'application/ld+json',
				data: jsonStringPath,
				success: function(data){LodPathSerializer.processExamples(data);},
				url: url,
				method: 'POST',
				timeout: 1200000,
				processData: false,
				mimeType: 'application/ld+json',
				dataType: 'ld+json',
				converters: {
				    'text ld+json': function(result) {
				      // Do Stuff
				      return JSON.parse(result);
				    }
				  }
	});
	
}