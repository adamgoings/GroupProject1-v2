var map;
var service;
var infowindow;

function initialize(location) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    zoom: 10,
  })

  service = new google.maps.places.PlacesService(map);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    createMarker(results[0])

  }
}

function createMarker(place) {
  infowindow = new google.maps.InfoWindow();
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function drawDescriptions(jobs) {
  $('#jobListing ul').empty();

  jobs.forEach(job => {
    $('#jobListing ul').append(
      `<li>${job.name}</li>`
    )
  })
}

$("#searchBtn").click(function(){
  $("#searchDiv").show(300);
});


$("#goBtn").click(function(){
  var address = $("#address").val().trim().replace(/\s/g, "+");
  var title = $("#title").val().trim().replace(/\s/g, "+");
  var mapUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${address}&search=${title}&key=AIzaSyD53-ljlOxbdXzMatJky9Voz8M4RLig7kw`;
  var zipQueryURL = `https://api.ziprecruiter.com/jobs/v1?search=${title}%20Job&location=${address}&radius_miles=25&days_ago=10&jobs_per_page=10&page=1&api_key=gjetj6yzdta73384442bezn9sp8tfwbe`;

  $.ajax({
    url: mapUrl,
    method: 'GET'
  }).then((res) => {
    var lng = res.results["0"].geometry.location.lng;
    var lat = res.results["0"].geometry.location.lat;

    var locate = new google.maps.LatLng(lat, lng);
    initialize(locate);

    $.ajax({
      url: zipQueryURL,
      method: 'GET',
    }).then((zipData) => {
      const companies = zipData.jobs.map(job => {
        return job.hiring_company.name
      })

      drawDescriptions(zipData.jobs);

      companies.forEach(company => {
        var request = {
          location: locate,
          radius: '3500',
          query: company
        }
        service.textSearch(request, callback);
      });

    });
  })
})