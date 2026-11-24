# TrainTrack – Project 3

A Finnish railway timetable application built with HTML, CSS, jQuery, Bootstrap 5 and the Fintraffic Digitraffic API.

## Published application
Add your Netlify URL here: `ADD_NETLIFY_URL`

## GitHub repository
Add your repository URL here: `ADD_GITHUB_URL`

## Presentation video
Add your video URL here after recording: `ADD_VIDEO_URL`

## Description
TrainTrack lets users select a Finnish passenger railway station and view available live departures and arrivals. Users can search for stations, choose a timetable time range and refresh the timetable.

## Libraries and API
- **jQuery 3.7.1:** used for event listeners, AJAX requests and DOM manipulation.
- **Bootstrap 5.3.3:** used for responsive layout, forms, buttons, cards and alerts.
- **Fintraffic Digitraffic Railway API:** provides station metadata and train timetable data.
- API documentation: https://www.digitraffic.fi/en/railway/

## Main features
- Loads passenger railway stations from the API.
- Filters station options as the user types.
- Loads timetable information for the selected station.
- Displays departures and arrivals.
- Allows the user to select a timetable time range and refresh results.
- Displays loading, success and error messages.

## Running locally
1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Start `index.html` with the Live Server extension, or use another local web server.
4. Make sure you have an internet connection because the application loads jQuery, Bootstrap and API data online.

## Code structure
- `index.html` – page structure and library imports.
- `css/style.css` – custom styling.
- `js/script.js` – jQuery AJAX, event handling and rendering.

## Self-assessment
The application uses jQuery for AJAX requests, event listeners and DOM manipulation. Bootstrap is used to create a responsive user interface. The application retrieves live data from the Digitraffic API and displays station-specific train information. I have tested the main search, selection and refresh interactions. API data availability may vary.

## Use of AI
AI assistance was used to help plan the application structure, explain jQuery and Bootstrap usage, and review/debug parts of the implementation. I reviewed and tested the code and will explain its functionality in the project presentation.

## Sources
- Fintraffic Digitraffic Railway API: https://www.digitraffic.fi/en/railway/
- jQuery documentation: https://api.jquery.com/
- Bootstrap documentation: https://getbootstrap.com/docs/5.3/
