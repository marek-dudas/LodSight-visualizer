function LodResource(name, prefix, id) {
	this.name = name;
	this.prefix = prefix;
	this.id = id;
	this.selected = false;
}

LodResource.prototype.getName = function() {
	if(this.prefix != "" && this.name != "") return this.prefix+":"+this.name;
	else return this.name;
}

LodNode.prototype = Object.create(LodResource.prototype);

function LodNode(name, prefix, id, fromCSet) {
	LodResource.call(this, name, prefix, id);
	this.fromCSet = fromCSet;
	this.examples = [];
}

LodNode.prototype.addExample = function(example) {
	this.examples.push(example);
}

LodNode.prototype.getExample = function(index) {
	if(index<this.examples.length) return this.examples[index];
	else return "";
}

function LodLinkNode(name, prefix, id, fromCSet) {
	LodNode.call(this, "", "", id, fromCSet);
	this.labels = [];
	this.addLabel(name, prefix);
	//this.labels.push(new LodResource(name, prefix, -1));
	this.selectedLabelIndex = -1;
}

/*
function LabelHolder() {
	this.labels = [];
}

LabelHolder.prototype.add = function(name, prefix) {
	this.labels.push(new LodResource(name, prefix, -1));
}*/

function LodLink(name, prefix, start, end, id, fromCSet, lodModel, frequency) {
	//LodResource.call(this, name, prefix, id);
	//this.labels = [];
	//this.labels.push(new LodResource(name, prefix, -1));
	
	this.name = "";
	this.id = id;
	this.fromCSet = fromCSet;
	this.start = start;
	this.end = end;
	this.frequency = frequency;
	this.node = lodModel.addLinkNode(name, prefix, fromCSet);
	
	this.startEdge = lodModel.addEdge(start, this.node, fromCSet, frequency);
	this.endEdge = lodModel.addEdge(this.node, end, fromCSet, frequency);
	/*
	this.start = start;
	this.end = end;
	this.source = start;
	this.target = end;
	this.right = true;
	this.left = false;
	this.id = id;
	this.fromCSet = fromCSet;*/
	//this.freq = freq;
}

LodLink.prototype.updateFrequency = function(frequency) {
	if(this.frequency < frequency) {
		this.frequency = frequency;
		this.startEdge.frequency = frequency;
		this.endEdge.frequency = frequency;
	}
}

LodLink.prototype.changeEnd = function(newEnd) {
	this.end = newEnd;
	this.endEdge.setEnd(newEnd);
}

LodLinkNode.prototype = Object.create(LodNode.prototype);

LodLink.prototype.addLabel = function(name, prefix)
{
	this.node.addLabel(name, prefix);
}

LodLink.prototype.getLabel = function(index) {
	return this.node.getLabel(index);
}

LodLinkNode.prototype.updateFrequentPrefix = function() {
	var prefixes = {};
	for(var i=0; i<this.labels.length; i++) {
		if(this.labels[i].prefix in prefixes) prefixes[this.labels[i].prefix] += 1;
		else prefixes[this.labels[i].prefix] = 1;
	}
	var freqPrefix = "";
	var maxFreq = 0;
	for(var prefix in prefixes) {
		if(prefixes[prefix]>maxFreq) {
			freqPrefix = prefix;
			maxFreq = prefixes[prefix];
		}
	}
	this.prefix = freqPrefix;
}

LodLinkNode.prototype.addLabel = function(name, prefix) {
	this.labels.push(new LodResource(name, prefix, -1));
	this.updateFrequentPrefix();
	//this.labelStore.add(name,prefix);
}

LodLink.prototype.getName = function()
{
	return this.name;
}

/*
LodLink.prototype.getName = function() {
	var name = "";
	for(var i=0; i<this.labels.length; i++) {
		name+="<tspan>"+this.labels[i].name+"</tspan>";
	}
	return name;
}*/

LodLinkNode.prototype.getLabel = function(index) {
	if(index>=0 && index<this.labels.length) {
		return this.labels[index].getName();
	}
	else return "";
}

LodLinkNode.prototype.getLabelIndex = function(text) {
	return this.labels.indexOf(text);
}

LodLink.prototype.getLabelCount = function() {
	return this.node.labels.length;
}

LodLink.prototype.getSelectedLabel = function() {
	return this.getLabel((this.isSomeLabelSelected())?this.node.selectedLabelIndex:0);
}

LodLink.prototype.isSomeLabelSelected = function() {
	return this.node.selectedLabelIndex>=0;
}

/*
LodLinkNode.prototype.getLabelY = function(index) {
	if(index>0 && index<this.labels.length) {
		return index;
	}
	else return 0;
}*/

LodEdge = function(start, end, id, fromCSet, frequency)
{
	this.start = start;
	this.end = end;
	this.source = start;
	this.target = end;
	this.right = true;
	this.left = false;
	this.id = id;
	this.fromCSet = fromCSet;
	this.frequency = frequency;
}

LodEdge.prototype.setEnd = function(end) {
	this.end = end;
	this.target = end;
}

//LodLink.prototype = Object.create(LodResource.prototype);

function LodModel() {
	this.links = [];
	this.nodes = [];
	this.edges = [];
	this.linkNodes = [];
	this.objectNodes = [];
	this.prefixes = [];
	this.idCounter = 0;
	this.labelIndexLimit = 1;
	this.dataset = "";
	this.exampleCount = 0;
	this.maxFrequency = 0;
}

LodModel.prototype.getPrefixIndex = function(prefix) {
	for(var i=0; i<this.prefixes.length; i++) {
		//if(this.prefixes[i].startsWith(prefix+":")) return i; s.lastIndexOf(starter, 0)
		if(this.prefixes[i].lastIndexOf(prefix+":",0)===0) return i;
	}
	return -1;
}

LodModel.prototype.duplicateDataNodes = function() {
	var visitedNodes = [];
	for(var j=0; j<this.links.length; j++) {
		var isDatatype = false;
		for(var i=0; i<datatypePrefixes.length; i++) {
			if(datatypePrefixes[i]==this.links[j].end.prefix) isDatatype = true;
		}
		if(isDatatype) {
			if(visitedNodes.indexOf(this.links[j].end.id)>=0) {
				var nodeCopy = this.addNode(this.links[j].end.name, this.links[j].end.prefix, this.links[j].end.fromCSet);
				this.links[j].changeEnd(nodeCopy);
			}
			else {
				visitedNodes.push(this.links[j].end.id);
			}
		}
	}
}

LodModel.prototype.setExampleCount = function(count) {
	this.exampleCount = count;
}

LodModel.prototype.getSelectedNodeIndexes = function() {
	var indexes = [];
	for(var i=0; i<this.objectNodes.length; i++) {
		if(this.objectNodes[i].selected) indexes.push(this.objectNodes[i].id);
	}
	return indexes;
}

LodModel.prototype.addNode = function(name, prefix, fromCSet) {
	var node = new LodNode(name, prefix, this.idCounter++, fromCSet);
	this.nodes.push(node);
	this.objectNodes.push(node);
	return node;
}

LodModel.prototype.addLinkNode = function(name, prefix, fromCSet) {
	var node = new LodLinkNode(name, prefix, this.idCounter++, fromCSet);
	this.nodes.push(node);
	this.linkNodes.push(node);
	return node;
}

LodModel.prototype.addLink = function(name, prefix, start, end, fromCSet, frequency) {
	//if(start.id != end.id) {
		
		var existing = -1;
		for(var i=0; i<this.links.length; i++){
			if(this.links[i].start.id == start.id && this.links[i].end.id == end.id) {
				existing = i;
			}
			else if(this.links[i].start.id == end.id && this.links[i].end.id == start.id) {
				existing = -2;
			}
		}
		if(existing > -1) {
			this.links[existing].addLabel(name, prefix);
			this.links[existing].updateFrequency(frequency);
			if(this.links[existing].getLabelCount()>this.labelIndexLimit) 
				this.labelIndexLimit = this.links[existing].getLabelCount();
		}
		else if(existing == -1) this.links.push(new LodLink(name, prefix, start, end, this.idCounter++, fromCSet, this, frequency));
	//}
}

LodModel.prototype.addEdge = function(start, end, fromCSet, frequency)
{
	var edge = null;
	if(start.id != end.id)
	{
		edge = new LodEdge(start,end, this.idCounter++, fromCSet, frequency);
		this.edges.push(edge);
	}
	return edge;
}

LodModel.prototype.empty = function() {
	while(this.linkNodes.length){
		this.linkNodes.pop();
	}
	while(this.links.length) {
		this.links.pop();
	}
	while(this.edges.length) {
		this.edges.pop();
	}
	while(this.nodes.length) {
		this.nodes.pop();
	}
	while(this.prefixes.length) {
		this.prefixes.pop();
	}
};

LodModel.prototype.getObjectNode = function(id) {
	for(var i=0; i<this.objectNodes.length; i++) if(this.objectNodes[i].id == id) return this.objectNodes[i];
}

