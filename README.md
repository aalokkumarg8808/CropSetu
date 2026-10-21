# CropSetu

CropSetu is a web-based agriculture marketplace concept focused on helping farmers compare mandi prices, list their crops, and find buyers and agricultural shops.

The project is currently a front-end prototype built with HTML, CSS, and JavaScript. It is being developed step by step, with more work needed before it can be used as a live marketplace.

## Features

- Mandi price comparison for selected crops
- Estimated transport cost and net-return comparison
- Crop listings with quantity and expected price
- Farmer profile and local browser-based sign-in flow
- Farming land boundary drawing and saved land records
- Nearby buyer and agricultural shop views on a map
- Seeds and farming supplies catalog with cart
- Basic order status flow and order history
- Crop price tracking interface
- Agricultural weight unit converter
- English and Hindi language options

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js for the simple local static server
- Leaflet and OpenStreetMap for maps

## Run Locally

Make sure Node.js is installed.

1. Clone the repository:

   ```bash
   git clone https://github.com/aalokkumarg8808/CropSetu.git
   cd CropSetu
   ```

2. Start the local server:

   ```bash
   node server.js
   ```

3. Open [http://localhost:3456](http://localhost:3456) in your browser.

You can also open `index.html` directly, but some features—such as browser location access—work best when served over localhost or HTTPS.

## Current Limitations

- Mandi prices and product listings use sample data; prices are not fetched from a live mandi-price service.
- Refreshing market prices currently changes the sample values and should not be treated as a real market update.
- Buyer and shop details are sample entries.
- Profiles, crop listings, cart data, land records, and orders are stored in the browser's local storage. They are not shared between users or devices.
- Sign-in and password reset are front-end demonstrations, not production-ready authentication.
- Order tracking is a local status flow and is not connected to delivery services.
- The project has not yet been validated as a production deployment.

Do not use the current prototype to make financial decisions based on displayed market prices.

## Development Status

CropSetu is under active development. The current focus is on building out the core user experience; backend services, secure authentication, shared marketplace data, and verified market information still need to be added.

## License

No license has been added yet. Unless a license is added to the repository, the source code is not explicitly released under an open-source license.
