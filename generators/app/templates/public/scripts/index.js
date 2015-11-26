var engine;
var canvas;


<%- snippetCode %>

var showError = function (errorMessage) {
	console.error(errorMessage);	
}


var run = function () {
	try { 

		if (!BABYLON.Engine.isSupported()) {
			showError("Your browser does not support WebGL");
			return;
		}

		if (engine) {
			engine.dispose();
			engine = null;
		}

		canvas = document.getElementById("renderCanvas");
		engine = new BABYLON.Engine(canvas, true);


		var scene;

		if (createScene) { // createScene
			scene = createScene();
			if (!scene) {
				showError("createScene function must return a scene.");
				return;
			}
		} else if (CreateScene) { // CreateScene
			scene = CreateScene();
			if (!scene) {
				showError("CreateScene function must return a scene.");
				return;
			}
		} else if (createscene) { // createscene
			scene = createscene();
			if (!scene) {
				showError("createscene function must return a scene.");
				return;
			}

		} 
		
		if (engine.scenes.length === 0) {
			showError("You must at least create a scene.");
			return;
		}

		if (engine.scenes[0].activeCamera == null) {
			showError("You must at least create a camera.");
			return;
		}


		engine.runRenderLoop(function () {
			if (engine.scenes.length === 0) {
				return;
			}

			if (canvas.width !== canvas.clientWidth) {
				engine.resize();
			}

			var scene = engine.scenes[0];

			if (scene.activeCamera || scene.activeCameras.length > 0) {
				scene.render();
			}

		});

	} catch (e) {
		showError(e.message);
	}
};

window.addEventListener("resize", function () {
	if (engine) {
		engine.resize();
	}
});