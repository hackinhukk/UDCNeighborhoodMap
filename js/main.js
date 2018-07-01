// Declaring Global Variables
var map;
var infoWindow;
var bounds;
var locationData = [
  {
    title: "Exxon",
    location: {
      lat:40.668926,
      lng:-75.220224
    }
  },
  {
    title: "CVS",
    location: {
      lat:40.677652,
      lng: -75.210306
    }
  },
  {
    title: "Dunkin Donuts",
    location: {
      lat:40.677034,
      lng:-75.21087
    }
  },
  {
    title: "Glendon Borough Town Hall",
    location: {
      lat:40.666093,
      lng: -75.234634
    }
  },
  {
    title: "Wawa",
    location: {
      lat:40.687049,
      lng:-75.209854
    }
  }
];

function initMap() {
  var glendonBorough = {
    lat:40.666093,
    lng: -75.234634
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: glendonBorough
  });

  infoWindow = new google.maps.InfoWindow();

  bounds = new google.maps.LatLngBounds();

  ko.applyBindings(new ViewModel());
}

var LocationMarkerVM = function(data) {
  var self = this;

  self.title = data.title;
  self.location = data.location;

  self.visible = ko.observable(true);

  // This will create the default Icon Marker
  var defaultIcon = makeMarkerIcon('FF0404');
  // Create a "highlighted location" marker color for when
  // the user mouses over the marker.
  var highlightedIcon = makeMarkerIcon('1245FC');

  // Create a marker for each location, and put it into markers array
  self.marker = new google.maps.Marker({
    position: self.location,
    title: self.title,
    animation: google.maps.Animation.DROP,
    icon: defaultIcon
  });

  self.filterMarkerLoc = ko.computed(function() {
    // set the marker and set the bounds.
    if(self.visible() == true) {
      self.marker.setMap(map);
      bounds.extend(self.marker.position);
      map.fitBounds(bounds);
    } else {
      self.marker.setMap(null);
    }
  });

  // create click event to open an infowindow at the clicked marker.
  self.marker.addListener('click', function() {
    populateInfoWindow(this, infoWindow);
    map.panTo(self.getPosition());
  });

  // Event Listeneres to change icon colors
  // as you mouseover and remove your mouse from
  // the icon on the map.

  self.marker.addListener('mouseover', function(){
    self.setIcon(highlightedIcon);
  });

  self.marker.addListener('mouseout', function() {
    self.setIcon(defaultIcon);
  });

  // show item information when selected from the dropdown list.
  self.showLoc = function(location) {
    google.maps.event.trigger(self.marker, 'click');
  };
}

// View Model overall, includes list */
var ViewModel = function() {
  var self = this;

  self.searchLoc = ko.observable('');

  self.locationList = ko.observableArray([]);

  // add location markers for each location
  locationData.forEach(function(location) {
    self.locationList.push( new LocationMarkerVM(location));
  });

  // location results filtered from input
  self.filterResults = ko.computed(function() {
    var query = this.searchLoc().toLowerCase();
    if (query) {
      return ko.utils.arrayFilter(self.locationList(), function(location) {
        var str = location.title.toLowerCase();
        var result = str.includes(query);
        location.visible(result);
          return result;
      });
    }
    self.locationList().forEach(function(location) {
      location.visible(true);
    });
    return self.locationList();
  }, self);
};

// This function takes in a color, and then creatres a new
// marker icon with the input color.  The icon will be 21 px wide
// by 34 px high.
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
