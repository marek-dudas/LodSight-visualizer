function LodControl(view) {
	this.view = view;
	this.model = null;
}

LodControl.prototype.viewModel = function(model) {
	if(this.model != null) {
		this.model.empty();
		this.view.updateView();
	}
	this.model = model;
	this.view.setData(this.model);
	this.view.updateView();
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


function NodePath(width, height) {
	return "M"+(0)+","+(-height/2)+" a"+width/2+" "+height/2+" 0 1 0 1,0 z";	
}

LodNode.prototype.getPathData = function() {
	this.width=90;
	this.height=40;
	return NodePath(this.width, this.height);
};

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

LodLink.prototype.countEndFromIntersection = function() {
	var intersection = this.end.linkIntersection(this, this.start);
	this.endX = intersection.x;
	this.endY = intersection.y;
};

LodLink.prototype.countStartFromIntersection = function() {
	var intersection = this.start.linkIntersection(this, this.end);
	this.startX = intersection.x;
	this.startY = intersection.y;
};

LodLink.prototype.getMiddlePoint = function() {
	lineVec = new Point();
	lineVec.x = this.end.x - this.start.x;
	lineVec.y = this.end.y - this.start.y;
	middle = new Point();
	middle.x = this.start.x + 0.5*lineVec.x;
	middle.y = this.start.y + 0.5*lineVec.y;
	return middle;
};