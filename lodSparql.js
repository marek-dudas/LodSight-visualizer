function LodSparqler(model)
{
	this.model = model;
	this.sparqler = new SPARQL.Service(sparqlProxyUrl, model.endpoint);
	this.sparqler.setMethod('GET');
	if(model.graph != null && model.graph != "") this.sparqler.addDefaultGraph(model.dataset); // inherited by all (future) queries
	for(var i=0; i<model.prefixes.length; i++)
	{
		var colonPos = model.prefixes[i].str.indexOf(":");
		var prefix = model.prefixes[i].str.substring(0,colonPos);
		var ns = model.prefixes[i].str.substring(colonPos+2);
		this.sparqler.setPrefix(prefix, ns);
	}
}

LodSparqler.prototype.countExamples = function(path, success) {
	var whereClause = "{";
	for(var i=0; i<path.links.length; i++) {
		var start = path.links[i].start;
		var end = path.links[i].end;
		whereClause += "?i"+start.id+" a "+start.getName()+" . ";
		if(!end.isDatatype()) whereClause += "?i"+end.id+" a "+end.getName()+" . ";
		whereClause += "?i"+start.id+" "+(path.links[i].getLabel(path.labelIndexes[i]))+" "+"?i"+end.id+" . ";
	}
	whereClause += "}"
		
	var selectQuery = "SELECT COUNT(*) AS ?pathCount WHERE "+whereClause;
	var query = this.sparqler.createQuery();
	query.query(selectQuery, {failure: function(){alert("Counting examples failed - query failure")}, 
		success: function(json) {
			if(json.results.bindings.length<1) {
				alert("counting examples failed - no results");
			}
			else success(json.results.bindings[0]["pathCount"].value);
		}});
}


LodSparqler.prototype.loadExamples = function(controller)
{
	for(var i=0; i<this.model.objectNodes.length; i++) this.model.objectNodes[i].examples = [];
	objectIndexes = this.model.getSelectedNodeIndexes();
	var whereClause = "{";
	for(var i=0; i<this.model.links.length; i++)	{
		var start = this.model.links[i].start;
		var end = this.model.links[i].end;
		if(start.selected && end.selected && (this.model.links[i].isSomeLabelSelected() || start != end)) {
			whereClause += "?i"+start.id+" a "+start.getName()+" . ";
			whereClause += "?i"+end.id+" a "+end.getName()+" . ";
			whereClause += "?i"+start.id+" "+(this.model.links[i].getSelectedLabel())+" "+"?i"+end.id+" . ";
			whereClause += "OPTIONAL { ?i"+start.id+" "+"<http://www.w3.org/2000/01/rdf-schema#label>"+" "+"?l"+start.id+" . ";
			whereClause += "?i"+end.id+" "+"<http://www.w3.org/2000/01/rdf-schema#label>"+" "+"?l"+end.id+" . }";
		}
	}
	whereClause += "}"
	var selectQuery = "SELECT * WHERE "+whereClause+" LIMIT "+exampleLimit;	
	var query = this.sparqler.createQuery();
	var model = this.model;
	query.query(selectQuery, {failure: function(){alert("Retrieving examples failed.")}, success: function(json) {
		model.setExampleCount(json.results.bindings.length);
		for(var j=0; j<json.results.bindings.length; j++) {
			var binding = json.results.bindings[j];
			for(var i=0; i<objectIndexes.length; i++) {
				var placeholder = "l"+objectIndexes[i];
				var uriPlaceholder = "i"+objectIndexes[i];
				if(!(placeholder in binding) || binding[placeholder].value=="") placeholder = uriPlaceholder;
				var value = "";
				if(placeholder in binding) value = binding[placeholder].value;
				var uri = null;
				if(uriPlaceholder in binding) uri = binding[uriPlaceholder].value;
				model.getObjectNode(objectIndexes[i]).addExample(value, uri);
			}
		}
		controller.updateView();
	}});
}
