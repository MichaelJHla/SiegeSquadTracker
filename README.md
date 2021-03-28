# Siege Squad Stats
### Introduction
This web application is designed as a companion app for the popular video game Rainbow 6 Siege. Players can use this web application to assist their squad with storing and tracking squad information. The squad info that can currently be tracked is **Map Bans, Operator Bans, and Site Stats**.

#### Technologies Used
This web app was created using jQuery and JavaScript on the front-end with Firebase and Google Cloud for the back-end.

### Map Bans
The map bans section of the web application allows the user to develop their list of maps they prefer to play on. The list is created by voting on each map to place it in the list of already sorted maps (Note: A more efficient algorithm for sorting the maps is currently being developed since as of now, voting on maps takes a while). Once a user's ordered list is created, a master list for the squad is updated which organizes all members' bans lists into a single list. This makes the process of deciding which map to ban a lot easier since maps are ranked in order of overall popularity.

### Operator Bans
The operator ban list tracks the operator bans for each map. The two banned operator icons are displayed side by side. Any user in the squad can update the operator bans by entering the edit mode on the page. To edit the operators, the user selects the operator from a dropdown list for attackers and another list for defenders. Once selected, the user can save the bans. A notes section is provided to make note of anything related to the bans.

### Site Stats
The site stats section of the page lets members of the squad track and submit data for each site on each map. When a map is selected, a list of available sites is displayed. When the user selects one of the sites, the tracked data for that site is displayed. At the bottom of the page, the user can fill a form with the data from a round and submit that new data to the database. There is also an option to remove a stat from the site in case a submission was made by accident.
