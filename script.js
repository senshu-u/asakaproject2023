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

// レンダラーとカメラのサイズの初期化
resize();

const mapArea = document.getElementById("mapArea");

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
cameraControls[0].dollySpeed = 0.3;
cameraControls[0].minDistance = 50;
cameraControls[0].maxDistance = 300;
cameraControls[0].maxPolarAngle = THREE.MathUtils.degToRad(80);

cameraControls[1].mouseButtons.left = CameraControls.ACTION.OFFSET;
cameraControls[1].mouseButtons.right = CameraControls.ACTION.NONE;
cameraControls[1].mouseButtons.wheel = CameraControls.ACTION.ZOOM;
cameraControls[1].mouseButtons.middle = CameraControls.ACTION.NONE;
cameraControls[1].touches.one = CameraControls.ACTION.TOUCH_OFFSET;
cameraControls[1].touches.two = CameraControls.ACTION.TOUCH_ZOOM;
cameraControls[1].dollySpeed = 3.0;
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
// 各フロアマップ: 2
let mapMode = 0;

// 引数の名前の3Dモデルを読み込む関数
// 3Dモデル読み込み後、教室名やアイコンなどを作る関数を実行
switchScene("全体マップ").then(function() {
	cameraControls[cameraMode].setTarget(0, 0, 0, false);
	cameraControls[cameraMode].dollyTo(275, false);
	cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
	cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
	cameraControls[cameraMode].zoomTo(1, false);

	const mapName = document.getElementById("mapName");
	mapName.textContent = currentSceneName;

	createMapInfo(getMapsInCurrentScene());
});

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
	
	// console.log(cameras[cameraMode].zoom);
	// let cameraPosition = cameras[cameraMode].position.x + ", " + cameras[cameraMode].position.y + ", " + cameras[cameraMode].position.z;
	// document.getElementById("mapName").textContent = cameraPosition;
}

// 教室名やアイコンなどをマップのオブジェクトに付ける関数
function setMapInfoPosition() {
	let mapObjCoords = [];
	// すべてのmapInfoの座標を取得する
	for (let mapInfo of document.getElementsByClassName("mapInfo")) {
		const mapObj = scenes[currentSceneName].getObjectByName(mapInfo.dataset.mapObj);
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
		const selector = '[data-map-obj="' + mapObjCoord.name + '"]';
		const mapInfo = document.querySelector(selector);
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

// 引数の名前のオブジェクトのcanvas上のx座標とy座標を返す関数
function getMapObjectCoord(target) {	
	const targetWorldPosition = target.getWorldPosition(new THREE.Vector3());
	const targetCanvasPosition = targetWorldPosition.project(cameras[cameraMode]);
	
	return [targetCanvasPosition.x, targetCanvasPosition.y, targetCanvasPosition.z];
}

// 教室名やアイコンなどを作る関数
function createMapInfo(maps) {
	removeMapInfo();
	const mapInfoIcon = new MapInfoIcon();
	const icons = mapInfoIcon.icons;
	const iconsForBuilding = mapInfoIcon.iconsForBuilding;

	switch (mapMode) {
		case 0:
			for (let mapObj of maps[0].children) {
				const mapObjName = mapObj.name.normalize("NFKC");
				if (mapObjName != "object") {
					const mapObjNameFirstWord = (function(text) {
						if (text.includes("_")) {
							return text.substring(0, text.indexOf("_"));
						} else {
							return text;
						}
					}(mapObjName));
					
					if (Object.keys(icons).includes(mapObjNameFirstWord)) {
						// アイコンを作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("icon");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.filterItem = icons[mapObjNameFirstWord]["filterItem"];

						if (icons[mapObjNameFirstWord]["shouldShowMapObjName"]) {
							mapInfo.textContent = mapObjNameFirstWord;
						}
						const icon = document.createElement("img");
						icon.src = mapInfoIcon.iconPath + icons[mapObjNameFirstWord]["fileName"];
						icon.alt = mapObjNameFirstWord;
						icon.height = 20;

						mapInfo.prepend(icon);
						mapArea.append(mapInfo);
					} else {
						// 建物の情報を作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("buildingInfo");
						mapInfo.dataset.mapObj = mapObj.name;

						const buildingName = document.createElement("div");
						buildingName.classList.add("buildingName");
						buildingName.textContent = mapObjName;

						const buildingIconList = document.createElement("div");
						buildingIconList.classList.add("buildingIconList");
						if (Object.keys(iconsForBuilding).includes(mapObjName)) {
							for (let iconForMapObjName of iconsForBuilding[mapObjName]) {
								const icon = document.createElement("img");
								icon.classList.add("icon");
								icon.dataset.filterItem = iconForMapObjName["filterItem"];
								icon.src = mapInfoIcon.iconPath + iconForMapObjName["fileName"];
								icon.alt = iconForMapObjName["filterItem"];
								icon.height = 20;
								buildingIconList.append(icon);
							}
						}

						mapInfo.append(buildingName, buildingIconList);
						mapArea.append(mapInfo);
					}
				}
			}
			break;

		case 1:
			for (let map of maps) {
				for (let mapObj of map.children) {
					const mapObjName = mapObj.name.normalize("NFKC");
					if (mapObjName != "object") {
						const mapObjNameFirstWord = (function(text) {
							if (text.includes("_")) {
								return text.substring(0, text.indexOf("_"));
							} else {
								return text;
							}
						}(mapObjName));

						if (Object.keys(icons).includes(mapObjNameFirstWord)) {
							if (icons[mapObjNameFirstWord]["filterItem"]) {
								// アイコンを作る
								const mapInfo = document.createElement("div");
								mapInfo.classList.add("mapInfo");
								mapInfo.classList.add("icon");
								mapInfo.dataset.mapObj = mapObj.name;
								mapInfo.dataset.filterItem = icons[mapObjNameFirstWord]["filterItem"];

								const icon = document.createElement("img");
								icon.src = mapInfoIcon.iconPath + icons[mapObjNameFirstWord]["fileName"];
								icon.alt = mapObjNameFirstWord;
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
			for (let mapObj of maps.children) {
				const mapObjName = mapObj.name.normalize("NFKC");
				if (mapObjName != "object") {
					const mapObjNameFirstWord = (function(text) {
						if (text.includes("_")) {
							return text.substring(0, text.indexOf("_"));
						} else {
							return text;
						}
					}(mapObjName));

					if (Object.keys(icons).includes(mapObjNameFirstWord)) {
						// アイコンを作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("icon");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.filterItem = icons[mapObjNameFirstWord]["filterItem"];

						if (icons[mapObjNameFirstWord]["shouldShowMapObjName"]) {
							mapInfo.textContent = mapObjNameFirstWord;
						}
						const icon = document.createElement("img");
						icon.src = mapInfoIcon.iconPath + icons[mapObjNameFirstWord]["fileName"];
						icon.alt = mapObjNameFirstWord;
						icon.height = 20;

						mapInfo.prepend(icon);
						mapArea.append(mapInfo);
					} else {
						// 教室名を作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("roomName");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.textContent = mapObjName;
						mapArea.append(mapInfo);
					}
				}
			}
			break;

	}
}

// すべてのマップ上の情報を削除する関数
function removeMapInfo() {
	while (document.getElementsByClassName("mapInfo")[0]) {
		document.getElementsByClassName("mapInfo")[0].remove();
	}
}

function getMapsInCurrentScene() {
	let maps = [];
	for (let sceneChild of scenes[currentSceneName].children) {
		if (!sceneChild.isLight) {
			maps.push(sceneChild);
		}
	}
	return maps;
}

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
			scenes[currentSceneName].background = new THREE.Color(0xffffff);

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
	canControlMap = false;
	if (floorName) {
		let floorExists = false;
		for (let map of getMapsInCurrentScene()) {
			if (map.name == floorName) {
				floorExists = true;
				break;
			}
		}
		if (floorExists) {
			for (let map of getMapsInCurrentScene()) {
				if (map.name != floorName) {
					map.visible = false;
				}
			}
			cameraControls[cameraMode].setFocalOffset(0, 0, 0, true);
			cameraControls[cameraMode].zoomTo(1, true);
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
	canControlMap = true;
}

// 3Dモデルのクリックの設定
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isTransitionedMap = true;
let pointerPrevCoords = {};

function transitionMap(mapObjName) {
	if (isTransitionedMap) {
		isTransitionedMap = false;

		if (mapObjName) {
			switch (mapMode) {
				case 0:
					removeMapInfo();
					switchScene(mapObjName).then(function() {
						cameraMode = 1;
						mapMode = 1;

						cameraControls[cameraMode].enabled = false;
						cameraControls[cameraMode].setTarget(0, 0, 0, false);
						cameraControls[cameraMode].dollyTo(100, false);
						cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(135), THREE.MathUtils.degToRad(55), false);
						cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
						cameraControls[cameraMode].zoomTo(1, false);

						const mapName = document.getElementById("mapName");
						mapName.textContent = currentSceneName;
						mapName.classList.remove("hidden");
						mapBackBtn.classList.remove("hidden");

						createMapInfo(getMapsInCurrentScene());
						isTransitionedMap = true;
					}).catch(function(error) {
						console.log(error);
						createMapInfo(getMapsInCurrentScene());
						setMapInfoPosition();
						isTransitionedMap = true;
					});

					break;
				case 1:
					removeMapInfo();
					moveCameraTo(mapObjName).then(function() {
						cameraMode = 1;
						mapMode = 2;

						const currentFloor = document.createElement("span");
						currentFloor.id = "currentFloor";
						currentFloor.textContent = mapObjName;
						const mapName = document.getElementById("mapName");
						mapName.append(currentFloor);
						mapRotationBtn.classList.remove("hidden");

						cameraControls[cameraMode].enabled = true;
						createMapInfo(scenes[currentSceneName].getObjectByName(mapObjName));
						isTransitionedMap = true;
					}).catch(function(error) {
						console.log(error);
						createMapInfo(getMapsInCurrentScene());
						setMapInfoPosition();
						isTransitionedMap = true;
					});
					
					break;
				case 2:
					isTransitionedMap = true;
					break;
			}
		} else {
			isTransitionedMap = true;
		}
	}
}

// 画面のリサイズ
window.addEventListener("resize", resize);

function resize() {
	// レンダラーのサイズの設定
	rendererWidth = window.innerWidth;
	rendererHeight = window.innerHeight;
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
mapArea.addEventListener("pointerup", handleMapAreaPointerup);

function handleMapAreaPointerdown(event) {
	const pointerId = String(event.pointerId);
	const pointerCoord = {
		"x": event.clientX,
		"y": event.clientY
	};
	pointerPrevCoords[pointerId] = pointerCoord;
}

function handleMapAreaPointerup(event) {
	const pointerId = String(event.pointerId);
	const deltaX = event.clientX - pointerPrevCoords[pointerId]["x"];
	const deltaY = event.clientY - pointerPrevCoords[pointerId]["y"];

	if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
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

	delete pointerPrevCoords[pointerId];
}

let prY = null;
function scrollFloor(event) {
	const val = 0.01;
	const currentY = event.clientY;
	const deltaY = currentY - prY;
	prY = currentY;
	cameraControls[cameraMode].elevate(deltaY * val, false);
}

// マップ一覧に戻るボタンの処理
const mapBackBtn = document.getElementById("mapBackBtn");
mapBackBtn.addEventListener("click", function(event) {
	if (isTransitionedMap) {
		isTransitionedMap = false;
		switch (mapMode) {
			case 1:
				removeMapInfo();
				switchScene("全体マップ").then(function() {
					cameraMode = 0;
					mapMode = 0;

					cameraControls[cameraMode].enabled = true;
					cameraControls[cameraMode].setTarget(0, 0, 0, false);
					cameraControls[cameraMode].dollyTo(275, false);
					cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
					cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
					cameraControls[cameraMode].zoomTo(1, false);

					const mapName = document.getElementById("mapName");
					mapName.textContent = currentSceneName;
					mapName.classList.add("hidden");
					mapBackBtn.classList.add("hidden");

					createMapInfo(getMapsInCurrentScene());
					isTransitionedMap = true;
				}).catch(function(error) {
					console.log(error);
					createMapInfo(getMapsInCurrentScene());
					setMapInfoPosition();
					isTransitionedMap = true;
				});
				break;
			case 2:
				removeMapInfo();
				moveCameraTo().then(function() {
					cameraMode = 1;
					mapMode = 1;

					document.getElementById("currentFloor").remove();
					mapRotationBtn.classList.add("hidden");

					cameraControls[cameraMode].enabled = false;
					createMapInfo(getMapsInCurrentScene());
					isTransitionedMap = true;
				});
				break;
		}
	}
});

// マップ回転ボタンの処理
const mapRotationBtn = document.getElementById("mapRotationBtn");
let canControlMap = true;
let mapAzimuthAngle = 0;
mapRotationBtn.addEventListener("click", async function(event) {
	if (canControlMap) {
		canControlMap = false;
		mapAzimuthAngle = Math.round(THREE.MathUtils.radToDeg(cameraControls[cameraMode].azimuthAngle) - 90);
		await cameraControls[cameraMode].rotateAzimuthTo(THREE.MathUtils.degToRad(mapAzimuthAngle), true);
		if (mapAzimuthAngle <= -360) {
			mapAzimuthAngle = mapAzimuthAngle % 360;
			await cameraControls[cameraMode].rotateAzimuthTo(THREE.MathUtils.degToRad(mapAzimuthAngle), false);
		}
		canControlMap = true;
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

// 前回ハイライトされたオブジェクトを参照するための変数
let highlightedObject = null;
let originalColor = null;
// PCとモバイルで異なる要素を取得
const searchBoxDesktop = document.getElementById('searchBox');
const searchBoxMobile = document.getElementById('searchBoxMobile');
// イベントリスナーを設定
searchBoxDesktop.addEventListener('input', handleSearch);
searchBoxMobile.addEventListener('input', handleSearch);
// 検索ボックスに入力があったときに呼び出される共通の関数
function handleSearch() {
	const searchTerm = this.value; // thisはイベントが発火した要素を指す
	// 前回ハイライトされたオブジェクトのマテリアルを元に戻す
	if (highlightedObject && originalColor) {
			highlightedObject.material.color.copy(originalColor);
			highlightedObject = null;
			originalColor = null;
	}
	// シーン内のオブジェクトをループして一致するオブジェクトを探す
	scenes[currentSceneName].traverse((object) => {
			if (!highlightedObject && object.material && object.name === searchTerm) {
					originalColor = object.material.color.clone();
					object.material.color.set(0xff0000);  // ハイライトカラー（赤）に変更
					highlightedObject = object;
			}
	});
}

const topLogo = document.getElementById("toplogo");
topLogo.addEventListener("click", function(event) {
	if (isTransitionedMap) {
		isTransitionedMap = false;
		removeMapInfo();

		// 前のシーンの3Dモデルを破棄するための処理
		if (currentSceneName && scenes[currentSceneName]) {
			for (let child of scenes[currentSceneName].children) {
				child.visible = true; // 可視状態をリセット
			}
		}

		switchScene("全体マップ").then(function() {
			cameraMode = 0;
			mapMode = 0;

			cameraControls[cameraMode].enabled = true;
			cameraControls[cameraMode].setTarget(0, 0, 0, false);
			cameraControls[cameraMode].dollyTo(275, false);
			cameraControls[cameraMode].rotateTo(THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(55), false);
			cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
			cameraControls[cameraMode].zoomTo(1, false);

			const mapName = document.getElementById("mapName");
			mapName.textContent = currentSceneName;
			mapName.classList.add("hidden");
			mapBackBtn.classList.add("hidden");

			createMapInfo(getMapsInCurrentScene());
			isTransitionedMap = true;
		}).catch(function(error) {
			console.log(error);
			createMapInfo(getMapsInCurrentScene());
			setMapInfoPosition();
			isTransitionedMap = true;
		});
	}
});
