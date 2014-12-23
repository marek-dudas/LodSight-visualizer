
function loadLodModel(url, lodControl) {	
dojo.xhrGet({
    // The URL of the request
    url: url,
    // Handle the result as JSON data
    handleAs: "json",
    // The success handler
    load: function(jsonData) {
    	var lodModel = new LodModel();
    	lodModel.dataset = jsonData.dataset;
        jsonData.entities.forEach(function(node){
        			lodModel.addNode(node.name, node.prefixcc, node.fromCSet);
        		});
        jsonData.links.forEach(function(link){
        	if(link.start<0 || link.start>lodModel.nodes.length || link.end<0 || link.end>lodModel.nodes.length) {
        		alert('error in json data on link '+link.prefix+link.name);
        	}
        	else lodModel.addLink(link.label.name, link.label.prefixcc, lodModel.nodes[link.start], lodModel.nodes[link.end], link.fromCSet);
        	
        })
        lodModel.prefixes = jsonData.prefixes;
        lodControl.viewModel(lodModel);
    },
    // The error handler
    error: function() {
        alert('general major Error does not like the json');
    }
});
}
 