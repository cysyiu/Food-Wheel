# Food Wheel

A web application that helps users discover nearby restaurants and randomly select one using an interactive spinning wheel. Built with HTML, CSS, and JavaScript, it uses the Google Places API to search for restaurants based on user-entered cuisine keywords (e.g., "Japanese restaurant") and a customizable radius (500–5000 meters). The app displays up to 20 restaurants, allows users to select up to 10 for the wheel, and features a D3.js-powered wheel that spins clockwise (minimum 3 rotations) to choose a restaurant, with results shown in a modal including Google Maps directions. A draft wheel with 10 placeholder options is shown on load or if no results are found.

## Features

- **Search Nearby Restaurants**: Find restaurants by cuisine keyword and adjustable radius.
- **Interactive Spinning Wheel**: D3.js-powered wheel with vibrant colors and centered labels.
- **Customizable Selection**: Choose up to 10 restaurants for the wheel.
- **Spin Result Modal**: Displays selected restaurant with a Google Maps directions link.
- **Responsive Design**: Centered spin button and top-aligned pointer for intuitive use.

## Technologies

- HTML, CSS, JavaScript
- D3.js (v3) for the spinning wheel
- Google Places API (`Place.searchNearby`)

## Limitations

- Limited to 20 results due to Google Places API constraints.

## Usage

- Enter a cuisine keyword (e.g., "Japanese restaurant") and adjust the radius (500–5000m).
- Click "Search" to fetch and display restaurants.
- Select up to 10 restaurants from the list to include on the wheel.
- Click "Spin" to rotate the wheel (minimum 3 clockwise spins) and view the randomly selected restaurant in a modal with a directions link.

## License

MIT License
