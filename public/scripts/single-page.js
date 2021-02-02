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
        //Reveal and hide the proper elements for the user's profile status
        $('#sign-in-elements').hide();
        $('#upper-elements').css('display', 'flex');
        $('#lower-elements').css('display', 'flex');

        userSettings.click(); //Click the user settings page
    } else {
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
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        database.ref("users/" + cred.user.uid).once('value').then(function(s) {
            //Records needed variables to local storage
            localStorage.setItem('userID', cred.user.uid);
            localStorage.setItem('squadname', s.val().squad);
            localStorage.setItem('username', s.val().username);
        });
    }).catch(function(e) {//Catches if there is an error in the sign-in process
        $('#sign-in-password').val('');//Clears the password field in case of an error
        window.alert(e.message);
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

        var i;
        maps = ["bank", "border", "chalet", "clubhouse", "coastline",
                "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
                "park", "villa"];
        //Initializes each map in alphabetical order on the map bans page
        for (i = 0; i < maps.length; i++) {
            database.ref("users/" + cred.user.uid + "/map-bans/" + maps[i]).set(i);
        }

        //Records the username of the new user into the data of the squad they joined
    }).catch(function(e) {//Catches if there is an error in the sign-up process
        $('#sign-in-password').val('');//Clears the password field in case of an error
        window.alert(e.message);
    });
});