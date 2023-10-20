export class MapInfoIcon {
	iconPath = "data/icon/";

	mapInfoIcons = {
		"階段": {
			"fileName": "stairs.png",
			"shouldShowMapObjName": false,
			"filterItem": "階段"
		},
		"シダックス": {
			"fileName": "diningroom.png",
			"shouldShowMapObjName": true,
			"filterItem": "食堂"
		},
		"男子トイレ": {
			"fileName": "menRestroom.png",
			"shouldShowMapObjName": false,
			"filterItem": "トイレ"
		},
		"女子トイレ": {
			"fileName": "womenRestroom.png",
			"shouldShowMapObjName": false,
			"filterItem": "トイレ"
		},
		"エスカレーター": {
			"fileName": "upEscalator.png",
			"shouldShowMapObjName": false,
			"filterItem": "エスカレーター"
		},
		"エレベーター": {
			"fileName": "elevator.png",
			"shouldShowMapObjName": false,
			"filterItem": "エレベーター"
		},
		"プリンター": {
			"fileName": "printer.png",
			"shouldShowMapObjName": false,
			"filterItem": "プリンター"
		}
	}

	wholeMapInfoIcons = {
		"10号館": [
			{"fileName": "restroom.png", "filterItem": "トイレ"},
			{"fileName": "restroom.png", "filterItem": "食堂"},
			{"fileName": "restroom.png", "filterItem": "プリンター"}
		]
	}
}