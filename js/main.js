
// ---------------------------------------
// three.js Setup
// ---------------------------------------
var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( , window.innerWidth / window.innerHeight, 0.1, 1000 );

var cameraZoomFactor = 16;

var sceneWidth = window.innerWidth / cameraZoomFactor;
var sceneHeight = window.innerHeight / cameraZoomFactor;

var camera = new THREE.OrthographicCamera(window.innerWidth / -cameraZoomFactor, 
										  window.innerWidth / cameraZoomFactor, 
										  window.innerHeight / cameraZoomFactor, 
										  window.innerHeight / -cameraZoomFactor, 
										  -200, 500);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.x = 2;
camera.position.y = 1;
camera.position.z = 3;

camera.lookAt(scene.position);

// ---------------------------------------
// three.js Render Loop
// ---------------------------------------

var tradeVisuals = [];

function render() {

	var visualsToRemove = [];

	console.log("total visuals");
	console.log(tradeVisuals.length);

	for (var idx = 0; idx < tradeVisuals.length; idx++) {
		tradeVisual = tradeVisuals[idx];
		// tradeVisual.rotation.x += tradeVisual.userData.moveY;
		// tradeVisual.rotation.y += tradeVisual.userData.moveY;

		tradeVisual.position.y += tradeVisual.userData.moveY;

		if (tradeVisual.position.y > sceneHeight || tradeVisual.position.y < -sceneHeight) {
			visualsToRemove.push(tradeVisual);
		}
	}

	// remove cubes from array
	for (var idx = 0; idx < visualsToRemove.length; idx++) {
		var visualToRemove = visualsToRemove[idx];
		var index = tradeVisuals.indexOf(visualToRemove);
		if (index > -1) {
    		tradeVisuals.splice(index, 1);
    		scene.remove(visualToRemove);
		}
	}

	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

render();

// ---------------------------------------
// Poloniex API Connection with Autobahn
// ---------------------------------------

var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});
 
connection.onopen = function (session) {

        function marketEvent (args, kwargs) {

            var eventLength = args.length;

            for (var i = 0; i < eventLength; i++) {
            	
            	var marketEvent = args[i];

            	console.log(marketEvent);

            	if (marketEvent.type === "newTrade") {
            		console.log(marketEvent);
            		var tradeData = marketEvent.data;
            		tradeCompleted(tradeData);
            	} else if (marketEvent.type === "orderBookModify") {
            		var orderData = marketEvent.data;
            		orderPlaced(orderData);
            	}
            }
        }

        function tickerEvent (args, kwargs) {
            console.log(args);
        }

        function trollboxEvent (args, kwargs) {
            console.log(args);
        }

        session.subscribe('BTC_ETH', marketEvent);
        // session.subscribe('ticker', tickerEvent);
        // session.subscribe('trollbox', trollboxEvent);
}
 
connection.onclose = function () {
	console.log("Websocket connection closed");
}
                       
connection.open();

// ---------------------------------------
// 
// ---------------------------------------

function tradeCompleted(tradeData) {

	var tradeDataType = tradeData.type;
	var tradeID = tradeData.tradeID;
	var amount = tradeData.amount;

	console.log(amount);

	var cubeColor;
	var y;
	var moveY;

	if (tradeDataType === "buy") {
		cubeColor = 0x00ff00;
		var y = -sceneHeight;
		moveY = 0.5
	} else if (tradeDataType === "sell") {
		cubeColor = 0xff0000;
		var y = sceneHeight;
		moveY = -0.5
	}

	var material = new THREE.MeshBasicMaterial( 
		{ color: cubeColor } 
	);

	var geometryScale = cameraZoomFactor * amount
	geometryScale = clamp(geometryScale, 8.0, 32.0)
	var geometry = new THREE.BoxGeometry(geometryScale, geometryScale, geometryScale);
	
	var cube = new THREE.Mesh(geometry, material);
	cube.name = tradeID;

	var x = sceneWidth * 2.0 * Math.random() - sceneWidth;

	tradeVisuals.push(cube);
	scene.add(cube);

	cube.userData.moveY = moveY;
	cube.position.x = x;
	cube.position.y = y;
}

function orderPlaced(orderData) {
	var orderBookType = orderData.type;
	var amount = orderData.amount;

	var sphereColor;
	var y;
	var moveY;

	if (orderBookType === 'bid') {
		sphereColor = 0x00ff00;
		y = -sceneHeight;
		moveY = 1.0;
	} else if (orderBookType === 'ask') {
		sphereColor = 0xff0000;
		y = sceneHeight;
		moveY = -1.0;
	}

	var x = sceneWidth * 2.0 * Math.random() - sceneWidth;

	var material = new THREE.MeshBasicMaterial( 
		{ color: sphereColor } 
	);

	var geometryScale = cameraZoomFactor / 2.0 * amount;
	geometryScale = clamp(geometryScale, 4.0, 16.0);
	var geometry = new THREE.SphereGeometry(geometryScale, 8, 6);

	var sphere = new THREE.Mesh(geometry, material);

	tradeVisuals.push(sphere);
	scene.add(sphere);

	sphere.userData.moveY = moveY;
	sphere.position.y = y;
	sphere.position.x = x;
}

function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}
