function showDisclaimer() {
      document.getElementById('disclaimer-modal').classList.add('is-active');
    }

    function closeDisclaimer() {
      document.getElementById('disclaimer-modal').classList.remove('is-active');
    }
    // Listen for carpool creation/join events and update CO2 savings
    document.addEventListener('carpool-created', async (event) => {
      try {
        const { distanceMiles, numPassengers } = event.detail;
        const result = await updateCO2SavingsForCarpool(distanceMiles, numPassengers);
        
        if (result.success) {
          console.log(`CO2 savings updated: ${formatCO2Savings(result.co2Savings)}`);
          
          // Show a success message to the user
          const notification = document.createElement('div');
          notification.className = 'notification is-success is-light';
          notification.style.position = 'fixed';
          notification.style.bottom = '20px';
          notification.style.right = '20px';
          notification.style.zIndex = '1000';
          notification.innerHTML = `
            <button class="delete" onclick="this.parentElement.remove()"></button>
            <strong>🌱 Great job!</strong>
            <p>You've saved approximately <strong>${formatCO2Savings(result.co2Savings)}</strong> by carpooling!</p>
            <p>Your total CO₂ savings: <strong>${formatCO2Savings(parseFloat(document.getElementById('co2-savings').textContent) + result.co2Savings)}</strong></p>
          `;
          document.body.appendChild(notification);
          
          // Auto-remove notification after 5 seconds
          setTimeout(() => {
            notification.remove();
          }, 10000);
        } else {
          console.error('Failed to update CO2 savings:', result.error);
        }
      } catch (error) {
        console.error('Error handling carpool creation:', error);
      }
    });
    
    // Also listen for carpool-joined events (same as created for now)
    document.addEventListener('carpool-joined', (event) => {
      document.dispatchEvent(new CustomEvent('carpool-created', { detail: event.detail }));
    });

    document.getElementById("eventsJS").innerHTML += '';

    function myTimer(i) {
      let control = document.getElementsByClassName("control");
      for (let i = 0; i < control.length; i++) {

        control[i].style.color = "white"
      }
      let button = document.getElementsByClassName("button");
      for (let i = 0; i < button.length; i++) {
        button[i].style.color = "#ffffff";
        button[i].style.background = "#3c3c3c";
        button[i].style.border = "#bcae98";
      }
      clearInterval(myTimer);
    }
    function navBurger() {
      var burger = document.getElementById('nav-toggle');
      var menu = document.getElementById('navbarMenuHeroC');
      burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
      });
    }
    navBurger()

