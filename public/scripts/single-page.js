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
        console.log("User signed in");
        $('#sign-in-elements').hide();
        $('#upper-elements').css('display', 'flex');
        $('#lower-elements').css('display', 'flex');

        userSettings.click();
    } else {
        console.log("No user signed in");
        $('#sign-in-elements').css('display', 'flex');
        $('#upper-elements').hide();
        $('#lower-elements').hide();

        signIn.click();
    }
});

//Once the user clicks on the user settings page
const userSettings = document.querySelector('#user-settings');
userSettings.addEventListener('click', function() {
    hideAll();
    $('#user-settings-main').show();
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

