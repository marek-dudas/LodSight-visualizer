//paths to server-side scripts
var modelStoreUrl = "http://localhost/lodsight-graph-creator/getgraph.php"; //"http://lod2-dev.vse.cz/lodsight-v2/graph-creator/getgraph.php http://localhost/lodsight-graph-creator/getgraph.php"; //"http://192.168.1.2/lodsight/getgraph.php"; //"http://admin:c0d1988@protegeserver.cz/couchdb";
var sparqlProxyUrl = "http://localhost/lodsight-graph-creator/sparql-proxy.php"; //"http://lod2-dev.vse.cz/lodsight-v2/graph-creator/sparql-proxy.php http://localhost/lodsight-graph-creator/sparql-proxy.php"; //"http://192.168.1.2/lodsight/sparql-proxy.php";

var datasetsUrl = "http://localhost/lodsight-graph-creator/getDatasets.php";


var pathExampleGeneratorUrl = "http://localhost/rdf-path-examples/generate-examples"; //deprecated, leave untouched
var debug = false;
var labelHeight = 14;
var exampleLimit = 5;
var layoutLinkDistance = 80; //80;
var layoutCharge = -1500; //-1500;
var datatypePrefixes = ["xsd", "rdf"];
var colorCodesCount = 10;
var exampleStringLength = 60;
var frequencyStepCount = 20;
var maxTextSize = 14;
var minTextSize = 11;
var defaultNodeWidth = 90; //90
var defaultNodeHeight = 25; //40
var maxEdgeWidth = 10;
var minEdgeWidth = 2;
var ticksToSetDefaultZoom = 80;