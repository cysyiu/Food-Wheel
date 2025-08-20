Food Wheel
A web application that helps users find nearby restaurants and randomly select one using an interactive spinning wheel. Built with HTML, CSS, and JavaScript, it leverages the Google Places API to search for restaurants based on user-entered cuisine keywords (e.g., "Japanese restaurant") and a customizable radius (500–5000 meters). The app displays up to 20 restaurants, allows users to select up to 10 for the wheel, and features a D3.js-powered wheel that spins clockwise (minimum 3 rotations) to choose a restaurant, with results shown in a modal including Google Maps directions. A draft wheel with 10 placeholder options is shown on load or if no results are found.
Features:

Search nearby restaurants by cuisine keyword and radius.
Interactive D3.js spinning wheel with vibrant colors and centered labels.
Select up to 10 restaurants for the wheel.
Modal with spin result and Google Maps directions link.
Responsive design with a centered spin button and top-aligned pointer.

Technologies:

HTML, CSS, JavaScript
D3.js (v3) for the spinning wheel
Google Places API (Place.searchNearby)
