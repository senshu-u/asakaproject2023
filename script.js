import * as THREE from "three";
import CameraControls from "camera-controls";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {MapData} from "./mapData.js";
import {MapInfoIcon} from "./mapInfoIcon.js";

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/asakaproject2023/service-worker.js')
			.then(registration => {
				console.log('Service Worker registered with scope:', registration.scope);
			}, err => {
				console.log('Service Worker registration failed:', err);
			});
	});
}

CameraControls.install({THREE: THREE});

// レンダラーの作成
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});
let rendererWidth = null;
let rendererHeight = null;

// カメラの作成と設定
const cameras = [
	new THREE.PerspectiveCamera(),
	new THREE.OrthographicCamera()
];
cameras[0].fov = 40;
cameras[0].near = 0.1;
cameras[0].far = 2000;

// 平行投影カメラの視錐台の大きさを決める倍率
// この値をrendererの大きさにかけて平行投影カメラの視錐台の大きさを決めている
const cameraFrustumSize = 0.005;
cameras[1].near = 0.1;
cameras[1].far = 2000;

const mapArea = document.getElementById("mapArea");
const headerArea = document.getElementById("headerArea");

// レンダラーとカメラのサイズの初期化
resize();

// camera-controlsの作成と設定
const clock = new THREE.Clock();
const cameraControls = [
	new CameraControls(cameras[0], mapArea),
	new CameraControls(cameras[1], mapArea)
];

cameraControls[0].mouseButtons.left = CameraControls.ACTION.OFFSET;
cameraControls[0].mouseButtons.right = CameraControls.ACTION.ROTATE;
cameraControls[0].mouseButtons.wheel = CameraControls.ACTION.DOLLY;
cameraControls[0].mouseButtons.middle = CameraControls.ACTION.ROTATE;
cameraControls[0].touches.one = CameraControls.ACTION.TOUCH_OFFSET;
cameraControls[0].touches.two = CameraControls.ACTION.TOUCH_DOLLY_ROTATE;
cameraControls[0].dollySpeed = 0.5;
cameraControls[0].minDistance = 50;
cameraControls[0].maxDistance = 300;
cameraControls[0].maxPolarAngle = THREE.MathUtils.degToRad(80);

cameraControls[1].mouseButtons.left = CameraControls.ACTION.OFFSET;
cameraControls[1].mouseButtons.right = CameraControls.ACTION.NONE;
cameraControls[1].mouseButtons.wheel = CameraControls.ACTION.ZOOM;
cameraControls[1].mouseButtons.middle = CameraControls.ACTION.NONE;
cameraControls[1].touches.one = CameraControls.ACTION.TOUCH_OFFSET;
cameraControls[1].touches.two = CameraControls.ACTION.TOUCH_ZOOM;
cameraControls[1].dollySpeed = 5.0;
cameraControls[1].minZoom = 1;
cameraControls[1].maxZoom = 10;

// cameraModeで透視投影カメラと平行投影カメラを切り替える
// 透視投影カメラ: 0
// 平行投影カメラ: 1
let cameraMode = 0;

// シーンを格納する連想配列の作成
let scenes = {};
// currentSceneNameにはレンダリング中のscene名が入る
let currentSceneName = null;

// mapModeには表示しているマップの状態を入れる
// 全体マップ: 0
// 館内マップ: 1
// フロアマップ: 2
let mapMode = 0;

// マップが遷移済みか遷移中かのフラグ
let isTransitionedMap = true;
transitionMap("全体マップ");

// レンダーループ
renderer.setAnimationLoop(animation);

// この関数をループさせている
function animation() {
	// カメラの位置と向きを更新
	const delta = clock.getDelta();
	const hasControlsUpdated = cameraControls[cameraMode].update(delta);

	// レンダリング
	renderer.render(scenes[currentSceneName], cameras[cameraMode]);

	if (hasControlsUpdated) {
		// 教室名やアイコンなどをマップのオブジェクトに付ける関数
		setMapInfoPosition();
	}
	
	if (primaryPointerId && mapMode == 1) {
		const scale = 0.01;
		const currentCameraPositionY = prevCameraPosition.y + scale * deltaPointerCoords[primaryPointerId]["y"];
		const currentTargetPositionY = prevTargetPosition.y + scale * deltaPointerCoords[primaryPointerId]["y"];
		cameraControls[cameraMode].setTarget(prevTargetPosition.x, currentTargetPositionY, prevTargetPosition.z, false);
		cameraControls[cameraMode].setPosition(prevCameraPosition.x, currentCameraPositionY, prevCameraPosition.z, false);
	}
	
	// console.log(cameras[cameraMode].zoom);
	// let cameraPosition = cameras[cameraMode].position.x + ", " + cameras[cameraMode].position.y + ", " + cameras[cameraMode].position.z;
	// document.getElementById("mapName").textContent = cameraPosition;
}

// 教室名やアイコンなどをマップのオブジェクトに付ける関数
function setMapInfoPosition() {
	if (document.querySelector("#mapNav .current")) {
		const currentMapName = document.querySelector("#mapNav .current").textContent;
		let mapObjCoords = [];

		// すべてのmapInfoの座標を取得する
		for (let mapInfo of document.getElementsByClassName("mapInfo")) {
			const mapObj = scenes[currentSceneName].getObjectByName(currentMapName).getObjectByName(mapInfo.dataset.mapObj);
			if (mapObj) {
				// 引数の名前のオブジェクトのcanvas上のx座標とy座標を返す関数
				let [x, y, z] = getMapObjectCoord(mapObj);
				
				let mapObjCoord = {
					"name": mapObj.name,
					"x": x,
					"y": y,
					"z": z
				};

				mapObjCoords.push(mapObjCoord);
			}
		}

		mapObjCoords.sort(function(first, second) {
			return second.z - first.z;
		});

		let layer = 1;
		for (let mapObjCoord of mapObjCoords) {
			const selector = "[data-map-obj=\"" + mapObjCoord.name + "\"]";
			const mapInfo = document.querySelector(selector);
			mapInfo.classList.toggle("hidden", mapObjCoord.z >= 1);
			let x = (rendererWidth / 2) * (mapObjCoord.x + 1);
			let y = (rendererHeight / 2) * -(mapObjCoord.y - 1);
			if (mapInfo.classList.contains("buildingInfo")) {
				x = x - mapInfo.getBoundingClientRect().width / 2;
				y = y - (mapInfo.getBoundingClientRect().height + 6);
			} else {
				x = x - mapInfo.getBoundingClientRect().width / 2;
				y = y - mapInfo.getBoundingClientRect().height / 2;
			}
			mapInfo.style.left = x + "px";
			mapInfo.style.top = y + "px";
			mapInfo.style.zIndex = layer++;
		}
	}
}

// 引数の名前のオブジェクトのcanvas上のx座標とy座標を返す関数
function getMapObjectCoord(target) {	
	const targetWorldPosition = target.getWorldPosition(new THREE.Vector3());
	const targetCameraNDC = targetWorldPosition.project(cameras[cameraMode]);
	
	return [targetCameraNDC.x, targetCameraNDC.y, targetCameraNDC.z];
}

// 教室名やアイコンなどを作る関数
function createMapInfo(maps) {
	const mapInfoIcon = new MapInfoIcon();
	const icons = mapInfoIcon.icons;
	const iconsForBuilding = mapInfoIcon.iconsForBuilding;

	switch (mapMode) {
		case 0:
			for (let mapObj of maps[0].children) {
				const mapObjName = mapObj.name.normalize("NFKC");
				const splitMapObjName = mapObjName.split("_");

				if (splitMapObjName[0] != "object") {
					if (Object.keys(icons).includes(splitMapObjName[0])) {
						// アイコンを作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("icon");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.filterItem = icons[splitMapObjName[0]]["filterItem"];

						if (icons[splitMapObjName[0]]["shouldShowMapObjName"]) {
							mapInfo.textContent = splitMapObjName[0];
						}
						const icon = document.createElement("img");
						icon.src = mapInfoIcon.iconPath + icons[splitMapObjName[0]]["fileName"];
						icon.alt = splitMapObjName[0];
						icon.height = 20;

						mapInfo.prepend(icon);
						mapArea.append(mapInfo);
					} else {
						// 建物の情報を作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("buildingInfo");
						mapInfo.classList.add("destinationName");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.destination = mapObjName;

						const name = document.createElement("div");
						name.classList.add("name");
						name.textContent = splitMapObjName[0];

						const buildingIconList = document.createElement("div");
						buildingIconList.classList.add("buildingIconList");
						if (Object.keys(iconsForBuilding).includes(mapObjName)) {
							for (let iconForMapObjName of iconsForBuilding[mapObjName]) {
								const iconWrapper = document.createElement("div");
								iconWrapper.classList.add("icon");
								iconWrapper.dataset.filterItem = iconForMapObjName["filterItem"];

								const icon = document.createElement("img");
								icon.src = mapInfoIcon.iconPath + iconForMapObjName["fileName"];
								icon.alt = iconForMapObjName["filterItem"];
								icon.height = 20;

								iconWrapper.append(icon)
								buildingIconList.append(iconWrapper);
							}
						}

						mapInfo.append(name, buildingIconList);
						mapArea.append(mapInfo);
					}
				}
			}
			break;

		case 1:
			for (let map of maps) {
				for (let mapObj of map.children) {
					const mapObjName = mapObj.name.normalize("NFKC");
					const splitMapObjName = mapObjName.split("_");

					if (splitMapObjName[0] != "object") {
						if (Object.keys(icons).includes(splitMapObjName[0])) {
							if (icons[splitMapObjName[0]]["filterItem"]) {
								// アイコンを作る
								const mapInfo = document.createElement("div");
								mapInfo.classList.add("mapInfo");
								mapInfo.classList.add("icon");
								mapInfo.dataset.mapObj = mapObj.name;
								mapInfo.dataset.filterItem = icons[splitMapObjName[0]]["filterItem"];

								const icon = document.createElement("img");
								icon.src = mapInfoIcon.iconPath + icons[splitMapObjName[0]]["fileName"];
								icon.alt = splitMapObjName[0];
								icon.height = 20;

								mapInfo.prepend(icon);
								mapArea.append(mapInfo);
							}
						}
					}
				}
			}
			break;

		case 2:
			for (let mapObj of maps[0].children) {
				const mapObjName = mapObj.name.normalize("NFKC");
				const splitMapObjName = mapObjName.split("_");

				if (splitMapObjName[0] != "object") {
					if (splitMapObjName[0] == "transitionTo") {
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("destinationName");
						mapInfo.dataset.mapObj = mapObj.name;
						if (splitMapObjName[1] == "全体マップ") {
							const destinationName = document.createElement("div");
							destinationName.textContent = "出入口";
							mapInfo.append(destinationName);
							mapInfo.dataset.destination = splitMapObjName[1];
						} else {
							for (let i = 1; i <= 2; i++) {
								const destinationName = document.createElement("div");
								destinationName.textContent = splitMapObjName[i];
								if (i == 2) destinationName.classList.add("floor");
								mapInfo.append(destinationName);
							}
							mapInfo.dataset.destination = splitMapObjName[1] + "_" + splitMapObjName[2];
						}
						mapArea.append(mapInfo);
					} else if (Object.keys(icons).includes(splitMapObjName[0])) {
						// アイコンを作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("icon");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.filterItem = icons[splitMapObjName[0]]["filterItem"];

						if (icons[splitMapObjName[0]]["shouldShowMapObjName"]) {
							mapInfo.textContent = splitMapObjName[0];
						}
						const icon = document.createElement("img");
						icon.src = mapInfoIcon.iconPath + icons[splitMapObjName[0]]["fileName"];
						icon.alt = splitMapObjName[0];
						icon.height = 20;

						mapInfo.prepend(icon);
						mapArea.append(mapInfo);
					} else {
						// 教室名を作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("name");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.textContent = splitMapObjName[0];
						mapArea.append(mapInfo);
					}
				}
			}
			break;
	}
	setMapInfoPosition();
}

// すべてのマップ上の情報を削除する関数
function removeMapInfo() {
	while (document.getElementsByClassName("mapInfo").length > 0) {
		document.getElementsByClassName("mapInfo")[0].remove();
	}
}

function getMapsInCurrentScene(mapName = null) {
	let maps = [];
	for (let sceneChild of scenes[currentSceneName].children) {
		if (!sceneChild.isLight) {
			if (typeof mapName == "string") {
				if (sceneChild.name == mapName) {
					maps.push(sceneChild);
				}
			} else {
				maps.push(sceneChild);
			}
		}
	}
	return maps;
}

let floorPositionsY = {};

async function switchScene(mapName) {
	if (Object.keys(scenes).includes(mapName)) {
		currentSceneName = mapName;
	} else {
		const mapData = new MapData();
		const extractedMaps = mapData.extractMapsByMapName(mapName);

		if (Object.keys(extractedMaps).length > 0) {
			currentSceneName = mapName;
			// シーンの作成と設定
			scenes[currentSceneName] = new THREE.Scene();
			scenes[currentSceneName].name = mapName;
			scenes[currentSceneName].background = new THREE.Color(0x999a9c);

			// ライトの作成と設定
			const ambientLight = new THREE.AmbientLight(0x808080, 0.8);
			scenes[currentSceneName].add(ambientLight);

			const frontLeftLight = new THREE.DirectionalLight(0xffffff, 0.7);
			frontLeftLight.position.set(-1, 1, 1);
			scenes[currentSceneName].add(frontLeftLight);

			const backRightLight = new THREE.DirectionalLight(0xffffff, 0.7);
			backRightLight.position.set(1, 1, -1);
			scenes[currentSceneName].add(backRightLight);
			
			await loadMap(extractedMaps);
		} else {
			throw new Error(mapName + "のマップデータはありません");
		}
	}
	for (let key in floorPositionsY) {
		delete floorPositionsY[key];
	}
	for (let map of getMapsInCurrentScene()) {
		floorPositionsY[map.name] = map.position.y;
	}
}

// 引数の連想配列から3Dモデルを読み込む関数
async function loadMap(maps) {
	const loader = new GLTFLoader();
	const distance = 1.5;

	let count = 0;
	for (let fileName in maps) {
		const mapDataPath = maps[fileName]["dirPath"] + fileName;
		const glb = await loader.loadAsync(mapDataPath);
		const map = glb.scene;

		// 読み込んだ3Dモデルに名前を付ける
		if (maps[fileName]["floor"]) {
			// 階のあるマップの場合は階の名前を付ける
			map.name = maps[fileName]["floor"];
		} else {
			// 階のないマップの場合はマップ名をそのまま付ける
			map.name = maps[fileName]["mapName"];
		}
		map.position.set(0, count * distance, 0);

		scenes[currentSceneName].add(map);
		count++;
	}
}

async function moveCameraTo(floorName = null) {
	if (floorName) {
		if (Object.keys(floorPositionsY).includes(floorName)) {
			for (let map of getMapsInCurrentScene()) {
				if (map.name == floorName) {
					map.visible = true;
				} else {
					map.visible = false;
				}
			}
			cameraControls[cameraMode].setFocalOffset(0, 0, 0, true);
			cameraControls[cameraMode].zoomTo(2, true);
			await cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0), true);
		} else {
			throw new Error(floorName + "のマップデータはありません");
		}

	} else {
		for (let map of getMapsInCurrentScene()) {
			if (!map.visible) {
				map.visible = true;
			}
		}
		cameraControls[cameraMode].setFocalOffset(0, 0, 0, true);
		cameraControls[cameraMode].zoomTo(1, true);
		await cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(135), THREE.MathUtils.degToRad(55), true);
	}
}

// 3Dモデルのクリックの設定
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const mapNav = document.getElementById("mapNav");
mapNav.addEventListener("click", function(event) {
	if (event.target.classList.contains("mapName") && !event.target.classList.contains("current")) {
		transitionMap(event.target.textContent);
	}
});

function updateMapNav(prevMapMode, mapName) {
	const mapNameElement = document.createElement("div");
	mapNameElement.classList.add("mapName");
	mapNameElement.textContent = mapName;
	const separatorElement = document.createElement("div");
	separatorElement.classList.add("separator");
	separatorElement.textContent = "/";

	switch (mapMode) {
		case 0:
			while (mapNav.children.length > 0) {
				mapNav.lastElementChild.remove();
			}
			mapNav.append(mapNameElement);
			mapNav.style.top = "0px";
			break;

		case 1:
			switch (prevMapMode) {
				case 0:
					mapNav.append(separatorElement, mapNameElement);
					break;

				case 1:
					for (let count = 0; count < prevMapMode; count++) {
						mapNav.lastElementChild.remove();
					}
					mapNav.append(mapNameElement);
					break;

				case 2:
					for (let count = 0; count < prevMapMode; count++) {
						mapNav.lastElementChild.remove();
					}
					break;
			}
			mapNav.style.top = headerArea.getBoundingClientRect().height + "px";
			break;

		case 2:
			mapNameElement.classList.add("floor");
			mapNav.append(separatorElement, mapNameElement);
			mapNav.style.top = headerArea.getBoundingClientRect().height + "px";
			break;
	}

	for (let i = 0; i < mapNav.children.length; i++) {
		mapNav.children[i].classList.toggle("current", i == mapNav.children.length - 1);
	}
}

// 引数に指定されたマップに遷移する関数
async function transitionMap(mapNames) {
	if (isTransitionedMap) {
		isTransitionedMap = false;

		let mapName = mapNames;
		if (Array.isArray(mapNames)) {
			mapName = mapNames.shift();
		}

		if (mapName) {
			cameraControls[cameraMode].enabled = false;
			removeMapInfo();
			let prevMapMode = mapMode;

			switch (mapMode) {
				case 0:
					await switchScene(mapName).then(function() {
						if (mapName == "全体マップ") {
							// 全体マップから全体マップに
							cameraMode = 0;
							mapMode = 0;
							
							cameraControls[cameraMode].enabled = true;
							cameraControls[cameraMode].setTarget(0, 0, 0, false);
							cameraControls[cameraMode].dollyTo(275, false);
							cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
							cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
							cameraControls[cameraMode].zoomTo(1, false);
							
							mapRotationBtn.classList.add("hidden");
							updateMapNav(prevMapMode, mapName);
							createMapInfo(getMapsInCurrentScene());
						} else {
							// 全体マップから館内マップに
							cameraMode = 1;
							mapMode = 1;

							cameraControls[cameraMode].enabled = false;
							cameraControls[cameraMode].setTarget(0, 0, 0, false);
							cameraControls[cameraMode].dollyTo(100, false);
							cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(135), THREE.MathUtils.degToRad(55), false);
							cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
							cameraControls[cameraMode].zoomTo(1, false);

							for (let map of getMapsInCurrentScene()) {
								if (!map.visible) {
									map.visible = true;
								}
							}

							mapRotationBtn.classList.add("hidden");
							updateMapNav(prevMapMode, mapName);
							createMapInfo(getMapsInCurrentScene());
						}
					}).catch(function(error) {
						console.log(error);
						createMapInfo(getMapsInCurrentScene());
						cameraControls[cameraMode].enabled = true;
					});
					break;

				case 1:
					if (Object.keys(floorPositionsY).includes(mapName)) {
						await moveCameraTo(mapName).then(function() {
							// 館内マップからフロアマップに
							cameraMode = 1;
							mapMode = 2;

							cameraControls[cameraMode].enabled = true;

							mapRotationBtn.classList.remove("hidden");
							updateMapNav(prevMapMode, mapName);
							createMapInfo(getMapsInCurrentScene(mapName));

						}).catch(function(error) {
							console.log(error);
							createMapInfo(getMapsInCurrentScene());
							cameraControls[cameraMode].enabled = false;
						});
					} else {
						await switchScene(mapName).then(function() {
							if (mapName == "全体マップ") {
								// 館内マップから全体マップに
								cameraMode = 0;
								mapMode = 0;
								
								cameraControls[cameraMode].enabled = true;
								cameraControls[cameraMode].setTarget(0, 0, 0, false);
								cameraControls[cameraMode].dollyTo(275, false);
								cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
								cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
								cameraControls[cameraMode].zoomTo(1, false);

								mapRotationBtn.classList.add("hidden");
								updateMapNav(prevMapMode, mapName);
								createMapInfo(getMapsInCurrentScene());
							} else {
								// 館内マップから別の館内マップに
								cameraMode = 1;
								mapMode = 1;

								cameraControls[cameraMode].enabled = false;
								cameraControls[cameraMode].setTarget(0, 0, 0, false);
								cameraControls[cameraMode].dollyTo(100, false);
								cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(135), THREE.MathUtils.degToRad(55), false);
								cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
								cameraControls[cameraMode].zoomTo(1, false);

								for (let map of getMapsInCurrentScene()) {
									if (!map.visible) {
										map.visible = true;
									}
								}

								mapRotationBtn.classList.add("hidden");
								updateMapNav(prevMapMode, mapName);
								createMapInfo(getMapsInCurrentScene());
							}
						}).catch(function(error) {
							console.log(error);
							createMapInfo(getMapsInCurrentScene());
							cameraControls[cameraMode].enabled = false;
						});
					}
					break;
					
				case 2:
					if (mapName == currentSceneName) {
						await moveCameraTo().then(function() {
							// フロアマップから館内マップに
							cameraMode = 1;
							mapMode = 1;

							cameraControls[cameraMode].enabled = false;

							mapRotationBtn.classList.add("hidden");
							updateMapNav(prevMapMode, mapName);
							createMapInfo(getMapsInCurrentScene());
						});
					} else {
						await switchScene(mapName).then(function() {
							if (mapName == "全体マップ") {
								// フロアマップから全体マップに
								cameraMode = 0;
								mapMode = 0;

								cameraControls[cameraMode].enabled = true;
								cameraControls[cameraMode].setTarget(0, 0, 0, false);
								cameraControls[cameraMode].dollyTo(275, false);
								cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
								cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
								cameraControls[cameraMode].zoomTo(1, false);

								mapRotationBtn.classList.add("hidden");
								updateMapNav(prevMapMode, mapName);
								createMapInfo(getMapsInCurrentScene());
							} else {
								// フロアマップから別の館内マップに
								cameraMode = 1;
								mapMode = 1;

								cameraControls[cameraMode].enabled = false;
								cameraControls[cameraMode].setTarget(0, 0, 0, false);
								cameraControls[cameraMode].dollyTo(100, false);
								cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(135), THREE.MathUtils.degToRad(55), false);
								cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
								cameraControls[cameraMode].zoomTo(1, false);

								for (let map of getMapsInCurrentScene()) {
									if (!map.visible) {
										map.visible = true;
									}
								}

								mapRotationBtn.classList.add("hidden");
								updateMapNav(prevMapMode, mapName);
								prevMapMode = mapMode;
								updateMapNav(prevMapMode, mapName);
								createMapInfo(getMapsInCurrentScene());
							}
						}).catch(function(error) {
							console.log(error);
							const currentMapName = document.querySelector("#mapNav .current").textContent;
							createMapInfo(getMapsInCurrentScene(currentMapName));
							cameraControls[cameraMode].enabled = true;
						});
					}
					break;
			}
		}
		isTransitionedMap = true;
		if (Array.isArray(mapNames) && mapNames.length > 0) {
			transitionMap(mapNames);
		}
	}
}

// 画面のリサイズ
window.addEventListener("resize", resize);

function resize() {
	// レンダラーのサイズの設定
	rendererWidth = window.innerWidth;
	rendererHeight = window.innerHeight - headerArea.getBoundingClientRect().height;
	renderer.setSize(rendererWidth, rendererHeight);
	// 解像度に合わせて3Dモデルをきれいに表示
	renderer.setPixelRatio(window.devicePixelRatio);

	// カメラのサイズの設定
	cameras[0].aspect = rendererWidth / rendererHeight;
	cameras[0].updateProjectionMatrix();

	cameras[1].left = -rendererWidth * cameraFrustumSize;
	cameras[1].right = rendererWidth * cameraFrustumSize;
	cameras[1].top = rendererHeight * cameraFrustumSize;
	cameras[1].bottom = -rendererHeight * cameraFrustumSize;
	cameras[1].updateProjectionMatrix();
	setMapInfoPosition();
}

mapArea.addEventListener("pointerdown", handleMapAreaPointerdown);
mapArea.addEventListener("pointermove", handleMapAreaPointermove);
mapArea.addEventListener("pointerup", handleMapAreaPointerup);
mapArea.addEventListener("pointercancel", handleMapAreaPointercancel);

let pointerdownCoords = {};
let deltaPointerCoords = {};
let primaryPointerId = null;
let prevCameraPosition = new THREE.Vector3();
let prevTargetPosition = new THREE.Vector3();

function handleMapAreaPointerdown(event) {
	if (Object.keys(pointerdownCoords).length < 1) {
		const pointerId = String(event.pointerId);
		if (Object.keys(pointerdownCoords).length < 1) {
			primaryPointerId = pointerId;
			cameraControls[cameraMode].getPosition(prevCameraPosition, true);
			cameraControls[cameraMode].getTarget(prevTargetPosition, true);
			// console.log(prevCameraPosition);
			// console.log(prevTargetPosition);
		}
		const pointerdownCoord = {
			"x": event.clientX,
			"y": event.clientY
		};
		const deltaPointerCoord = {
			"x": 0,
			"y": 0
		}
		pointerdownCoords[pointerId] = pointerdownCoord;
		deltaPointerCoords[pointerId] = deltaPointerCoord;
	}
}

function handleMapAreaPointermove(event) {
	const pointerId = String(event.pointerId);
	if (pointerdownCoords[pointerId]) {
		deltaPointerCoords[pointerId]["x"] = event.clientX - pointerdownCoords[pointerId]["x"];
		deltaPointerCoords[pointerId]["y"] = event.clientY - pointerdownCoords[pointerId]["y"];
	}
}

function handleMapAreaPointerup(event) {
	const pointerId = String(event.pointerId);
	if (pointerdownCoords[pointerId]) {
		if (Math.abs(deltaPointerCoords[pointerId]["x"]) < 5 && Math.abs(deltaPointerCoords[pointerId]["y"]) < 5) {
			const clickedMapInfo = (function() {
				let childElement = null;
				let currentElement = event.target;
				while (currentElement != mapArea) {
					childElement = currentElement;
					currentElement = currentElement.parentElement;
				}
				if (childElement.classList.contains("mapInfo")) {
					return childElement;
				} else {
					return null;
				}
			}());
			console.log(clickedMapInfo);

			if (clickedMapInfo && clickedMapInfo.classList.contains("destinationName")) {
				const destinationName = clickedMapInfo.dataset.destination;
				const splitDestinationName = destinationName.split("_");
				transitionMap(splitDestinationName);

			} else {
				const mapAreaOffset = mapArea.getBoundingClientRect();
				// .setFromCamera()に必要な正規化デバイス座標に変換したマウスカーソルの座標の取得方法
				// ブラウザウィンドウの左上を基準にマウスカーソルの座標を取得して、mapAreaの座標を引くことで、
				// mapAreaの左上を基準にしたマウスカーソルの座標を取得する
				// 取得したmapArea上のマウスカーソルのx座標をmapAreaの幅で割る
				// これにより、mapAreaの幅を0から1としたときのマウスカーソルのx座標を得られる
				// これを2倍して1引くことで、-1から1の範囲でマウスカーソルのx座標を得られる
				pointer.x = (event.clientX - mapAreaOffset.left) / mapAreaOffset.width * 2 - 1;
				pointer.y = (event.clientY - mapAreaOffset.top) / mapAreaOffset.height * -2 + 1;
				raycaster.setFromCamera(pointer, cameras[cameraMode]);

				const intersects = raycaster.intersectObjects(scenes[currentSceneName].children);
				const clickedMapObjName = (function() {
					for (let intersect of intersects) {
						let childObj = null;
						let currentObj = intersect.object;
						let parentObj = intersect.object.parent;
						while (parentObj.name.normalize("NFKC") != currentSceneName) {
							childObj = currentObj;
							currentObj = parentObj;
							parentObj = parentObj.parent;
						}
				
						if (currentObj.visible) {
							if (mapMode == 2) {
								return childObj.name.normalize("NFKC");
							} else {
								return currentObj.name.normalize("NFKC");
							}
						}
					}
					return null;
				}());
				console.log(clickedMapObjName);
				transitionMap(clickedMapObjName);
			}
		}

		delete pointerdownCoords[pointerId];
		delete deltaPointerCoords[pointerId];

		if (primaryPointerId == pointerId) {
			if (Object.keys(pointerdownCoords).length < 1) {
				primaryPointerId = null;
			} else {
				primaryPointerId = Object.keys(pointerdownCoords)[0];
			}
		}
	}
}

function handleMapAreaPointercancel(event) {
	const pointerId = String(event.pointerId);
	if (pointerdownCoords[pointerId]) {
		delete pointerdownCoords[pointerId];
		delete deltaPointerCoords[pointerId];

		if (primaryPointerId == pointerId) {
			if (Object.keys(pointerdownCoords).length < 1) {
				primaryPointerId = null;
			} else {
				primaryPointerId = Object.keys(pointerdownCoords)[0];
			}
		}
	}
}

// マップ回転ボタンの処理
const mapRotationBtn = document.getElementById("mapRotationBtn");
let mapAzimuthAngle = 0;
mapRotationBtn.addEventListener("click", async function(event) {
	if (isTransitionedMap) {
		isTransitionedMap = false;
		mapAzimuthAngle = Math.round(THREE.MathUtils.radToDeg(cameraControls[cameraMode].azimuthAngle) - 90);
		await cameraControls[cameraMode].rotateAzimuthTo(THREE.MathUtils.degToRad(mapAzimuthAngle), true);
		if (mapAzimuthAngle <= -360) {
			mapAzimuthAngle = mapAzimuthAngle % 360;
			await cameraControls[cameraMode].rotateAzimuthTo(THREE.MathUtils.degToRad(mapAzimuthAngle), false);
		}
		isTransitionedMap = true;
	}
});

// モバイル端末を判定する関数
function isMobileDevice() {
	if (window.matchMedia("(max-width: 767px)").matches) {
		return true;
	} else {
		return false;
	}
}

// 点滅するオブジェクトを管理するための変数
let isBlinking = false;
const blinkFrequency = 500; // 点滅の間隔（ミリ秒）

// 前回ハイライトされたオブジェクトを参照するための配列
let highlightedObjects = [];
let originalColors = [];

// 要素を取得
const searchBoxDesktop = document.getElementById('searchBox');

// イベントリスナーを設定
searchBoxDesktop.addEventListener('input', handleSearch);

// 検索ボックスに入力があったときに呼び出される共通の関数
function handleSearch() {
	// 検索用語を取得し、全角文字が含まれていれば半角に変換
	const searchTerm = this.value.normalize('NFKC');

	// 前回ハイライトされたオブジェクトのマテリアルを元に戻す
	highlightedObjects.forEach((object, index) => {
		if (object && originalColors[index]) {
			let objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
			objectMaterials.forEach((material, materialIndex) => {
				if (originalColors[index][materialIndex]) {
					material.color.copy(originalColors[index][materialIndex]);
				}
			});
		}
	});
	highlightedObjects = [];
	originalColors = [];

	// シーン内のオブジェクトをループして一致するオブジェクトを探す
	scenes[currentSceneName].traverse((object) => {
		if (object.name === searchTerm) {

			if (!object.material) {
			} else {
				let objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
				let originalMaterialColors = objectMaterials.map(material => {
					return material && material.color ? material.color.clone() : null;
				});

				originalColors.push(originalMaterialColors);

				objectMaterials.forEach(material => {
					if (material && material.color) {
						material.color.set(0xff0000);  // ハイライトカラー（赤）に変更
					}
				});

				highlightedObjects.push(object);
			}
		}
	});

	if (highlightedObjects.length > 0) {
		startBlinking();
	} else {
		stopBlinking();
	}
}

// 点滅を開始する関数
function startBlinking() {
	if (isBlinking) return; // 既に点滅している場合は何もしない
	isBlinking = true;
	blinkObjects();
}

// 点滅を停止する関数
function stopBlinking() {
	isBlinking = false;
	// 元の色に戻す
	highlightedObjects.forEach((object, index) => {
		if (object && originalColors[index]) {
			let objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
			objectMaterials.forEach((material, matIndex) => {
				material.color.copy(originalColors[index][matIndex]);
			});
		}
	});
}

// オブジェクトを点滅させる関数
function blinkObjects() {
	if (!isBlinking) return; // 点滅が停止していれば何もしない

	// 現在の時間を取得
	const time = Date.now();

	// 各ハイライトされたオブジェクトに対して点滅処理
	highlightedObjects.forEach((object, index) => {
		if (object && originalColors[index]) {
			let objectMaterials = Array.isArray(object.material) ? object.material : [object.material];

			// 現在の時間で色を切り替える
			const isOn = Math.floor(time / blinkFrequency) % 2 === 0;
			objectMaterials.forEach((material, matIndex) => {
				material.color.copy(isOn ? new THREE.Color(0xff0000) : originalColors[index][matIndex]);
			});
		}
	});

	// 次のフレームで点滅を更新
	requestAnimationFrame(blinkObjects);
}
