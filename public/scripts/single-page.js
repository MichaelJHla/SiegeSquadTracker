//This map associates each map with its list of 4 sites
const allSites = 
    {"bank": ["Executive Lounge and CEO", "Staff Room and Open Area", "Teller's Office and Archives", "Lockers and CCTV"],
    "border": ["Customs and Supply Room", "Workshop and Ventilation", "Tellers and Bathroom", "Armory Lockers and Archives"],
    "chalet": ["Master Bedroom and Office", "Bar and Gaming Room", "Dining Room and Kitchen", "Wine Cellar and Snowmobile Garage"],
    "clubhouse": ["Gym and Bedroom", "CCTV and Cashroom", "Bar and Stock Room", "Church and Arsenal Room"],
    "coastline": ["Theater and Penthouse", "Hookah Lounge and Billiards Room", "Blue Bar and Sunrise Bar", "Service Entrance and Kitchen"],
    "consulate": ["Consul Office and Meeting Room", "Lobby and Press Room", "Garage and Cafeteria", "Tellers and Archives"],
    "kafe": ["Cocktail Lounge and Bar", "Mining Room and Fireplace Hall", "Reading Room and Fireplace Hall", "Kitchen Service and Kitchen Cooking"],
    "kanal": ["Server Room and Radar Room", "Security Room and Map Room", "Coast Guard Meeting Room and Lounge", "Supply Room and Kayaks"],
    "oregon": ["Main Dorms Hall and Kids Dorm", "Dining Hall and Kitchen", "Meeting Hall and Kitchen", "Laundry Room and Supply Room"],
    "outback": ["Games Room and Laundry Room", "Party Room and Office", "Nature Room and Bushranger Office", "Gear Store and Compressor"],
    "park": ["Office and Initiation Room", "Bunk and Day Care", "Armory and Throne Room", "Lab and Storage"],
    "skyscraper": ["Tea Room and Karaoke", "Exhibition Room and Office", "Kitchen and BBQ", "Bedroom and Bathroom"],
    "villa": ["Aviator Room and Games Room", "Trophy Room and Statuary Room", "Living Room and Library", "Dining Room and Kitchen"]
};

const maps = ["bank", "border", "chalet", "clubhouse", "coastline",
                "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
                "park", "villa"];

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBPKECiN2v3FGsKWXxjJ_M8gFaSfHIFCs8",
    authDomain: "siegesquadstats.firebaseapp.com",
    databaseURL: "https://siegesquadstats.firebaseio.com",
    projectId: "siegesquadstats",
    storageBucket: "siegesquadstats.appspot.com",
    messagingSenderId: "425029470216",
    appId: "1:425029470216:web:646a68d606fbfa5bfa69bd",
    measurementId: "G-082FGX8WQF"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();

// Get a reference to the authentication service
var auth = firebase.auth();

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (user) {
        database.ref("users/" + user.uid).once('value').then(function(s) {
            //Records needed variables to local storage
            localStorage.setItem('userID', user.uid);
            localStorage.setItem('squadname', s.val().squad);
            localStorage.setItem('username', s.val().username);

            console.log("User signed in");
            //Reveal and hide the proper elements for the user's profile status
            $('#sign-in-elements').hide();
            $('#upper-elements').css('display', 'flex');
            $('#lower-elements').css('display', 'flex');
            console.log(localStorage.getItem('username'));
            $('#user-settings-label').html('<i class="fas fa-user"></i> ' + localStorage.getItem('username'));

            userSettings.click(); //Click the user settings page
        });
    } else {
        localStorage.clear(); //Empties the local storage when no user is signed in
        
        console.log("No user signed in");
        //Reveal and hide the proper elements for the user's profile status
        $('#sign-in-elements').css('display', 'flex');
        $('#upper-elements').hide();
        $('#lower-elements').hide();

        signIn.click(); //Click the sign in page
    }
});

//Directs the user to the create account form
const createAccountLink = $('#create-account-link');
createAccountLink.on('click', function() {
    $('#sign-in').hide();
    $('#create-account').show();
});

//Directs the user to the sign in form

const signInLink = $('#sign-in-link');
signInLink.on('click', function() {
    $('#create-account').hide();
    $('#sign-in').show();
});

//Once the user clicks on the user settings page
const userSettings = $('#user-settings');
userSettings.on('click', function() {
    hideAll();
    $('#user-settings-main').show();//Display the user settings section
    //Access the database to see if the user is part of a squad
    database.ref('users/' + auth.currentUser.uid).once('value').then(function(s) {
        if (s.val().squad) {//If the user is part of a squad, then show the squad info
            $('#join-squad').hide();
            $('#squad-info').show();
            $('#user-settings-squad-name').text(s.val().squad);
            displaySquadMembers(s.val().squad);
        } else {//If the user is not part of a squad then show the user the screen to join a squad
            $('#join-squad').show();
            $('#squad-info').hide();
        }
    });
});

//Once the user clicks on the site stats page
const siteStats = $('#site-stats');
siteStats.on('click', function() {
    hideAll();
    $('#site-stats-main').show();
});

//Once the user clicks on the operator bans page
const operatorBans = $('#operator-bans');
operatorBans.on('click', function() {
    hideAll();
    $('#operator-bans-main').show();
});

//Once the user clicks on the map bans page
const mapBans = $('#map-bans');
mapBans.on('click', function() {
    hideAll();
    $('#map-bans-main').show();
    loadMapBans();
});

//Once the user clicks the sign-in page
const signIn = $('#sign-in-radio');
signIn.on('click', function() {
    hideAll();
    $('#sign-in-main').show();
    $('#create-account').hide();
    $('#sign-in').show();
})

//This function hides all the elements that would appear in the main section of the page,
// allowing for a specific page to be pulled up after all are hidden
function hideAll() {
    $('#sign-in-main').hide();
    $('#user-settings-main').hide();
    $('#map-bans-main').hide();
    $('#operator-bans-main').hide();
    $('#site-stats-main').hide();
}

//This form is used to sign in a user who has an account
const signInForm = $('#sign-in-form');
signInForm.on('submit', (e) => {
    e.preventDefault();//Prevents the page from refreshing when a form is finished

    var email = $('#sign-in-email').val();//Records the provided email
    var password = $('#sign-in-password').val();//Records the provided password

    //Uses the email and password to log in a user
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {//Catches if there is an error in the sign-in process
        $('#sign-in-password').val('');//Clears the password field in case of an error
        window.alert(error.message);
    });
});

const newUserForm = $('#new-user-form');
newUserForm.on('submit', (e) => {
    e.preventDefault();//Prevents the page from refreshing when the form is finished

    var email = $('#create-account-email').val();//Records the provided email
    var password = $('#create-account-password').val();//Records the provided password
    //Uses a query selector to get the value of the radio buttons
    var platform = $('input[name="platform"]:checked', '#new-user-form').val();
    var username = $('#create-account-username').val();//Records the platform username

    //Sign up the new user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        //Sets all the provided data into the database
        database.ref("users/" + cred.user.uid + "/platform").set(platform);
        database.ref("users/" + cred.user.uid + "/username").set(username);

        //Initializes each map in alphabetical order on the map bans page
        for (var i = 0; i < maps.length; i++) {
            database.ref("users/" + cred.user.uid + "/map-bans/" + maps[i]).set(i);
        }

        //Records the username of the new user into the data of the squad they joined
    }).catch(function(error) {//Catches if there is an error in the sign-up process
        $('#sign-in-password').val('');//Clears the password field in case of an error
        window.alert(error.message);
    });
});

const joinSquadForm = $('#join-squad-form');
joinSquadForm.on('submit', (e) => {
    e.preventDefault();

    database.ref("squads").once('value').then(function(s) {
        var squad = $('#join-squad-name').val();//The squad name the user provided
        var squadPassword = $('#join-squad-password').val();//The squad password the user provided
        var squadList = Object.keys(s.val());//A list of all previous squads

        if (squadList.includes(squad)) {//If the squad alread exists in the database
            if (squadPassword == s.val()[squad].password) {//If the passwords match
                if (window.confirm("Would you like to join the squad " + squad + "?")) {
                    database.ref("users/" + auth.currentUser.uid + "/squad").set(squad);//Sets the user's squad
                    //Places the user into the squad list of the squad they just joined
                    database.ref("users/" + auth.currentUser.uid + "/username").once('value').then(function(s_username) {
                        database.ref("squads/" + squad + "/members/" + auth.currentUser.uid).set(s_username.val());
                    });

                    localStorage.setItem("squadname", squad);//Sets the squad name into the local storage
                    database.ref("users/" + auth.currentUser.uid + "/map-bans").once('value').then(function(s_maps) {
                        database.ref("squads/" + squad + "/map-bans/" + auth.currentUser.uid).set(s_maps.val());
                        //updateSquadBans(); ONCE THIS IS IMPLEMENTED, UNCOMMENT THIS LINE
                    });
                }
            } else {//If the password is incorrect
                window.alert("This squad already exists and the password is incorrect.");
            }
        } else {//If the squad does not exist in the database
            if (window.confirm("The squad " + squad + " does no exist. Would you like to create a new squad with this name?")) {
                createNewSquad(squad, squadPassword);//Calls the function to create a new squad
                localStorage.setItem("squadname", squad);//Sets the squadname into local storage
                database.ref("users/" + auth.currentUser.uid + "/squad").set(squad);

                userSettings.click();//Refresh the info on the userSettings page
            } else {
                window.alert("New squad not created.");
            }
        }

        userSettings.click();//Refresh the info on the userSettings page
    });
});

//This function handles the creation of a new squad by assigning the admin to the creator,
// and then creating all the blank data the squad needs to be added onto later
function createNewSquad(squad, password) {
    //Sets the squad password to the proper value
    database.ref("squads/" + squad + "/password").set(password);

    //sets the admin to the creator of the squad
    database.ref("squads/" + squad + "/admin").set(auth.currentUser.uid);

    //Add the first member to the squad
    database.ref("users/" + auth.currentUser.uid + "/username").once('value').then(function(s) {
        database.ref("squads/" + squad + "/members/" + auth.currentUser.uid).set(s.val());
    });

    //This creates all the site data and sets it to 0, and sets all maps to have no ban listed for their operator bans
    Object.keys(allSites).forEach(function(map) {
        database.ref("squads/" + squad + "/operator-bans/" + map + "/attacker").set("none");
        database.ref("squads/" + squad + "/operator-bans/" + map + "/defender").set("none");
        
        //The creation and zeroing of all site data
        for (var i = 0; i < 4; i++) {
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/name").set(allSites[map][i]);

            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/aloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/awin").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/dloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/dwin").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/paloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/pawin").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/pdloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + map + "/site" + i + "/pdwin").set(0);
        }
    });
    
    //Move the user's map bans into the squad's map bans sections
    database.ref("users/" + auth.currentUser.uid + "/map-bans").once('value').then(function(s) {
        database.ref("squads/" + squad + "/map-bans/" + auth.currentUser.uid).set(s.val());
        //updateSquadBans(); ONCE THIS IS IMPLEMENTED, UNCOMMENT THIS LINE
    });

    userSettings.click();//Refresh the info on the userSettings page
}

//This functions displays a list showing the squad members
function displaySquadMembers(squad) {
    $('#members-list').empty();//Clears the list in case there was a previous viewing of the squad list
    $('#members-list').append('<h3>Members</h3>');
    database.ref("squads/" + squad).once('value').then(function(s) {
        var admin = s.val().admin;
        Object.keys(s.val().members).forEach(function(key) {
            if (auth.currentUser.uid == admin) {//If the user is the admin add extra to the squad list
                //This div will represent an entire member of the squad
                var memberDiv = $('<div></div>');
                memberDiv.addClass("member");
                memberDiv.append("<h4>" + s.val().members[key] + "</h4>");//Adds an h4 element with the member name

                //This makes a new div which will store the admin button options 
                var buttonsDiv = $('<div></div>');
                buttonsDiv.addClass("member-buttons");

                //The admin button is used to promote a user to the admin of the squad
                var adminButton = $('<button></button>');
                adminButton.html("<i class='fas fa-user-cog'></i>");
                adminButton.addClass("icon-button");
                adminButton.click(function() {//This click function asks the user if they would like to promote this user to the admin 
                    if (window.confirm("Would you like to make " + s.val().members[key] + " the new admin?\nDoing so will remove your own admin capabilities.")) {
                        database.ref("squads/" + squad + "/admin").set(key);
                        userSettings.click();//Refresh the info on the userSettings page
                    }
                });
                buttonsDiv.append(adminButton);//Appends the button to the div which stores the admin buttons

                //The remove button is used to remove a user from the squad
                var removeButton = $('<button></button>');
                removeButton.html("<i class='fas fa-user-minus'></i>");
                removeButton.addClass("icon-button");
                removeButton.click(function() {//This click functions confirms the removal of a user from the squad
                    if (window.confirm("Would you like to remove " + s.val().members[key] + " from the squad?")) {
                        removeFromSquad(key, squad);
                        userSettings.click();//Refresh the info on the userSettings page
                    }
                });
                buttonsDiv.append(removeButton);

                //Appends the buttons to the member div then appends the member div to the members list
                memberDiv.append(buttonsDiv);
                $('#members-list').append(memberDiv);
            } else {//if the user is not the admin, just display the squad list with no extra controls
                $('#members-list').append("<div class='member'><h4>" + s.val().members[key] + "</h4>" + 
                                            "<div class='member-buttons'></div></div>");
            }
        });
    });
}

//This function handles removing a player from a squad. It will properly remove their data from a squad
// and remove that squad association from their profile
function removeFromSquad(player, squad) {
    database.ref("users/" + player + "/squad").remove();
    database.ref("squads/" + squad + "/members/" + player).remove();
    database.ref("squads/" + squad + "/map-bans/" + player).remove();
    database.ref("squads/" + squad).once('value').then(function(snapshot) {
        if (player == snapshot.val().admin) {
            database.ref("squads/" + squad + "/admin").set(Object.keys(snapshot.val()["members"])[0]);
        }
    });
    //updateSquadBans(); ONCE THIS IS IMPLEMENTED, UNCOMMENT THIS LINE
}

//This function allows the user to remove themselves from a squad by calling the remove from squad function
const leaveSquadButton = $('#leave-squad-button');
leaveSquadButton.on('click', function() {
    if (window.confirm("Would you like to leave " + localStorage.getItem("squadname") + "?")) {
        removeFromSquad(auth.currentUser.uid, localStorage.getItem("squadname"));
        localStorage.removeItem("squadname");
        userSettings.click();
    }
});

//This functions shows and hides the squad password when the view password button is clicked
const squadPasswordButton = $('#squad-password-button');
squadPasswordButton.on('click', function() {
    if ($(this).text() == "Show") {
        $(this).html("Hide");
        database.ref("squads/" + localStorage.getItem("squadname") + "/password").once('value').then(function(s) {
            $('#squad-password').text(s.val());
        });
    } else {
        $('#squad-password').text("**********");
        $(this).html("Show");
    }
});

/*This section will contain a large amount of code for the map bans section*/
//Fisher-Yates shuffle algorithm
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

//Initialize and display all the proper info for the map bans page
function loadMapBans() {
    mapBanUserList();
}

function mapBanUserList() {
    $('#map-ban-radios-div').empty();

    //The radio button which shows the squad's bans
    var squadRadio = $('<input type="radio" checked>');
    squadRadio.attr('name', 'map-ban-radio');
    squadRadio.addClass('map-ban-radio');//Used for styling and adding an event listener
    squadRadio.attr('id', 'map-ban-radio-squad-name');//So the 'for' in the next label can be paired with this radio button
    squadRadio.val(localStorage.getItem("squadname"));//The way the squad is listed in the database

    //The label associated with the radio button for the squad's bans
    var squadRadioLabel = $('<label></label>');
    squadRadioLabel.attr('for', 'map-ban-radio-squad-name');//Associates this label with the above radio button
    squadRadioLabel.attr('id', 'map-ban-label-squad-name');//Sets this label to be a unique id for styling purposes
    squadRadioLabel.text(localStorage.getItem("squadname"));//Sets the label to display the squad name

    //Append the radio button and the label to the overall div
    $('#map-ban-radios-div').append(squadRadio);
    $('#map-ban-radios-div').append(squadRadioLabel);

    //This div will hold the names of the members of the squad
    var membersListMapBan = $('<div></div>');
    membersListMapBan.addClass("members-list-map-ban");

    //Gets the list of all the squad members and will display them as radio button labels which can be selected
    database.ref("squads/" + localStorage.getItem("squadname") + "/members").once('value').then(function(s) {
        for (var key in s.val()) {//Iterate through all the members of a squad
            var memberRadio = $('<input type="radio">');
            memberRadio.attr('name', 'map-ban-radio');//Puts all new radio buttons in the map-ban-radio grouping of radios
            memberRadio.addClass('map-ban-radio');//Used for styling and adding an event listener
            memberRadio.attr('id', key);//Sets the id to be the key of the user as to be unique
            memberRadio.val(key);//Sets the value to be the key of the user as to be unique
            

            var memberRadioLabel = $('<label></label>');
            memberRadioLabel.text(s.val()[key]);//Sets the text to be the username of the user
            memberRadioLabel.attr('for', key);//Associates the 'for'attribute with the id of the radio button
            memberRadioLabel.addClass('member-radio-label');//Adds the member-radio-label class to the label for styling
            
            //Append the radio button and the label to the div
            membersListMapBan.append(memberRadio);
            membersListMapBan.append(memberRadioLabel);
        }

        $('#map-ban-radios-div').append(membersListMapBan);

        var elements = document.getElementsByClassName('map-ban-radio');
        Array.from(elements).forEach(function(e){
            e.addEventListener('click', function() {
                console.log(this.value);
                //This is where the data for the given member of the squad will be pulled up
            });
        });
    });
}