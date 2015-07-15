LodLoader = {};

LodLoader.loadLodModel  = function(lodControl, _url) {
	var url = "";
	if(_url==null) url = this.createUrl();
	else url = _url;
	
	var target = document.getElementById('canvas');
	this.spinner = new Spinner().spin(target);

	require(["dojo/_base/xhr"],
		    function(xhr) {
//dojo.xhrGet({
		xhr.get({
    // The URL of the request
    url: url,
    // Handle the result as JSON data
    handleAs: "json",
    // The success handler
    load: function(jsonData) {
    	var lodModel = new LodModel();
    	lodModel.dataset = jsonData.dataset;
    	lodModel.endpoint = jsonData.endpoint;
    	lodModel.maxFrequency = Number(jsonData.maxFrequency);
        
    	for(var i=0; i<jsonData.entities.length; i++){
    		var node = jsonData.entities[i];
			lodModel.addNode(node.name, node.prefixcc, node.fromCSet);
		}
    	for(var i=0; i<jsonData.predicates.length; i++){
    		var pred = jsonData.predicates[i];
			lodModel.addPredicate(pred.name, pred.prefixcc, pred.id, pred.selected);
		}
    	for(var i=0; i<jsonData.links.length; i++){
    		var link = jsonData.links[i];
    		if(link.start<0 || link.start>lodModel.nodes.length || link.end<0 || link.end>lodModel.nodes.length) {
        		alert('error in json data on link '+link.prefix+link.name);
        	}
        	else lodModel.addLink(link.label.name, link.label.prefixcc, lodModel.nodes[link.start], lodModel.nodes[link.end], link.fromCSet, link.frequency);        	
    	}
    	
        lodModel.prefixes = jsonData.prefixes;
        lodModel.duplicateDataNodes();
        LodLoader.spinner.stop();
        lodControl.viewModel(lodModel);
    },
    // The error handler
    error: function() {
        alert('Error on loading the model.');
    }
		});
});
};

LodLoader.isSummaryIdSet = function() {
	return this.sumids != null && this.sumids.length > 0;
};

LodLoader.init = function() {	
	gup = function( name )
	{
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexPreproc = new RegExp("[\\?&]"+name+"=[^&#]*", "g");
	  var nameValPairs = window.location.href.match(regexPreproc);
	  
	  if(nameValPairs == null) return null;
	  
	  var results = [];
	  var regexS = "[\\?&]"+name+"=([^&#]*)";	  
	  var regex = new RegExp( regexS );
	  for(var i=0; i<nameValPairs.length; i++) {	
		  var varVal = regex.exec( nameValPairs[i] );
		  if(varVal != null) results.push(varVal[1]);
	  }
	  if( results.length == 0 )
	    return null;
	  else
	    return results;
	};
	
	this.sumids = gup('sumid');
	if(gup('minfreq')!=null) 
		this.setMinFreq(gup('minfreq')[0]);
	if(gup('maxfreq')!=null) 
		this.setMaxFreq(gup('maxfreq')[0]);
	this.predicates = null;
	this.namespaces = null;
};

LodLoader.setMinFreq = function(minfreq) {
	this.minfreq = Number(minfreq) - 1;
};

LodLoader.setMaxFreq = function(maxfreq) {
	this.maxfreq = Number(maxfreq);
};

LodLoader.setPredicates = function(predicates) {
	this.predicates = [];
	for(var i=0; i<predicates.length; i++) if(predicates[i].selected) this.predicates.push(predicates[i]);
}

LodLoader.setNamespaces = function(ns) {
	this.namespaces = [];
	for(var i=0; i<ns.length; i++) if(ns[i].selected) this.namespaces.push(ns[i]);
}
 
LodLoader.createUrl = function() {
	//return modelStoreUrl+"?sumid="+this.sumid+"&minfreq="+this.minfreq;
	var url = modelStoreUrl+"?";
	for(var i=0; i<this.sumids.length; i++) url += "sumid[]="+this.sumids[i]+"&";
	if(this.predicates != null) for(var i=0; i<this.predicates.length; i++) if(this.predicates[i].selected) url += "p[]="+this.predicates[i].id+"&";
	if(this.namespaces != null) for(var i=0; i<this.namespaces.length; i++) if(this.namespaces[i].selected) url += "ns[]="+this.namespaces[i].id+"&";
	url += "minfreq="+this.minfreq+"&maxfreq="+this.maxfreq;
	return url;
};