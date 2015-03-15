function LodControl(view) {
	this.view = view;
	this.model = null;
	this.lodSparqler = null;
	this.selectedExampleIndex = 0;
}

LodControl.prototype.viewModel = function(model) {
	var isFirstLoad = true;
	if(this.model != null) {
		this.model.empty();
		this.view.updateView(this);
		isFirstLoad = false;
	}
	this.model = model;
	this.view.setData(this.model);
	this.updateView(isFirstLoad);
}

LodControl.prototype.updateView = function(controls) {
	this.view.updateView(this);
	if(controls) this.view.updateControls(this);
}

LodControl.prototype.loadModel = function(url) {
	if(this.model != null) {
		this.model.empty();
		this.updateView(false);
	}
	LodLoader.loadLodModel(this, url);
}

LodControl.prototype.getMaxFrequency = function() {
	if(this.model != null)	return this.model.maxFrequency;
	else return 1;
}

LodControl.prototype.getCurrentFrequency = function() {
	return LodLoader.minfreq;
}

LodControl.prototype.minFrequencyChaged = function(freq) {
	LodLoader.setMinFreq(freq);
	//this.loadModel(null);
}

LodControl.prototype.canvasMouseDown = function(location, node){
	
		//if(node!=null && this.model.nodes.indexOf(node)>=0) {
			if(node==null) this.deselectLinks();
			this.selectNode(node);
			this.view.updateView(this);
		//}
};

LodControl.prototype.deselectLinks = function() {
	for(var i=0; i<this.model.linkNodes.length; i++) {
		this.model.linkNodes[i].selectedLabelIndex = -1;
	}
}

LodControl.prototype.linkLabelClick = function(linkNode, clickedIndex) {
	if(clickedIndex<linkNode.labels.length)	
	{
		linkNode.selectedLabelIndex = clickedIndex;
		this.view.updateView(this);
	}
}

LodControl.prototype.selectNode = function(node) {
	if(node == null) {
		for(var i=0; i<this.model.nodes.length; i++){
			this.model.nodes[i].selected = false;
		}
		this.selectedNode = null;
	}
	if(node!=null) {
		node.selected = true;
		this.selectedNode = node;
	}
	else {
		this.selectedNode = null;
	}
};

LodControl.prototype.loadExamples = function() {
	if(this.lodSparqler==null)
	{
		if(this.model != null) this.lodSparqler = new LodSparqler(this.model);
	}
	if(this.lodSparqler!=null){
		this.lodSparqler.loadExamples(this);
	}
}

LodControl.prototype.changeExampleIndex = function() {
	this.selectedExampleIndex++;
	if(this.selectedExampleIndex>=this.model.exampleCount) this.selectedExampleIndex = 0;
	this.view.updateView(this);
}

LodControl.prototype.getPrefixColorCode = function(prefix) {
	var index = this.model.getPrefixIndex(prefix) % colorCodesCount;
	if(index<0 || index>colorCodesCount) index = 0;
	return index;
}

//ellipse a,b,x0,y0; line y=cx+d
function ellipseLineIntersection(a,b,x0,y0,c,d) {
	var eq = new Object();
	eq.a = b*b + a*a*c*c;
	eq.b = 2*a*a*c*d - 2*a*a*c*y0 - 2*b*b*x0;
	eq.c = b*b*x0*x0+a*a*y0*y0+d*d*a*a-a*a*b*b-2*a*a*d*y0;
	var D = eq.b*eq.b - 4*eq.a*eq.c;
	if(D<0) return null;
	else {
		var intersections = [];
		intersections[0] = new Object();
		intersections[1] = new Object();
		intersections[0].x = (-eq.b + Math.sqrt(D))/(2*eq.a);
		intersections[1].x = (-eq.b - Math.sqrt(D))/(2*eq.a);
		intersections[0].y = c*intersections[0].x+d;
		intersections[1].y = c*intersections[1].x+d;
		return intersections;
	}
}

function nearPoint(from, points) {
	if(points == null) return null;
	var minDist = Number.MAX_VALUE;
	var minIndex = 0;
	for(var i = 0, l = points.length; i<l; i++) {
		var dist = pointDistance(from, points[i]);
		if(dist<minDist) {
			minDist = dist;
			minIndex = i;
		}
	}
	return points[minIndex];
}

function pointDistance(a,b) {
	return Math.sqrt( Math.pow(b.x-a.x,2)+ Math.pow(b.y-a.y,2) );
}

//line y=cx+d
function lineEquation(start, end) {
	if((end.x-start.x)==0) return null;
	var lineEq = {};
	lineEq.c = (end.y-start.y)/(end.x-start.x);
	lineEq.d = (start.y - lineEq.c*start.x);
	return lineEq;
}

//ellipse a,b,x,y
function nearEllipseIntersection(ellipse,line, nearTo) {
	lineEq = lineEquation(line.start, line.end);
	if(lineEq == null) 
		{
			return null;
		}
	return nearPoint(nearTo, ellipseLineIntersection(ellipse.a, ellipse.b, ellipse.x, ellipse.y, lineEq.c, lineEq.d));
}

LodNode.prototype.linkIntersection = function(link, nearTo){
	var ellipse = {};
	ellipse.a = this.width/2;
	ellipse.b = this.height/2;
	ellipse.x = this.x;
	ellipse.y = this.y;
	return nearEllipseIntersection(ellipse, link, nearTo);
};

function RectanglePath(y, width, height) {
	return "M"+(-width/2)+","+(-height/2+y)+" l 0,"+(height)+" l "+width+",0 l 0,"+(-height)+" z";
}

function NodePath(width, height) {
	return "M"+(0)+","+(-height/2)+" a"+width/2+" "+height/2+" 0 1 0 1,0 z";	
}

function LinkNodePath(width, height) {
	return "M"+(-width/2)+","+(0)+" l "+width/2+","+height/2+" l "+width/2+","+(-height/2)+" l "+(-width/2)+","+(-height/2)+" z"; 
}

LodNode.prototype.getPathData = function() {
	this.width=defaultNodeWidth;
	this.height=defaultNodeHeight;
	return NodePath(this.width, this.height);
};

LodLinkNode.prototype.getPathData = function() {
	this.width=120;
	this.height=this.labels.length*labelHeight;
	return LinkNodePath(this.width, this.height);
};

String.prototype.visualLength = function()
{
    var ruler = document.getElementById("ruler");
    ruler.innerHtml = this;
    ruler.textContent = this;
    return ruler.offsetWidth;
}

String.prototype.shortenTo = function(maxChars) {
	if(this.length>maxChars) {
		var partLength = (maxChars-3)/2.0;
		return this.substring(0, partLength) + "..." + this.substring(this.length-partLength);
	}
	else return this;
}

LodLinkNode.prototype.getLabelY = function(index) {
	return (index-this.labels.length/2.0)*labelHeight+(labelHeight/4.0);
}

LodLinkNode.prototype.getLabelBoundingPath = function(index, width) {
	var y = this.getLabelY(index); //(index-this.labels.length/2.0)*labelHeight + labelHeight/2;
	if(width>0) return RectanglePath(y, width, labelHeight);
	else return "";
}

//rayEq: y=cx+d
function rayLineIntersection(rayStart, rayEq, lineStart, lineEnd) {
	lineEq = lineEquation(lineStart, lineEnd);
	var point = {};
	lineVec = {};
	if(lineEq!=null){
		if(rayEq==null){
			point.x = rayStart.x;
			point.y = lineEq.c*rayStart.x+lineEq.d;
		}
		if((lineEq.c - rayEq.d)==0) return null;
		point.x = (rayEq.d - lineEq.d) / (lineEq.c - rayEq.c);
		point.y = rayEq.c*point.x+rayEq.d;
	}
	else{
		if(rayEq==null) return null;
		point.x = lineStart.x;
		point.y = rayEq.c*point.x+rayEq.d;
	}
	lineVec.x = lineEnd.x - lineStart.x;
	lineVec.y = lineEnd.y - lineStart.y;
	var k = -1;
	if(lineVec.x!=0) k = (point.x - lineStart.x) / lineVec.x;
	else if(lineVec.y!=0) k = (point.y - lineStart.y) / lineVec.y;
	if(k<0 || k>1) return null;
	return point;
}

function Point(x,y) {
	this.x = x;
	this.y = y;
}

function Line(start, end) {
	this.start = start;
	this.end = end;
}

LodEdge.prototype.countEndFromIntersection = function() {
	var intersection = this.end.linkIntersection(this, this.start);
	this.endX = intersection.x;
	this.endY = intersection.y;
};

LodEdge.prototype.countStartFromIntersection = function() {
	var intersection = this.start.linkIntersection(this, this.end);
	this.startX = intersection.x;
	this.startY = intersection.y;
};

/*
LodLink.prototype.getMiddlePoint = function() {
	lineVec = new Point();
	lineVec.x = this.end.x - this.start.x;
	lineVec.y = this.end.y - this.start.y;
	middle = new Point();
	middle.x = this.start.x + 0.5*lineVec.x;
	middle.y = this.start.y + 0.5*lineVec.y;
	return middle;
};*/

LodLinkNode.prototype.getMiddlePoint = function() {
	return new Point(this.x, this.y);
}