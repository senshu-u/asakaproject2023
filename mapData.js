export class MapData {
	mapPath = "data/map3DModel/";
	building10MapPath = this.mapPath + "building10/";
	building3MapPath = this.mapPath + "building3/";
	building1MapPath = this.mapPath + "building1/";

	maps = {
		"wholeMap.glb": {
			"dirPath": this.mapPath,
			"mapName": "全体マップ",
			"floor": null,
			"rooms": []
		},
		"1_B1.glb": {
			"dirPath": this.building1MapPath,
			"mapName": "1号館",
			"floor": "B1",
			"rooms": []
		},
		"1_1.glb": {
			"dirPath": this.building1MapPath,
			"mapName": "1号館",
			"floor": "1",
			"rooms": []
		},
		"1_2.glb": {
			"dirPath": this.building1MapPath,
			"mapName": "1号館",
			"floor": "2",
			"rooms": []
		},
		"1_3.glb": {
			"dirPath": this.building1MapPath,
			"mapName": "1号館",
			"floor": "3",
			"rooms": []
		},
		"1_4.glb": {
			"dirPath": this.building1MapPath,
			"mapName": "1号館",
			"floor": "4",
			"rooms": []
		},
		"3_1.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "1",
			"rooms": []
		},
		"3_2.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "2",
			"rooms": []
		},
		"3_3.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "3",
			"rooms": []
		},
		"3_4.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "4",
			"rooms": []
		},
		"3_5.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "5",
			"rooms": []
		},
		"3_6.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "6",
			"rooms": []
		},
		"3_7.glb": {
			"dirPath": this.building3MapPath,
			"mapName": "3号館",
			"floor": "7",
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
