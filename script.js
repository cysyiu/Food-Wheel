let restaurants = [];
let selectedRestaurants = [];
const colors = ['#FF4444', '#33CC33', '#3366CC', '#FFCC00', '#CC33CC', '#00CCCC', '#FF9933', '#66CC99', '#9933FF', '#FF6666'];

// Map common cuisine keywords to Google Places API types
const cuisineTypeMap = {
    'japanese': 'japanese_restaurant',
    'japanese restaurant': 'japanese_restaurant',
    'italian': 'italian_restaurant',
    'italian restaurant': 'italian_restaurant',
    'chinese': 'chinese_restaurant',
    'chinese restaurant': 'chinese_restaurant',
    'mexican': 'mexican_restaurant',
    'mexican restaurant': 'mexican_restaurant',
    'indian': 'indian_restaurant',
    'indian restaurant': 'indian_restaurant',
    'thai': 'thai_restaurant',
    'thai restaurant': 'thai_restaurant',
    'french': 'french_restaurant',
    'french restaurant': 'french_restaurant',
    'american': 'american_restaurant',
    'american restaurant': 'american_restaurant'
};

// Initialize draft wheel on page load
window.onload = () => {
    createWheel(true); // Create draft wheel with empty options
};

// Update range value display
const rangeInput = document.getElementById('range');
const rangeValue = document.getElementById('range-value');
rangeInput.addEventListener('input', () => {
    rangeValue.textContent = rangeInput.value;
});

// Search button click
document.getElementById('search-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const location = { lat: position.coords.latitude, lng: position.coords.longitude };
            searchNearby(location);
        }, error => {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

async function searchNearby(center) {
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places');
    const keyword = document.getElementById('keyword').value.trim().toLowerCase();
    const placeType = cuisineTypeMap[keyword] || 'restaurant'; // Use mapped type or default to 'restaurant'

    const request = {
        fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'businessStatus', 'types'],
        locationRestriction: {
            center: { lat: center.lat, lng: center.lng },
            radius: parseInt(rangeInput.value),
        },
        includedPrimaryTypes: [placeType],
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
        language: 'en',
    };

    try {
        const { places } = await Place.searchNearby(request);
        let filteredPlaces = places;

        // Apply client-side filtering if keyword isn't a mapped type
        if (!cuisineTypeMap[keyword] && keyword) {
            const keywords = keyword.split(/\s+/);
            filteredPlaces = places.filter(place => {
                const name = place.displayName.toLowerCase();
                const types = place.types ? place.types.map(t => t.toLowerCase()) : [];
                return keywords.some(k => types.includes(k) || types.includes(`${k}_restaurant`) || name.includes(k));
            });
        }

        console.log(`Raw places: ${places.length}, Filtered places: ${filteredPlaces.length}, Keyword: "${keyword}", Type: "${placeType}", Radius: ${request.locationRestriction.radius}m`);

        if (filteredPlaces.length > 0) {
            // Sort by rating descending, then by userRatingCount
            filteredPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.userRatingCount || 0) - (a.userRatingCount || 0));
            restaurants = filteredPlaces.map(place => ({
                name: place.displayName,
                rating: place.rating || 'N/A',
                address: place.formattedAddress || 'N/A',
                lat: place.location ? place.location.lat() : null,
                lng: place.location ? place.location.lng() : null,
                selected: false
            }));
            // Select top 10 by default
            selectedRestaurants = restaurants.slice(0, 10).map(r => ({ ...r, selected: true }));
            restaurants = restaurants.map(r => ({
                ...r,
                selected: selectedRestaurants.some(sr => sr.name === r.name)
            }));
            displayList();
            createWheel();
            document.getElementById('spin-btn').disabled = selectedRestaurants.length === 0;
        } else {
            alert('No restaurants found for the entered keyword. Try a different keyword or leaving the keyword blank for all restaurants.');
            restaurants = [];
            selectedRestaurants = [];
            displayList();
            createWheel(true); // Show draft wheel if no results
            document.getElementById('spin-btn').disabled = true;
        }
    } catch (error) {
        console.error(error);
        alert('Error searching for restaurants. Please check your API key or try again.');
        createWheel(true); // Show draft wheel on error
    }
}

function displayList() {
    const list = document.getElementById('restaurant-list');
    list.innerHTML = '';
    restaurants.forEach((restaurant, index) => {
        const li = document.createElement('li');
        li.className = restaurant.selected ? 'highlighted' : '';
        li.innerHTML = `
            <input type="checkbox" class="select-restaurant" data-index="${index}" ${restaurant.selected ? 'checked' : ''}>
            <div>
                <strong>${restaurant.name}</strong> - Rating: <span class="rating">${restaurant.rating} ★</span><br>
                ${restaurant.address}
            </div>
        `;
        list.appendChild(li);
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('.select-restaurant').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const restaurant = restaurants[index];
            if (e.target.checked) {
                if (selectedRestaurants.length < 10) {
                    restaurants[index].selected = true;
                    selectedRestaurants.push(restaurant);
                } else {
                    e.target.checked = false;
                    alert('You can only select up to 10 restaurants for the wheel.');
                }
            } else {
                restaurants[index].selected = false;
                selectedRestaurants = selectedRestaurants.filter(r => r.name !== restaurant.name);
            }
            displayList();
            createWheel();
            document.getElementById('spin-btn').disabled = selectedRestaurants.length === 0;
        });
    });
}

function createWheel(isDraft = false) {
    const svg = d3.select('#wheel');
    svg.selectAll('*').remove(); // Clear previous wheel

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const labels = isDraft ? Array(10).fill('Option') : selectedRestaurants.map(r => r.name);
    const data = labels.map(() => 1);

    svg.attr('width', width).attr('height', height);

    const arc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    const pie = d3.layout.pie()
        .sort(null)
        .value(d => d)
        .startAngle(0)
        .endAngle(2 * Math.PI);

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors[i % colors.length])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    arcs.append('text')
        .attr('transform', d => {
            const centroid = arc.centroid(d);
            const midAngle = (d.startAngle + d.endAngle) / 2;
            const distance = radius * 0.6;
            const x = Math.sin(midAngle) * distance;
            const y = -Math.cos(midAngle) * distance;
            return `translate(${x}, ${y}) rotate(${midAngle * 180 / Math.PI + 90})`;
        })
        .attr('class', 'wheel-text')
        .text((d, i) => labels[i])
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle');
}

// Spin button
document.getElementById('spin-btn').addEventListener('click', () => {
    if (selectedRestaurants.length === 0) return;
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    const modal = document.getElementById('result-modal');
    const modalResult = document.getElementById('modal-result');
    const directionsLink = document.getElementById('directions-link');

    // Calculate random stop angle to align sector midpoint with pointer (0 degrees, top)
    const numOptions = selectedRestaurants.length;
    const degreesPerOption = 360 / numOptions;
    const randomIndex = Math.floor(Math.random() * numOptions);
    const minSpins = 3 * 360; // Minimum 3 full spins (clockwise)
    // Align the selected sector's midpoint with the pointer
    const segmentMidpointAngle = randomIndex * degreesPerOption + degreesPerOption / 2;
    const stopAngle = minSpins - segmentMidpointAngle; // Subtract to center sector under pointer

    // Animate spin (clockwise)
    const wheel = d3.select('#wheel g');
    wheel.transition()
        .duration(4000)
        .ease('cubic-out')
        .attrTween('transform', () => {
            return t => `translate(${400 / 2}, ${400 / 2}) rotate(${d3.interpolate(0, stopAngle)(t)})`;
        })
        .each('end', () => {
            const selectedRestaurant = selectedRestaurants[randomIndex];
            modalResult.textContent = `Selected: ${selectedRestaurant.name}`;
            if (selectedRestaurant.lat && selectedRestaurant.lng) {
                directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.lat},${selectedRestaurant.lng}`;
                directionsLink.style.display = 'inline-block';
            } else {
                directionsLink.style.display = 'none';
            }
            modal.style.display = 'block';
            spinBtn.disabled = false;
        });
});

// Modal close button
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('result-modal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('result-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});