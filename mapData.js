export class MapData {
	mapPath = "data/map3DModel/";
	building1MapPath = this.mapPath + "building1/";
	building2MapPath = this.mapPath + "building2/";
	building3MapPath = this.mapPath + "building3/";
	building4MapPath = this.mapPath + "building4/";
	building5MapPath = this.mapPath + "building5/";
	building7MapPath = this.mapPath + "building7/";
	building8MapPath = this.mapPath + "building8/";
	building9MapPath = this.mapPath + "building9/";
	building10MapPath = this.mapPath + "building10/";
	GreentopMapPath = this.mapPath + "Greentop/";
	LibraryMapPath = this.mapPath + "Library/";
	gymMapPath = this.mapPath + "gym/";

	maps = {
		"wholeMap.glb": {
			"dirPath": this.mapPath,
			"mapName": "全体マップ",
			"floor": "",
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
		"2_B1.glb": {
			"dirPath": this.building2MapPath,
			"mapName": "2号館",
			"floor": "B1",
			"rooms": []
		},
		"2_1.glb": {
			"dirPath": this.building2MapPath,
			"mapName": "2号館",
			"floor": "1",
			"rooms": []
		},
		"2_2.glb": {
			"dirPath": this.building2MapPath,
			"mapName": "2号館",
			"floor": "2",
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
		"4_1.glb": {
			"dirPath": this.building4MapPath,
			"mapName": "4号館",
			"floor": "1",
			"rooms": []
		},
		"4_2.glb": {
			"dirPath": this.building4MapPath,
			"mapName": "4号館",
			"floor": "2",
			"rooms": []
		},
		"4_3.glb": {
			"dirPath": this.building4MapPath,
			"mapName": "4号館",
			"floor": "3",
			"rooms": []
		},
		"4_4.glb": {
			"dirPath": this.building4MapPath,
			"mapName": "4号館",
			"floor": "4",
			"rooms": []
		},
		"4_5.glb": {
			"dirPath": this.building4MapPath,
			"mapName": "4号館",
			"floor": "5",
			"rooms": []
		},
		"5_1.glb": {
			"dirPath": this.building5MapPath,
			"mapName": "5号館",
			"floor": "1",
			"rooms": []
		},
		"5_2.glb": {
			"dirPath": this.building5MapPath,
			"mapName": "5号館",
			"floor": "2",
			"rooms": []
		},
		"5_3.glb": {
			"dirPath": this.building5MapPath,
			"mapName": "5号館",
			"floor": "3",
			"rooms": []
		},
		"7_B1.glb": {
			"dirPath": this.building7MapPath,
			"mapName": "7号館",
			"floor": "B1",
			"rooms": []
		},
		"7_1.glb": {
			"dirPath": this.building7MapPath,
			"mapName": "7号館",
			"floor": "1",
			"rooms": []
		},
		"7_2.glb": {
			"dirPath": this.building7MapPath,
			"mapName": "7号館",
			"floor": "2",
			"rooms": []
		},
		"7_3.glb": {
			"dirPath": this.building7MapPath,
			"mapName": "7号館",
			"floor": "3",
			"rooms": []
		},
		"8_1.glb": {
			"dirPath": this.building8MapPath,
			"mapName": "8号館",
			"floor": "1",
			"rooms": []
		},
		"8_2.glb": {
			"dirPath": this.building8MapPath,
			"mapName": "8号館",
			"floor": "2",
			"rooms": []
		},
		"8_3.glb": {
			"dirPath": this.building8MapPath,
			"mapName": "8号館",
			"floor": "3",
			"rooms": []
		},
		"8_4.glb": {
			"dirPath": this.building8MapPath,
			"mapName": "8号館",
			"floor": "4",
			"rooms": []
		},
		"8_5.glb": {
			"dirPath": this.building8MapPath,
			"mapName": "8号館",
			"floor": "5",
			"rooms": []
		},
		"9_1.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "1",
			"rooms": []
		},
		"9_2.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "2",
			"rooms": []
		},
		"9_3.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "3",
			"rooms": []
		},
		"9_M3.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "M3",
			"rooms": []
		},
		"9_4.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "4",
			"rooms": []
		},
		"9_5.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "5",
			"rooms": []
		},
		"9_6.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "6",
			"rooms": []
		},
		"9_7.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "7",
			"rooms": []
		},
		"9_8.glb": {
			"dirPath": this.building9MapPath,
			"mapName": "9号館",
			"floor": "8",
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
		},
		"G_B1.glb": {
			"dirPath": this.GreentopMapPath,
			"mapName": "グリーントップ",
			"floor": "B1",
			"rooms": []
		},
		"G_1.glb": {
			"dirPath": this.GreentopMapPath,
			"mapName": "グリーントップ",
			"floor": "1",
			"rooms": []
		},
		"L_1.glb": {
			"dirPath": this.LibraryMapPath,
			"mapName": "図書館別館",
			"floor": "1",
			"rooms": []
		},
		"L_2.glb": {
			"dirPath": this.LibraryMapPath,
			"mapName": "図書館別館",
			"floor": "2",
			"rooms": []
		},
		"L_3.glb": {
			"dirPath": this.LibraryMapPath,
			"mapName": "図書館別館",
			"floor": "3",
			"rooms": []
		},
		"L_4.glb": {
			"dirPath": this.LibraryMapPath,
			"mapName": "図書館別館",
			"floor": "4",
			"rooms": []
		},
		"L_5.glb": {
			"dirPath": this.LibraryMapPath,
			"mapName": "図書館別館",
			"floor": "5",
			"rooms": []
		},
		"S_B1.glb": {
			"dirPath": this.gymMapPath,
			"mapName": "総合体育館",
			"floor": "B1",
			"rooms": []
		},
		"S_1.glb": {
			"dirPath": this.gymMapPath,
			"mapName": "総合体育館",
			"floor": "1",
			"rooms": []
		},
		"S_2.glb": {
			"dirPath": this.gymMapPath,
			"mapName": "総合体育館",
			"floor": "2",
			"rooms": []
		},
		"S_3.glb": {
			"dirPath": this.gymMapPath,
			"mapName": "総合体育館",
			"floor": "3",
			"rooms": []
		},
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
