function LodResource(name, prefix, id) {
	this.name = name;
	this.prefix = prefix;
	this.id = id;
}

LodResource.prototype.getName = function() {
	return this.prefix+":"+this.name;
}

function LodNode(name, prefix, id, fromCSet) {
	LodResource.call(this, name, prefix, id);
	this.fromCSet = fromCSet;
}

function LabelHolder() {
	this.labels = [];
}

LabelHolder.prototype.add = function(name, prefix) {
	this.labels.push(new LodResource(name, prefix, -1));
}

function LodLink(name, prefix, start, end, id, fromCSet) {
	//LodResource.call(this, name, prefix, id);
	this.labels = [];
	this.labels.push(new LodResource(name, prefix, -1));
	this.start = start;
	this.end = end;
	this.source = start;
	this.target = end;
	this.right = true;
	this.left = false;
	this.id = id;
	this.fromCSet = fromCSet;
	//this.freq = freq;
}

LodLink.prototype.addLabel = function(name, prefix) {
	this.labels.push(new LodResource(name, prefix, -1));
	//this.labelStore.add(name,prefix);
}

/*
LodLink.prototype.getName = function() {
	var name = "";
	for(var i=0; i<this.labels.length; i++) {
		name+="<tspan>"+this.labels[i].name+"</tspan>";
	}
	return name;
}*/

LodLink.prototype.getLabel = function(index) {
	if(index>=0 && index<this.labels.length) {
		return this.labels[index].getName();
	}
	else return "";
}

LodLink.prototype.getLabelY = function(index) {
	if(index>0 && index<this.labels.length) {
		return index;
	}
	else return 0;
}

LodNode.prototype = Object.create(LodResource.prototype);
//LodLink.prototype = Object.create(LodResource.prototype);

function LodModel() {
	this.links = [];
	this.nodes = [];
	this.prefixes = [];
	this.idCounter = 0;
	this.labelIndexLimit = 1;
	this.dataset = "";
}

LodModel.prototype.addNode = function(name, prefix, fromCSet) {
	this.nodes.push(new LodNode(name, prefix, this.idCounter++, fromCSet));
}

LodModel.prototype.addLink = function(name, prefix, start, end, fromCSet) {
	if(start.id != end.id) {
		
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
			if(this.links[existing].labels.length>this.labelIndexLimit) 
				this.labelIndexLimit = this.links[existing].labels.length;
		}
		else if(existing == -1) this.links.push(new LodLink(name, prefix, start, end, this.idCounter++, fromCSet));
	}
}

LodModel.prototype.empty = function() {
	while(this.links.length) {
		this.links.pop();
	}
	while(this.nodes.length) {
		this.nodes.pop();
	}
};

