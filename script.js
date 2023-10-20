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

/*
// アイコンのパスをまとめた連想配列
const mapInfoIcons = {
	"男子トイレ": "data/icon/stairs.png",
	"女子トイレ": "data/icon/stairs.png",
	"階段": "data/icon/stairs.png",
	"エスカレーター": "data/icon/stairs.png",
	"エレベーター": "data/icon/stairs.png",
	"プリンター": "data/icon/stairs.png"
};
*/

// レンダラーの作成
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});
let rendererWidth;
let rendererHeight;

// シーンを格納する連想配列の作成
let scenes = {};
let currentSceneName;
// シーンの作成と設定
// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);

// カメラの作成と設定
let cameraMode = 0;
// cameraModeで透視投影カメラと平行投影カメラを切り替える
// 透視投影カメラ: 0
// 平行投影カメラ: 1
const cameras = [
	new THREE.PerspectiveCamera(),
	new THREE.OrthographicCamera()
];
cameras[0].fov = 40;
cameras[0].near = 0.1;
cameras[0].far = 2000;
// cameras[0].position.set(0, 150, -300);

const cameraFrustumSize = 0.005;
// 平行投影カメラの視錐台の大きさを決める倍率
// この値をrendererの大きさにかけて平行投影カメラの視錐台の大きさを決めている
cameras[1].near = 0.1;
cameras[1].far = 2000;
// cameras[1].position.set(0, 200, 0);

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
cameraControls[0].minDistance = 50;
cameraControls[0].maxDistance = 300;
cameraControls[0].maxPolarAngle = degToRad(80);
cameraControls[0].setTarget(0, 0, 0, false);
cameraControls[0].dollyTo(275, false);
cameraControls[0].rotateTo(degToRad(180), degToRad(55), false);
cameraControls[0].setFocalOffset(0, 0, 0, false);
cameraControls[0].zoomTo(1, false);

cameraControls[1].mouseButtons.left = CameraControls.ACTION.OFFSET;
cameraControls[1].mouseButtons.right = CameraControls.ACTION.NONE;
cameraControls[1].mouseButtons.wheel = CameraControls.ACTION.ZOOM;
cameraControls[1].mouseButtons.middle = CameraControls.ACTION.NONE;
cameraControls[1].touches.one = CameraControls.ACTION.TOUCH_OFFSET;
cameraControls[1].touches.two = CameraControls.ACTION.TOUCH_DOLLY_ROTATE;



// 引数の名前の3Dモデルを読み込む関数
// 3Dモデル読み込み後、教室名やアイコンなどを作る関数を実行
// そのとき読み込んだ3Dモデルの名前を配列mapNamesとして渡す
switchScene("全体マップ").then(function(mapNames) {
	console.log(mapNames);
	console.log(scenes);
	createMapInfo("1");
});

// レンダーループ
renderer.setAnimationLoop(animation);

// この関数をループさせている
function animation() {
	// カメラの位置と向きを更新
	const delta = clock.getDelta();
	cameraControls[cameraMode].update(delta);

	// レンダリング
	renderer.render(scenes[currentSceneName], cameras[cameraMode]);

	// 教室名やアイコンなどをマップのオブジェクトに付ける関数
	setMapInfoPos();
	
	// console.log(cameras[cameraMode].zoom);
	// let cameraPosition = cameras[cameraMode].position.x + ", " + cameras[cameraMode].position.y + ", " + cameras[cameraMode].position.z;
	// document.getElementById("mapName").textContent = cameraPosition;
}

// 教室名やアイコンなどをマップのオブジェクトに付ける関数
function setMapInfoPos() {
	for (let mapInfo of document.getElementsByClassName("mapInfo")) {
		// 引数の名前のオブジェクトのcanvas上のx座標とy座標を返す関数
		let [x, y] = getMapObjCoord(mapInfo.dataset.mapObj);

		x = x - mapInfo.getBoundingClientRect().width / 2;
		y = y - mapInfo.getBoundingClientRect().height / 2;
		mapInfo.style.left = x + "px";
		mapInfo.style.top = y + "px";
	}
}

// 引数の名前のオブジェクトのcanvas上のx座標とy座標を返す関数
function getMapObjCoord(mapObj) {
	let target = scenes[currentSceneName].getObjectByName(mapObj);
	
	const targetWorldPos = target.getWorldPosition(new THREE.Vector3());
	const targetCanvasPos = targetWorldPos.project(cameras[cameraMode]);
	
	const targetCanvasX = (rendererWidth / 2) * (targetCanvasPos.x + 1);
	const targetCanvasY = (rendererHeight / 2) * -(targetCanvasPos.y - 1);
	
	return [targetCanvasX, targetCanvasY];
}

let mapMode = 0;
// 教室名やアイコンなどを作る関数
function createMapInfo(mapNames) {
	removeMapInfo();
	const mapInfoIcon = new MapInfoIcon();
	const mapInfoIcons = mapInfoIcon.mapInfoIcons;

	switch (mapMode) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			for (let mapObj of scenes[currentSceneName].getObjectByName(mapNames).children) {
				if (mapObj.name != "object") {
					const mapObjNameFirstWord = mapObj.name.substring(0, mapObj.name.indexOf("_"));
					if (Object.keys(mapInfoIcons).includes(mapObjNameFirstWord)) {
						// アイコンを作る
						const mapInfo = document.createElement("div");
						mapInfo.classList.add("mapInfo");
						mapInfo.classList.add("icon");
						mapInfo.dataset.mapObj = mapObj.name;
						mapInfo.dataset.filterItem = mapInfoIcons[mapObjNameFirstWord]["filterItem"];

						mapInfo.textContent = mapObjNameFirstWord;
						const icon = document.createElement("img");
						icon.src = mapInfoIcon.iconPath + mapInfoIcons[mapObjNameFirstWord]["fileName"];
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
						mapInfo.textContent = mapObj.name;
						mapArea.append(mapInfo);
					}
				}
			}
			break;
	}
}

function removeMapInfo() {
	while (document.getElementsByClassName("mapInfo")[0]) {
		document.getElementsByClassName("mapInfo")[0].remove();
	}
}

async function switchScene(mapName) {
	let mapNames = [];

	if (Object.keys(scenes).includes(mapName)) {
		currentSceneName = mapName;
		for (let sceneChild of scenes[currentSceneName].children) {
			if (!sceneChild.isLight) {
				mapNames.push(sceneChild.name);
			}
		}

	} else {
		const mapData = new MapData();
		const extractedMaps = mapData.extractMapsByMapName(mapName);

		if (Object.keys(extractedMaps).length > 0) {
			currentSceneName = mapName;
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
			
			mapNames = await loadMap(extractedMaps);
		} else {
			throw new Error(mapName + "のマップデータはありません");
		}
	}

	return mapNames;
}

// 前回ハイライトされたオブジェクトを参照するための変数
let highlightedObject = null;
let originalColor = null;
const searchBox = document.getElementById('searchBox');
searchBox.addEventListener('input', function() {
    const searchTerm = searchBox.value;
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
});

// 引数の連想配列から3Dモデルを読み込む関数
async function loadMap(maps) {
	const loader = new GLTFLoader();
	const distance = 1.5;

	let mapNames = [];
	let count = 0;
	for (let fileName in maps) {
		const mapDataPath = maps[fileName]["dirPath"] + fileName;
		const glb = await loader.loadAsync(mapDataPath);
		const map = glb.scene;

		// 読み込んだ3Dモデルに名前を付ける
		if (maps[fileName]["floor"] == "") {
			// 階のないマップの場合はマップ名をそのまま付ける
			map.name = maps[fileName]["mapName"];
		} else {
			// 階のあるマップの場合は階の名前を付ける
			map.name = maps[fileName]["floor"];
		}
		mapNames.push(map.name);
		map.position.set(0, count * distance, 0);

		// console.log(map);
		scenes[currentSceneName].add(map);
		count++;
	}

	return mapNames;
}

function moveCameraTo(mapName = null) {
	if (mapName) {
		for (let sceneChild of scenes[currentSceneName].children) {
			if (!(sceneChild.isLight || sceneChild.name == mapName)) {
				sceneChild.visible = false;
			}
		}
		cameraControls[cameraMode].rotateTo(degToRad(0), degToRad(0), true);
		cameraControls[cameraMode].setFocalOffset(0, 0, 0, true);
		cameraControls[cameraMode].zoomTo(1, true);

	} else {
		for (let sceneChild of scenes[currentSceneName].children) {
			if (!sceneChild.visible) {
				sceneChild.visible = true;
			}
		}
		cameraControls[cameraMode].rotateTo(degToRad(135), degToRad(55), true);
		cameraControls[cameraMode].setFocalOffset(0, 0, 0, true);
		cameraControls[cameraMode].zoomTo(1, true);
	}
}

// 3Dモデルのクリックの設定
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function getClickedMapObj(event) {
	if (isClick(event.clientX, event.clientY)) {
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
		// console.log(pointer);

		const intersects = raycaster.intersectObjects(scenes[currentSceneName].children);
		const clickedMapObjName = getClickedObjName(intersects);
		console.log(clickedMapObjName);

		if (clickedMapObjName) {
			switch (mapMode) {
				case 0:
					switchScene(clickedMapObjName).then(function(mapNames) {
						cameraMode = 1;
						mapMode = 1;

						cameraControls[cameraMode].enabled = false;
						cameraControls[cameraMode].setTarget(0, 0, 0, false);
						cameraControls[cameraMode].dollyTo(100, false);
						cameraControls[cameraMode].rotateTo(degToRad(135), degToRad(55), false);
						cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
						cameraControls[cameraMode].zoomTo(1, false);

						const mapName = document.getElementById("mapName");
						mapName.textContent = currentSceneName;
						mapName.classList.toggle("hidden");
						mapRotationBtn.classList.toggle("hidden");
						mapBackBtn.classList.toggle("hidden");

						createMapInfo(mapNames);
					}).catch(function(error) {
						console.log(error);
					});

					break;
				case 1:
					moveCameraTo(clickedMapObjName);
					cameraMode = 1;
					mapMode = 2;

					const currentFloor = document.createElement("span");
					currentFloor.id = "currentFloor";
					currentFloor.textContent = clickedMapObjName;
					const mapName = document.getElementById("mapName");
					mapName.appendChild(currentFloor);

					cameraControls[cameraMode].enabled = true;
					createMapInfo(clickedMapObjName);
					break;
				case 2:
					break;
			}
		}
	}
}

// 交差したオブジェクトの配列から、クリックされたと見なされるオブジェクトの名前を返す関数
function getClickedObjName(intersects) {
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
}

mapArea.addEventListener("pointerdown", getPointerdownCoord);
mapArea.addEventListener("pointerup", getClickedMapObj);

let prevX, prevY;
function getPointerdownCoord(event) {
	prevX = event.clientX;
	prevY = event.clientY;
}

function isClick(currentX, currentY) {
	const deltaX = currentX - prevX;
	const deltaY = currentY - prevY;
	// console.log(deltaX, deltaY);
	if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
		return true;
	} else {
		return false;
	}
}

// マップ一覧に戻るボタンの処理
const mapBackBtn = document.getElementById("mapBackBtn");
mapBackBtn.addEventListener("click", function(event) {
	switch (mapMode) {
		case 1:
			switchScene("全体マップ").then(function(mapNames) {
				cameraMode = 0;
				mapMode = 0;

				cameraControls[cameraMode].setTarget(0, 0, 0, false);
				cameraControls[cameraMode].dollyTo(275, false);
				cameraControls[cameraMode].rotateTo(degToRad(180), degToRad(55), false);
				cameraControls[cameraMode].setFocalOffset(0, 0, 0, false);
				cameraControls[cameraMode].zoomTo(1, false);

				const mapName = document.getElementById("mapName");
				mapName.textContent = currentSceneName;
				mapName.classList.toggle("hidden");
				mapRotationBtn.classList.toggle("hidden");
				mapBackBtn.classList.toggle("hidden");

				createMapInfo(mapNames);
			}).catch(function(error) {
				console.log(error);
			});

			break;
		case 2:
			moveCameraTo();
			cameraMode = 1;
			mapMode = 1;

			document.getElementById("currentFloor").remove();

			cameraControls[cameraMode].enabled = false;
			createMapInfo();
			break;
	}
});

// マップ回転ボタンの処理
const mapRotationBtn = document.getElementById("mapRotationBtn");
let rotationAngle = 0;
mapRotationBtn.addEventListener("click", function(event) {
	rotationAngle = (rotationAngle - 90) % 360;
	console.log(rotationAngle);
	cameraControls[cameraMode].rotateAzimuthTo(cameraControls[cameraMode].azimuthAngle + degToRad(-90), true);
});

// モバイル端末を判定する関数
function isMobileDevice() {
	if (window.matchMedia("(max-width: 767px)").matches) {
		return true;
	} else {
		return false;
	}
}

function degToRad(angle) {
	return angle * Math.PI / 180;
}
