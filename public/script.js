// Initialize map variables
let map, markersGroup, points = [];
let geocode = {}, carpools, events;
const center = [47.64371189816165, -122.19894455582242];
function parseGeocode(res){
  if(res.features && res.features[0]){
    const f=res.features[0];
    const lat=f.properties?.lat ?? f.geometry?.coordinates[1];
    const lon=f.properties?.lon ?? f.geometry?.coordinates[0];
    return [lat,lon];
  }
  return null;
}


// Function to initialize the map
function initMap() {
    // Check if map container exists
    if (!document.getElementById('map')) {
        console.log('Map container not found, skipping map initialization');
        return;
    }

    // Initialize the map
    map = L.map('map').setView(center, 11);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize markers group
    markersGroup = L.layerGroup().addTo(map);

    // Add click event to place markers
    map.on('click', function (e) {
        const marker = L.marker(e.latlng).addTo(markersGroup);
        points.push(e.latlng);
        console.log('Marker placed at:', e.latlng);

        // You can add a popup to the marker if needed
        // marker.bindPopup('Location: ' + e.latlng.lat.toFixed(4) + ', ' + e.latlng.lng.toFixed(4)).openPopup();
    });
}

// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', function () {
    initMap();
    loadData();
});

// Load events and carpools data in parallel
async function loadData() {
    try {
        // Fetch both events and carpools in parallel
        const [eventsResponse, carpoolsResponse] = await Promise.all([
            fetch("/api/events", { method: "GET" }),
            fetch("/api/userCarpools", { method: "GET" })
        ]);
        
        events = await eventsResponse.json();
        carpools = await carpoolsResponse.json();
        console.log(events);
        console.log(carpools);
        
        // Collect all unique addresses to geocode
        const addressesToGeocode = new Set();
        
        for (const carpool of carpools) {
            // Add carpooler addresses
            carpool.carpoolers.forEach(carpooler => {
                if (carpooler.address) {
                    addressesToGeocode.add(carpooler.address);
                }
            });
            
            // Add event address
            const event = events.find(e => e._id === carpool.nameOfEvent);
            if (event?.address) {
                addressesToGeocode.add(event.address);
            }
            
            // Add meeting location
            if (carpool.wlocation) {
                addressesToGeocode.add(carpool.wlocation);
            }
        }
        
        // Geocode all addresses in parallel
        await Promise.all(
            Array.from(addressesToGeocode).map(address => geocodeAddress(address))
        );
        
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

async function geocodeAddress(address) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=992ef3d60d434f2283ea8c6d70a4898d`;
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        
        const data = await response.json();
        console.log(data);
        geocode[address] = parseGeocode(data);
    } catch (error) {
        console.error(`Error geocoding ${address}:`, error);
    }
}

var polylines = [];

function add(carpoolId) {
    addDirectionsButton(carpoolId);
    
    // Clear existing polylines and markers
    polylines.forEach(function (polyline) {
        map.removeLayer(polyline);
    });
    markersGroup.clearLayers();
    
    let carpool = carpools.find(c => c._id === carpoolId);
    var carpoolerLocations = [];
    
    // Add markers for each carpooler
    carpool.carpoolers.forEach(carpooler => {
        addPoint(carpooler.firstName, carpooler.address, geocode[carpooler.address]);
        carpoolerLocations.push(geocode[carpooler.address]);
    });
    
    var event = events.find(e => e._id === carpool.nameOfEvent);
    
    if (carpool.route === "route") {
        console.log("route");
        
        // Add marker for meeting location (driver's house)
        const meetingMarker = L.marker(geocode[carpool.wlocation]).addTo(markersGroup);
        meetingMarker.options.shadowSize = [0, 0];
        meetingMarker.bindPopup('<i class="fa-solid fa-house" style="color: Dodgerblue; font-size: 15px"></i> ' + 
            carpool.firstName + "'s house<br> " + carpool.wlocation);
        
        // Add marker for event location
        const eventMarker = L.marker(geocode[event.address]).addTo(markersGroup);
        eventMarker.options.shadowSize = [0, 0];
        eventMarker.bindPopup('<i class="fa-solid fa-location-dot" style="color: Tomato; font-size: 15px"></i> ' + 
            event.wlocation + "<br>" + event.address);
        
        // Add meeting location to route
        carpoolerLocations.push(geocode[carpool.wlocation]);
        
        // Sort locations by distance from event (furthest first)
        const sortedLocations = sortByDistance(carpoolerLocations, geocode[event.address]);
        console.log(sortedLocations);
        
        // Draw route through all locations
        const routePolyline = L.polyline(sortedLocations, {
            color: "#3273dc",
            dashArray: "4 8"
        }).addTo(map);
        
        // Draw final segment to event
        const finalSegment = L.polyline([sortedLocations[sortedLocations.length - 1], geocode[event.address]], {
            color: "#00d1b2"
        }).addTo(map);
        
        polylines.push(routePolyline, finalSegment);
        map.fitBounds(routePolyline.getBounds());
        
    } else if (carpool.route === "point") {
        console.log("point");
        
        // Add marker for meeting point
        const meetingMarker = L.marker(geocode[carpool.wlocation]).addTo(markersGroup);
        meetingMarker.options.shadowSize = [0, 0];
        meetingMarker.bindPopup('<i class="fa-solid fa-location-crosshairs" style="color: #00d1b2; font-size: 15px"></i> Meeting point<br>' + 
            carpool.wlocation);
        
        // Add marker for event location
        const eventMarker = L.marker(geocode[event.address]).addTo(markersGroup);
        eventMarker.options.shadowSize = [0, 0];
        eventMarker.bindPopup('<i class="fa-solid fa-location-dot" style="color: Tomato; font-size: 15px"></i> ' + 
            event.wlocation + "<br> " + event.address);
        
        // Draw lines from meeting point to each carpooler
        drawMeetingPointRoutes(geocode[carpool.wlocation], carpoolerLocations, geocode[event.address]);
    }
    
    function sortByDistance(locations, destination) {
        return locations.sort((a, b) => {
            let distA = calculateDistance(a, destination);
            let distB = calculateDistance(b, destination);
            console.log(distA, distB);
            return distB - distA; // Sort descending (furthest first)
        });
    }
    
    function calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
    }
}

function drawMeetingPointRoutes(meetingPoint, carpoolerLocations, eventLocation) {
    // Draw dashed lines from each carpooler to meeting point
    for (let i = 0; i < carpoolerLocations.length; i++) {
        const route = [meetingPoint, carpoolerLocations[i]];
        const polyline = L.polyline(route, {
            color: "#3273dc",
            dashArray: "4 8"
        }).addTo(map);
        polylines.push(polyline);
    }
    
    // Draw solid line from meeting point to event
    const finalRoute = L.polyline([meetingPoint, eventLocation], {
        color: "#00d1b2"
    }).addTo(map);
    polylines.push(finalRoute);
    map.fitBounds(finalRoute.getBounds());
}

function stuff() {
    for (let i = 0; i < points.length; i++) {
        points[i].addTo(markersGroup);
    }
}

function addPoint(name, address, location) {
    console.log(location);
    const marker = L.marker(location).addTo(markersGroup);
    marker.options.shadowSize = [0, 0];
    marker.bindPopup('<i class="fa-solid fa-house" style="color: Dodgerblue; font-size: 15px"></i> ' + 
        name + "'s house<br> " + address);
}

// Add EPS marker when map is ready

if (map) {
    const epsMarker = L.marker(center).addTo(markersGroup);
    epsMarker.options.shadowSize = [0, 0];
    epsMarker.bindPopup("Eastside Preparatory School<br />Go eagles!");
}

// Handle navbar dropdown clicks
window.addEventListener("click", function (o) {
    document.getElementById("navbar-dropdown").contains(o.target) ||
        document.getElementById("name_button").contains(o.target) ||
        (document.getElementById("navbar-dropdown").style.visibility = "hidden");
});

// Shiny ripple on buttons - DISABLED
/* 
document.addEventListener('click', function (event) {
  const button = event.target.closest('.button, .modern-btn-primary, .modern-btn-secondary');
  if (!button) return;
  // Ignore disabled buttons
  if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;

  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = (event.clientX - rect.left) + 'px';
  ripple.style.top = (event.clientY - rect.top) + 'px';
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

// Keyboard activation sheen for accessibility
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const button = document.activeElement?.closest?.('.button, .modern-btn-primary, .modern-btn-secondary');
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = (rect.width / 2) + 'px';
  ripple.style.top = (rect.height / 2) + 'px';
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});
*/