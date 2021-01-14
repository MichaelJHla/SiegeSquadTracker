//This function displays all the needed information which allows a user to log in
function logInPage() {
    $('#sign-in').show();
    $('#welcome').hide();
}

//This function displays all the needed information which allows a user to sign up
function signUpPage() {
    $('#new-user').show();
    $('#welcome').hide();
}

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem("userid", user.uid);
        database.ref("users/" + user.uid).once('value').then(function(snapshot) {
            //Redirect to the next page of the site once the new user has been added to the database
            window.location.replace("html/squad.html"); 
        });
    }
});

//This event listener is used to log in a user
var signInForm = document.querySelector('#sign-in-form');
signInForm.addEventListener('submit', (e) => {
    e.preventDefault();//Overrides the default behavior to not refresh the page

    var email = $('#login-email').val();//Records the provided email
    var password = $('#login-password').val();//records the provided password

    //Uses the email and password to sign up a new user
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        
    }).catch(function(e) {
        window.alert(e.message);
    });
});

//This event listener is used to sign up a new user
var newUserForm = document.querySelector('#new-user-form');
newUserForm.addEventListener('submit', (e) => {
    e.preventDefault();//Overrides the default behavior to not refresh the page

    var email = $('#signup-email').val();//Records the provided email
    var password = $('#signup-password').val();//Records the provided password
    //Uses a query selector to get the value of the radio buttons
    var platform = document.querySelector('input[name="platform"]:checked').value;
    var username = $('#platform-username').val();//Records the platform username

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
    }).catch(function(e) {
        window.alert(e.message);
    });
});