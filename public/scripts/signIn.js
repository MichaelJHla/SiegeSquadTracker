//Once the user clicks the sign-in page
const signIn = $('#sign-in-radio');
signIn.on('click', function() {
    hideAll();
    $('#create-account').hide();
    $('#sign-in').show();
    $('#sign-in-main').show();
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