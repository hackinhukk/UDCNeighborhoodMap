// Declaring Global Variables
let map;
let infoWindow;
let bounds;
const LOCATION_DATA = [
  {
    title: 'Exxon',
    location: {
      lat:40.668926,
      lng:-75.220224
    }
  },
  {
    title: 'CVS',
    location: {
      lat:40.677652,
      lng: -75.210306
    }
  },
  {
    title: 'Dunkin Donuts',
    location: {
      lat:40.677034,
      lng:-75.21087
    }
  },
  {
    title: "Papa John's",
    location: {
      lat:40.679594,
      lng: -75.247009
    }
  },
  {
    title: 'Wawa',
    location: {
      lat:40.687049,
      lng:-75.209854
    }
  }
];

function initMap() {
  const GLENDON_BOROUGH = {
    lat:40.666093,
    lng: -75.234634
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: GLENDON_BOROUGH
  });

  infoWindow = new google.maps.InfoWindow();

  bounds = new google.maps.LatLngBounds();

  ko.applyBindings(new viewModel());
}

let locationMarkerVM = function(data) {
  let self = this;

  this.title = data.title;
  this.location = data.location;
  this.address = '';

  this.visible = ko.observable(true);

  // This will create the default Icon Marker
  let defaultIcon = makeMarkerIcon('FF0404');
  // Create a "highlighted location" marker color for when
  // the user mouses over the marker.
  let highlightedIcon = makeMarkerIcon('1245FC');
  // foursquare API
  let clientID = 'XOJGPXSP35ACPHN42PTCL13OTCJDYKTVSU2XD0MXE2T3RMRZ';
  let clientSecret = 'TKG2ZR40KB1UTLKNJM5EEFW4JEPVNI1ZAEMTK5LJVVN2XPB0';
  // get JSON request of response from foursquare data
  let reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.location.lat + ',' + this.location.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.title;

  $.getJSON(reqURL).done(function(data) {
    let results = data.response.venues[0];
    self.address = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'Not Loading';
  }).fail(function() {
    alert('Something went wrong with foursquare API request');
  });

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
  this.marker.addListener('click', function() {
    populateInfoWindow(this, self.address, infoWindow);
    toggleAnimation(this);
    map.panTo(this.getPosition());
  });

  // Event Listeneres to change icon colors
  // as you mouseover and remove your mouse from
  // the icon on the map.

  this.marker.addListener('mouseover', function(){
    this.setIcon(highlightedIcon);
  });

  this.marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });

  // show item information when selected from the dropdown list.
  self.showLoc = function(location) {
    google.maps.event.trigger(self.marker, 'click');
  };
}

// View Model overall, includes list */
let viewModel = function() {
  let self = this;

  self.searchLoc = ko.observable('');

  self.locationList = ko.observableArray([]);

  // add location markers for each location
  LOCATION_DATA.forEach(function(location) {
    self.locationList.push( new locationMarkerVM(location));
  });

  // location results filtered from input
  self.filterResults = ko.computed(function() {
    let query = this.searchLoc().toLowerCase();
    if (query) {
      return ko.utils.arrayFilter(self.locationList(), function(location) {
        let str = location.title.toLowerCase();
        let result = str.includes(query);
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

// This function populates the infowindow when the marker is clicked.
// one infowindow will open on the marker that is either clicked or selected
// via the list, and populate above the marker's position.
function populateInfoWindow(marker, address, infowindow) {
  // Check to make sure the infowindow is not already opened on this specific marker
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;

    // Make sure the marker property is cleared when the infowindow is closed by the user.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    let windowContent = '<h3>' + marker.title + '</h4>' + '<p>' + address + '</p>';
    infowindow.setContent(windowContent);
    infowindow.open(map, marker)
  }
}

function toggleAnimation(marker) {
  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
  }
}
// This function takes in a color, and then creatres a new
// marker icon with the input color.  The icon will be 21 px wide
// by 34 px high.
function makeMarkerIcon(markerColor) {
  let markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// handle google maps retreival error
function googleMapsError() {
  alert('Error occured loading Google Maps API.');
}
