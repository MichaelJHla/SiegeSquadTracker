//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem("userid", user.uid);
        database.ref("users/" + user.uid).once('value').then(function(snapshot) {
            //Save the user information to local storage for quick access on other web pages
            localStorage.setItem("squadname", snapshot.val().squad);

            window.location.replace("html/map-bans.html"); //Redirect to the map bans page of the site
        });
    }
});

//This function is used to create a new user
function newUser() {
    var email = $('#signup-email').val();
    var password = $('#signup-password').val();
    var platform = document.querySelector('input[name="platform"]:checked').value;
    var username = $('#platform-username').val();
    var squad = $('#squad-name').val();

    //Sign up the new user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        database.ref("users/" + cred.user.uid + "/platform").set(platform);
        database.ref("users/" + cred.user.uid + "/squad").set(squad);
        database.ref("users/" + cred.user.uid + "/username").set(username);

        var i;
        maps = ["bank", "border", "chalet", "clubhouse", "coastline",
                "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
                "park", "villa"];
        //Initializes each map in alphabetical order on the map bans page
        for (i = 0; i < maps.length; i++) {
            database.ref("users/" + cred.user.uid + "/map-bans/" + maps[i]).set(i);
        }

        database.ref("squads/" + squad + "/members/" + cred.user.uid).set(username);
    });
}

//This function is used to sign in a previously made user
function logIn() {
    var email = $('#login-email').val();
    var password = $('#login-password').val();

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        
    });
}