// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
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
const createAccountLink = document.querySelector('#create-account-link');
createAccountLink.addEventListener('click', function() {
    $('#sign-in').hide();
    $('#create-account').show();
});

//Directs the user to the sign in form

const signInLink = document.querySelector('#sign-in-link');
signInLink.addEventListener('click', function() {
    $('#create-account').hide();
    $('#sign-in').show();
});

//Once the user clicks on the user settings page
const userSettings = document.querySelector('#user-settings');
userSettings.addEventListener('click', function() {
    hideAll();
    $('#user-settings-main').show();//Display the user settings section
    //Access the database to see if the user is part of a squad
    database.ref('users/' + auth.currentUser.uid).once('value').then(function(s) {
        if (s.val().squad) {//If the user is part of a squad, then show the squad info
            $('#join-squad').hide();
            $('#squad-info').show();
        } else {//If the user is not part of a squad then show the user the screen to join a squad
            $('#join-squad').show();
            $('#squad-info').hide();
        }
    });
});

//Once the user clicks on the site stats page
const siteStats = document.querySelector('#site-stats');
siteStats.addEventListener('click', function() {
    hideAll();
    $('#site-stats-main').show();
});

//Once the user clicks on the operator bans page
const operatorBans = document.querySelector('#operator-bans');
operatorBans.addEventListener('click', function() {
    hideAll();
    $('#operator-bans-main').show();
});

//Once the user clicks on the map bans page
const mapBans = document.querySelector('#map-bans');
mapBans.addEventListener('click', function() {
    hideAll();
    $('#map-bans-main').show();
});

//Once the user clicks the sign-in page
const signIn = document.querySelector('#sign-in-radio');
signIn.addEventListener('click', function() {
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
var signInForm = document.querySelector('#sign-in-form');
signInForm.addEventListener('submit', (e) => {
    e.preventDefault();//Prevents the page from refreshing when a form is finished

    var email = $('#sign-in-email').val();//Records the provided email
    var password = $('#sign-in-password').val();//Records the provided password

    //Uses the email and password to log in a user
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {//Catches if there is an error in the sign-in process
        $('#sign-in-password').val('');//Clears the password field in case of an error
        window.alert(error.message);
    });
});

var newUserForm = document.querySelector('#new-user-form');
newUserForm.addEventListener('submit', (e) => {
    e.preventDefault();//Prevents the page from refreshing when the form is finished

    var email = $('#create-account-email').val();//Records the provided email
    var password = $('#create-account-password').val();//Records the provided password
    //Uses a query selector to get the value of the radio buttons
    var platform = document.querySelector('input[name="platform"]:checked').value;
    var username = $('#create-account-username').val();//Records the platform username

    //Sign up the new user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        //Sets all the provided data into the database
        database.ref("users/" + cred.user.uid + "/platform").set(platform);
        database.ref("users/" + cred.user.uid + "/username").set(username);

        maps = ["bank", "border", "chalet", "clubhouse", "coastline",
                "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
                "park", "villa"];
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

var joinSquadForm = document.querySelector('#join-squad-form');
joinSquadForm.addEventListener('submit', (e) => {
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
            } else {
                window.alert("New squad not created.");
            }
        }
        userSettings.click();//Refresh the info on the userSettings page
    });
});