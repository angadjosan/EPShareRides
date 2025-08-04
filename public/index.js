
    let value2;
    let data1;
    //Sends get request to mongo users db
    var request = new Request("/api/users", {
      method: "GET",
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      })
    });
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        data1 = data;
        for (let k = 0; k < data1.length; k++) {
          //makes user email equal what we get from db
          if (data1[k].email === "<%= email %>") {
            value2 = data1[k].address;
          }
          else {
            continue;
          }
        }
      })


    //create vars
    let carpooledEvents = []
    let userData1;
    let carpoolPart;
    let carpooledEvent
    let eventsW;
    let selectedCarpool = null;
    let eventsW2 = [];
    let datarray = [];
    let routeType;
    let arr = [];

    //get from mongo carpools db
    var request = new Request("/api/carpools", {
      method: "GET",
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      })
    });
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        //store data
        userData1 = data;

        //checks if user has registered for event
        function checkIfRegistered(userData1) {


          for (var i = 0; i < userData1.length; i++) {
            carpoolPart = userData1[i].carpoolers.find((x) => x.email === "<%= email %>")
            if (carpoolPart != undefined) {
              carpoolPart = carpoolPart.email
            }
            if (carpoolPart == "<%= email %>") {
              carpooledEvent = eventsW2.find((x) => x._id === userData1[i].nameOfEvent)
              if (carpooledEvent != undefined) {
                carpooledEvents.push(carpooledEvent)
              }
            }
          }


          turnRegistered(carpooledEvents)
        }

        function turnRegistered(eventsToDisable) {

          for (var i = 0; i < eventsToDisable.length; i++) {
            document.getElementById(eventsToDisable[i]._id).disabled = true;
            document.getElementById(eventsToDisable[i]._id).innerHTML = "Registered for this event"
          }
        }

        function getDayOfWeek(string) {
          const d = new Date(string);
          const dayOfWeek = d.getDay();

          // Example: Get the name of the weekday (not just a number)
          const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDay = weekdays[dayOfWeek];
          return (currentDay)
        }

        function formatDate(date) {
          const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          var date = new Date(date);

          const day = weekdays[date.getDay()];
          const month = date.getMonth();
          const year = date.getFullYear();
          return `${day}, ${months[month + 1]} ${date.getDate()}, ${year}`;
        }

        function sendData(data) {
          datarray.push(data);
        }

        function isFuture(dateStr) {
          const now = new Date();
          const d = new Date(dateStr);
          return d > now;
        }

        var request = new Request("/api/events", {
          method: "GET",
          headers: new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json',
          })
        });
        fetch(request)
          .then((response) => response.json())
          .then((data) => {

            eventsW = data.filter(e => isFuture(e.date));
            eventsW2 = sortJSON(eventsW, 'date', '123');

            for (var i = 0; i < eventsW2.length; i++) {
              var obj = eventsW2[i];
              var date = formatDate(obj["date"]);
              var time = new Date(obj["date"]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });


              document.getElementById("eventsJS").innerHTML += `<article class="panel is-link has-text-centered" style=" margin-top: 10px;" >
         <div style="float: left; margin: 7px; left:0px; position: absolute " class="booker" >
          <span class="panel-icon" style='color: white; display: inline'>
            <i class="fas fa-book" aria-hidden="true" style="margin: 13px; margin-left: 15px;"></i>
            <p style="color: white; display: inline; font-size: 15px; " >Booked by `+ obj["firstName"] + ` ` + obj["lastName"] + `</p>
          </span>
         </div>
         <p class="panel-heading link-heading" style="margin-top: -10px;background: linear-gradient(105deg, #3273DC, #275CBF); " >

         `+ obj["eventName"] + `


         </p>


         <div class="panel-block">
          <p class="control has-icons-left" style="width: 100px;">

            <span style="color: #999999; margin-right: 5px;"><i class="fa-solid fa-location-dot "></i></span>Location: `+ obj["wlocation"] + `<br class="extraspace" style='display: none; '>  <span id="clock"  style="color: #999999; margin-right: 5px; margin-left: 10px;"><i class="fa-solid fa-clock "></i></span> Date: ` + date + `, ` + time + `
           </p>
          <div class="buttons upcoming-buttons" style="float: left; display: inline-block;">

          <button class="button js-modal-trigger" style="margin-right: 5px;" data-target="modal-js-example" id="`+ obj["_id"] + `_offer` + `" onclick=sendData('` + obj["_id"] + `')>Offer to carpool</button>

          <button class="button js-modal-trigger" data-target="modal-js-register" id="`+ obj["_id"] + `" onclick=sendData('` + obj["_id"] + `')>Join a carpool</button>
           </div>
           </div>




         </article>`;

            }
            checkIfRegistered(userData1)

            //sort events by date
            function sortJSON(arr, key, way) {
              return arr.sort(function (a, b) {
                var datex = a[key]; var datey = b[key];

                datex = new Date(datex)
                datey = new Date(datey)
                x = datex.getTime() / 1000
                y = datey.getTime() / 1000
                if (way === '123') { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
                if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
              });
            }

            // eventsW2 = sortJSON(eventsW,'date', '123'); 




            document.getElementById("filter").onchange = filter;
            function filter() {
              document.getElementById("eventsJS").innerHTML = ``
              for (var i = 0; i < eventsW.length; i++) {
                var obj = eventsW[i];
                var date = formatDate(obj["date"]);
                var time = new Date(obj["date"]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                if (document.getElementById("filter").value == "all") {
                  // `<div style="float: right; margin: 10px; width: 35px; height: 35px; background-color: hsl(348, 100%, 61%); border-radius: 5px
                  //    " <="" div=""></div>`
                  document.getElementById("eventsJS").innerHTML += `<article class="panel is-link has-text-centered" style=" margin-top: 10px;" >
                     <div style="float: left; margin: 7px; left:0px; position: absolute " class="booker" >
                       <span class="panel-icon" style='color: white; display: inline'>
                         <i class="fas fa-book" aria-hidden="true" style="margin: 13px; margin-left: 15px;"></i>
                         <p style="color: white; display: inline; font-size: 15px; " >Booked by `+ obj["firstName"] + ` ` + obj["lastName"] + `</p>
                       </span>
                     </div>
                     <p class="panel-heading link-heading" style="margin-top: -10px;background: linear-gradient(105deg, #3273DC, #275CBF); " >

                    `+ obj["eventName"] + `


                     </p>


                     <div class="panel-block">
                       <p class="control has-icons-left" style="width: 100px;">

                         <span style="color: #999999; margin-right: 5px;"><i class="fa-solid fa-location-dot "></i></span>Location: `+ obj["wlocation"] + `<br class="extraspace" style='display: none; '>  <span id="clock"  style="color: #999999; margin-right: 5px; margin-left: 10px;"><i class="fa-solid fa-clock "></i></span> Date: ` + date + `, ` + time + `
                        </p>
                       <div class="buttons upcoming-buttons" style="float: left; display: inline-block;">

                       <button class="button js-modal-trigger" style="margin-right: 5px;" data-target="modal-js-example" id="`+ obj["_id"] + `_offer` + `" onclick=sendData('` + obj["_id"] + `')>Offer to carpool</button>

                       <button class="button js-modal-trigger" data-target="modal-js-register" id="`+ obj["_id"] + `" onclick=sendData('` + obj["_id"] + `')>Join a carpool</button>
                        </div>
                        </div>




                    </article>`;
                }

                else if (document.getElementById("filter").value == obj["category"]) {
                  document.getElementById("eventsJS").innerHTML += `<article class="panel is-link has-text-centered" style=" margin-top: 10px;" >
                <div style="float: left; margin: 7px; left:0px; position: absolute " class="booker" >
                  <span class="panel-icon" style='color: white; display: inline'>
                    <i class="fas fa-book" aria-hidden="true" style="margin: 13px; margin-left: 15px;"></i>
                    <p style="color: white; display: inline; font-size: 15px; " >Booked by `+ obj["firstName"] + ` ` + obj["lastName"] + `</p>
                  </span>
                </div>
                <p class="panel-heading link-heading" style="margin-top: -10px;background: linear-gradient(105deg, #3273DC, #275CBF); " >

               `+ obj["eventName"] + `


                </p>


                <div class="panel-block">
                  <p class="control has-icons-left" style="width: 100px;">

                    <span style="color: #999999; margin-right: 5px;"><i class="fa-solid fa-location-dot "></i></span>Location: `+ obj["wlocation"] + `<br class="extraspace" style='display: none; '>  <span id="clock"  style="color: #999999; margin-right: 5px; margin-left: 10px;"><i class="fa-solid fa-clock "></i></span> Date: ` + date + `, ` + time + `
                   </p>
                  <div class="buttons upcoming-buttons" style="float: left; display: inline-block;">

                  <button class="button js-modal-trigger" style="margin-right: 5px;" data-target="modal-js-example" id="`+ obj["_id"] + `_offer` + `" onclick=sendData('` + obj["_id"] + `')>Offer to carpool</button>

                  <button class="button js-modal-trigger" data-target="modal-js-register" id="`+ obj["_id"] + `" onclick=sendData('` + obj["_id"] + `')>Join a carpool</button>
                   </div>
                   </div>




               </article>`;
                }

              }

              checkIfRegistered(userData1)
              modalFunctions()
            }


            function modalFunctions() {


              function openModal($el) {
                $el.classList.add('is-active');






                document.getElementById("registerJS").innerHTML = ``;

                //checks if the carpools id matches an events id

                for (var i = 0; i < eventsW2.length; i++) {
                  if (eventsW2[i]._id == datarray[datarray.length - 1]) {
                    eventTime = new Date(eventsW2[i].date);

                    let dayOfWeek = eventTime.getDay();
                    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    let day = weekdays[dayOfWeek];

                    // Format time as AM/PM
                    eventTime = eventTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

                    document.getElementById("registerTitle").innerText = "Choose a carpool · " + day + " at " + eventTime
                  }
                }


                for (var i = 0; i < userData1.length; i++) {
                  var obj = userData1[i];

                  if (obj["nameOfEvent"] == datarray[datarray.length - 1]) {



                    //datarray[datarray.length - 1]



                    if (obj["route"] == "route") {
                      routeType = "Riders' Homes"
                    }
                    else if (obj["route"] == "point") {
                      routeType = "Common meeting point"
                    }
                    else if (obj["route"] == "eps-campus") {
                      routeType = "EPS Campus"
                    }

                    document.getElementById("registerJS").innerHTML +=
                      `<div class="notification"  style="padding: 10px;   margin-bottom: 10px;">
                                                      <div class="button  selectCarpool" style=" margin-left: 10px; margin-top: 4px; background-color: transparent; float: right" onclick=" selectCarpool(this)" id="` + obj["_id"] + `">Select</div>
                                                              <div style="float: right; margin-top: 3px;"  >` + obj["carpoolers"].length + `/` + obj["seats"] + ` signed up</div>
                                                                                        Organizer: <a style="color: #3273dc" href="mailto:` + obj["email"] + `">` + obj["email"] + `</a>
                                                                <br> Driver name: ` + obj["firstName"] + ` ` + obj["lastName"] + `
                                                                <br> Phone: ` + obj["phone"] + `
                                                                <br> Car: ` + obj["carMake"] + `
                                                                <br> Route type: ` + routeType + `
                                                                <br> Arrival time: ` + obj["arrivalTime"] + `
                       <br>                                                                                          </div>   `
                  }
                }

                if (value2 != "none" && value2 != null && value2 != false) {
                  document.getElementById("address-input").value = value2;
                  document.getElementById("address-input2").value = value2;
                }
              }

              function closeModal($el) {
                $el.classList.remove('is-active');
              }

              function closeAllModals() {
                (document.querySelectorAll('.modal') || []).forEach(($modal) => {
                  closeModal($modal);
                });
              }

              // Add a click event on buttons to open a specific modal
              (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
                const modal = $trigger.dataset.target;
                const $target = document.getElementById(modal);

                $trigger.addEventListener('click', () => {
                  openModal($target);
                });
              });

              // Add a click event on various child elements to close the parent modal
              (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .cancel') || []).forEach(($close) => {
                const $target = $close.closest('.modal');

                $close.addEventListener('click', () => {
                  closeModal($target);
                });
              });

              // Add a keyboard event to close all modals
              document.addEventListener('keydown', (event) => {
                const e = event || window.event;

                if (e.keyCode === 27) { // Escape key
                  closeAllModals();
                }
              });

            }
            modalFunctions()

          })
          .catch((error) => {
            console.error(error);
          });

        /* 
        The addressAutocomplete takes as parameters:
        - a container element (div)
        - callback to notify about address selection
        - geocoder options:
        - placeholder - placeholder text for an input element
        - type - location type
        */





        document.body.onmousedown = function () {
          var ac1 = document.getElementById('autocomplete-container');
          var ac2 = document.getElementById('autocomplete-container2');
          var ac3 = document.getElementById('autocomplete-container3');
          if (ac1) ac1.classList.remove("is-loading");
          if (ac2) ac2.classList.remove("is-loading");
          if (ac3) ac3.classList.remove("is-loading");
        }



        
      
        

        addressAutocomplete(document.getElementById("autocomplete-container"), "address-input", (data) => {
          arr.push(data.properties.formatted);
        }, {

          placeholder: "Enter an address here"

        });

    
        addressAutocomplete(document.getElementById("autocomplete-container2"), "address-input2", (data) => {
          arr.push(data.properties.formatted);
        }, {

          placeholder: "Enter an address here"

        });
        

       

        // Code for the second function


        // var request = new Request("/api/carpools", {
        //    method: "GET",
        //    headers: new Headers({
        //      Accept: 'application/json',
        //      'Content-Type': 'application/json',
        //    })
        //  });
        //  fetch(request)
        //    .then((response) => response.json())
        //    .then((data) => {

        //    })
        //add first name + last name: address to the carpoolers list in correct carpool id (selectedCarpool) carpools database








        // Call the first function and then execute the second function using .then()




        // tell the embed parent frame the height of the content
        if (window.parent && window.parent.parent) {
          window.parent.parent.postMessage(["resultsFrame", {
            height: document.body.getBoundingClientRect().height,
            slug: "akzrtm26"
          }], "*")
        }

        // always overwrite window.name, in case users try to set it manually
        window.name = "result"






        var route_type = document.getElementById("route-type");
        var address_label = document.getElementById("address-label");

        function changeLabel() {
          if (route_type.value == "route") {
            address_label.innerText = "Your home address";
            document.getElementById("address-input").disabled = false;
            if (value2 != "none" && value2 != false) {
              document.getElementById("address-input").value = value2;
            }
          }
          else if (route_type.value == "point") {
            address_label.innerText = "Meeting point";
            document.getElementById("address-input").value = "";
            document.getElementById("address-input").disabled = false;
          }
          else if (route_type.value == "eps-campus") {
            address_label.innerText = "EPS Campus";
            document.getElementById("address-input").value = "10613 NE 38th Place, Kirkland, WA 98033";
            document.getElementById("address-input").disabled = true;
          }
        }

        route_type.onchange = changeLabel;
        changeLabel();




      })
      .catch((error) => {
        console.error(error)
      });

    function sendData(data) {
      datarray.push(data);
    }

    function offer(id) {
      let newArray = document.getElementById("address-input").value
      let DriverFName = document.getElementById("fname").value;
      let DriverLName = document.getElementById("lname").value;
      let DriverEmail = document.getElementById("email").value;
      let DriverPhone = document.getElementById("phone").value;
      let CarMake = document.getElementById("carmake").value;
      let Seats = document.getElementById("seats").value;
      let ArrivalTime = document.getElementById("arrivaltime").value;
      let category = document.getElementById("carpool-category").value;
      let route = document.getElementById("route-type").value;
      let Carpoolers = []

      offerACar(DriverFName, DriverLName, DriverEmail, DriverPhone, CarMake, Seats, route, newArray, Carpoolers, datarray[datarray.length - 1], ArrivalTime, category);
    }


    async function offerACar(firstName, lastName, email, phone, carMake, seats, route, wlocation, carpoolers, eventId, arrivalTime, category) {
      try {
      
        // First, fetch the event to get its category and address
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event details');
        }
        const event = await eventResponse.json();

        // Calculate distance between the carpool start location and the event address
        const startCoords = await getCoordinates(wlocation);
        const eventCoords = await getCoordinates(event.address);
        let distanceMiles = calculateDistance(
          startCoords.lat,
          startCoords.lng,
          eventCoords.lat,
          eventCoords.lng
        );
        // Ensure minimum distance of 1 mile and round to 1 decimal place
        distanceMiles = Math.max(1, parseFloat(distanceMiles.toFixed(1)));

        const numPassengers = 1; // Just the driver initially

        let userEmail = "<%= email %>";
        const newcarpools = {
          firstName,
          lastName,
          email,
          phone,
          carMake,
          seats,
          route,
          wlocation,
          carpoolers,
          // Store the event ID with the carpool so we can look up details later
          nameOfEvent: eventId,
          userEmail,
          arrivalTime,
          category: event.category || 'other',
          distanceMiles,
          numPassengers
        };

        const jsonData = JSON.stringify(newcarpools);
        const url = "/api/carpools";

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonData,
        });

        if (!response.ok) {
          throw new Error('Failed to create carpool');
        }

        // Emit event for CO2 savings update and redirect on success
        document.dispatchEvent(new CustomEvent('carpool-created', {
          detail: {
            distanceMiles: distanceMiles,
            numPassengers: numPassengers
          }
        }));

        window.location.href = '/mycarpools';
      } catch (error) {
        console.error("Error:", error);
        alert('Failed to create carpool. Please try again.');
      }
    }


    function selectCarpool(element) {
      if (element.classList[2] == 'is-focused') {
        unfocus();
        selectedCarpool = null;
        // Reset counter display
        const counterElement = element.parentElement.querySelector('div[style*="float: right; margin-top: 3px;"]');
        if (counterElement) {
          const carpool = userData1.find(c => c._id === element.id);
          if (carpool) {
            counterElement.innerText = carpool.carpoolers.length + '/' + carpool.seats + ' signed up';
          }
        }
      } else {
        unfocus();
        element.classList.add('is-focused');
        element.innerHTML = "Selected";
        selectedCarpool = element.id;

        // Update counter display
        const counterElement = element.parentElement.querySelector('div[style*="float: right; margin-top: 3px;"]');
        if (counterElement) {
          const carpool = userData1.find(c => c._id === element.id);
          if (carpool) {
            counterElement.innerText = (carpool.carpoolers.length + 1) + '/' + carpool.seats + ' signed up';
          }
        }
      }
    }

    function unfocus() {
      var selects = document.getElementsByClassName('selectCarpool')
      for (const element of selects) { // You can use `let` instead of `const` if you like
        element.classList.remove('is-focused');
        element.innerHTML = "Select"
      }
    }



    // Function to get coordinates from an address (simplified version)
    async function getCoordinates(address) {
      // In a real app, you would use a geocoding service here
      // For this simplified version, we'll return a default location
      // You should replace this with actual geocoding logic if possible
      return {
        lat: 47.6205 + (Math.random() * 0.1 - 0.05), // Random location near Seattle
        lng: -122.3493 + (Math.random() * 0.1 - 0.05)
      };
    }


    // Haversine formula to calculate distance between two points
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 3958.8; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in miles
    }

    async function joinCarpool() {
      let newArray = document.getElementById("address-input2").value;
      var personName = "<%= firstName %> <%= lastName %>";
      var email = "<%= email %>";
      var carpoool;
      
      if (selectedCarpool != null) {
        for (var i = 0; i < userData1.length; i++) {
          carpoool = userData1[i];
          if (carpoool["_id"] == selectedCarpool) {
            // Get coordinates for the user's address and carpool address
            const userCoords = await getCoordinates(newArray);
            const carpoolCoords = await getCoordinates(carpoool.wlocation || carpoool.address);
            
            // Calculate straight-line distance in miles
            let distanceMiles = calculateDistance(
              userCoords.lat, 
              userCoords.lng, 
              carpoolCoords.lat, 
              carpoolCoords.lng
            );
            
            // Ensure minimum distance of 1 mile and round to 1 decimal place
            distanceMiles = Math.max(1, parseFloat(distanceMiles.toFixed(1)));
            
            const numPassengers = carpoool.carpoolers.length + 1; // Including the new passenger
            
            carpoool["carpoolers"].push({
              "address": newArray,
              "carpool": selectedCarpool
            })

            const addNewMember = {
              address: newArray,
              carpool: selectedCarpool,
              distanceMiles: distanceMiles,
              numPassengers: numPassengers
            }

            jsonData = JSON.stringify(addNewMember)

            url = "/api/joinCarpool"

            try {
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                },
                body: jsonData,
              });

              if (response.redirected) {
                // Emit event for CO2 savings update
                document.dispatchEvent(new CustomEvent('carpool-joined', {
                  detail: {
                    distanceMiles: distanceMiles,
                    numPassengers: numPassengers
                  }
                }));
                
                window.location.href = response.url;
              }
            } catch (error) {
              console.error('Error joining carpool:', error);
            }
          }
        }
      }
    }


    function closeAllModals() {
      (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
      });
    }
    function closeModal($el) {
      $el.classList.remove('is-active');
    }


    async function createevent() {
      firstName = "<%= firstName %> ";
      lastName = "<%= lastName %> ";
      eventName = document.getElementById("ename").value;
      wlocation = document.getElementById("elocation").value;
      dateb = document.getElementById("edate").value; //hotdogs
      var components = dateb.split(/[-T:]/);

      const address = document.getElementById("create_address").value;

      // Create a new Date object
      var dateTimeObject = new Date(components[0], components[1] - 1, components[2], components[3], components[4]);
      // Format the Date object as a string in the desired format
      date = dateTimeObject.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      category = document.getElementById("ecategory").value;
      
      // Get coordinates for the user's address and event location
      const userCoords = await getCoordinates(address);
      const eventCoords = await getCoordinates(wlocation);
      
      // Calculate straight-line distance in miles
      let distanceMiles = calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        eventCoords.lat, 
        eventCoords.lng
      );
      
      // Ensure minimum distance of 1 mile and round to 1 decimal place
      distanceMiles = Math.max(1, parseFloat(distanceMiles.toFixed(1)));
      
      const numPassengers = 1; // Just the driver initially
      
      const data = {
        eventName,
        wlocation,
        date,
        category,
        addressToPut: address,
        distanceMiles,
        numPassengers
      };

      const jsonData = JSON.stringify(data);
      const url = "/api/events";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonData,
        });
        
        console.log(response);
        
        // Emit event for CO2 savings update
        if (response.ok) {
          document.dispatchEvent(new CustomEvent('carpool-created', {
            detail: {
              distanceMiles: distanceMiles,
              numPassengers: numPassengers
            }
          }));
        }
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }

