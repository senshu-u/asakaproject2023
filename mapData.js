export class MapData {
	mapPath = "data/map3DModel/";
	building10MapPath = this.mapPath + "building10/";

	maps = {
		"wholeMap.glb": {
			"dirPath": this.mapPath,
			"mapName": "全体マップ",
			"floor": "",
			"rooms": []
		},
		"10_1.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "1",
			"rooms": []
		},
		"10_2.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "2",
			"rooms": []
		},
		"10_3.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "3",
			"rooms": []
		},
		"10_4.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "4",
			"rooms": []
		},
		"10_5.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "5",
			"rooms": []
		},
		"10_6.glb": {
			"dirPath": this.building10MapPath,
			"mapName": "10号館",
			"floor": "6",
			"rooms": []
		}
	};

	extractMapsByMapName(mapName) {
		let extractedMaps = {};
		for (let fileName in this.maps) {
			if (this.maps[fileName]["mapName"] == mapName) {
				extractedMaps[fileName] = this.maps[fileName];
			}
		}
		return extractedMaps;
	}
}