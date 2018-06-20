var map;
var markers = [];
var stepMarkers = []
var panoramaMarkers = []
var markersIcons = {
		"0" : "https://maps.google.com/mapfiles/kml/paddle/go-lv.png",
		"1" : "https://maps.google.com/mapfiles/kml/paddle/stop-lv.png"
}
// TODO: resize icon

function initMap() {
	var madrid = {lat: 40.462004, lng: -3.646267};
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 12,
		center: madrid
	});

	map.addListener("click", function(e) {
		if(markers.length == 2) {
			return;
		}
		markers.push(new google.maps.Marker({
			position: e.latLng,
			icon: markersIcons[markers.length],
			map: map
		}));
		if(markers.length == 2) {
			var nextActionControlDiv = document.createElement("div");
			var nextActionControl = new NextActionControl(nextActionControlDiv, map, markers);

			nextActionControlDiv.index = 1;
			map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextActionControlDiv);

			//TODO: change zoom and position of the map to fit the origin and destination
		}
	});
}

function NextActionControl(controlDiv, map, markers) {

	// Set CSS for the control border.
//	TODO: move the CSS to a separate file
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#fff';
	controlUI.style.border = '2px solid #fff';
	controlUI.style.borderRadius = '3px';
	controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
	controlUI.style.cursor = 'pointer';
	controlUI.style.marginBottom = '22px';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to get the route';
	controlDiv.appendChild(controlUI);

//	Set CSS for the control interior.
	var controlText = document.createElement('div');
	controlText.style.color = 'rgb(25,25,25)';
	controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
	controlText.style.fontSize = '16px';
	controlText.style.lineHeight = '38px';
	controlText.style.paddingLeft = '5px';
	controlText.style.paddingRight = '5px';
	controlText.innerHTML = 'Get the route';
	controlUI.appendChild(controlText);

//	Setup the click event listeners: simply set the map to Chicago.
	controlUI.addEventListener('click', function() {
		console.log("Button clicked!");
		getRoute(markers);
	});
}

function setStepMarkers(route) {
	var stepIcon = {
			url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank-lv.png', // url
			scaledSize: new google.maps.Size(10, 10), // scaled size
			origin: new google.maps.Point(0,0), // origin
			anchor: new google.maps.Point(0,0) // anchor
	};
	for(var istep = 0; istep < route.steps.length - 1; istep++) {
		console.log("Adding marker for step " + istep);
		var step = route.steps[istep];
		stepMarkers.push(new google.maps.Marker({
			//TODO : test if working without parseFloat()
			position: {lat: parseFloat(step.end_location.lat), lng: parseFloat(step.end_location.lng)},
			icon: stepIcon,
			map: map
		}));
	}
}

function setPanoramaMarkers(route) {
	var panoIcon = {
			url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank-lv.png', // url
			scaledSize: new google.maps.Size(6, 6), // scaled size
			origin: new google.maps.Point(0,0), // origin
			anchor: new google.maps.Point(0,0) // anchor
	};
	var panoIconWrong = {
			url: 'https://maps.google.com/mapfiles/kml/paddle/ylw-blank-lv.png', // url
			scaledSize: new google.maps.Size(6, 6), // scaled size
			origin: new google.maps.Point(0,0), // origin
			anchor: new google.maps.Point(0,0) // anchor
	};
	var istep = 0;
//	get the last step with panoramas
	for(; istep < route.steps.length; istep++)
		if(route.steps[istep].panoramas == null)
			break;

	var step = route.steps[istep - 1];
	console.log("Adding pano marker for step " + (istep - 1));
	for(var ipano = 0; ipano < step.panoramas.length; ipano++) {
		var panorama = step.panoramas[ipano];
		var marker = new google.maps.Marker({
			position: {lat: parseFloat(panorama.location.lat), lng: parseFloat(panorama.location.lng)},
			icon: panoIcon,
			map: map
		});
		attachPanoIdMessage(marker, panorama.panoId);      
		panoramaMarkers.push(marker);
	}
	for(var iWrongWay = 0; iWrongWay < step.wrongWayPanoramas.length; iWrongWay++) {
		var wrongWayPanoramaArray = step.wrongWayPanoramas[iWrongWay];
		for(var ipano = 0; ipano < wrongWayPanoramaArray.length; ipano++) {
			var panorama = wrongWayPanoramaArray[ipano];
			var marker = new google.maps.Marker({
				position: {lat: parseFloat(panorama.location.lat), lng: parseFloat(panorama.location.lng)},
				icon: panoIconWrong,
				map: map
			});
			attachPanoIdMessage(marker, panorama.panoId);
			//panoramaMarkers.push(marker);
		}
	}
	if(istep == route.steps.length)
		return false;
	return true;
}

function attachPanoIdMessage(marker, message) {
	var infowindow = new google.maps.InfoWindow({
		content: message
	});

	marker.addListener('click', function() {
		infowindow.open(marker.get('map'), marker);
	});
}
