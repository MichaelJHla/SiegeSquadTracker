//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (user) {
        database.ref("users/" + user.uid).once('value').then(function(s) {
            //Records needed variables to local storage
            localStorage.setItem('userID', user.uid);
            localStorage.setItem('squadname', s.val().squad);
            localStorage.setItem('username', s.val().username);

            //Reveal and hide the proper elements for the user's profile status
            $('#sign-in-elements').hide();
            $('#lower-elements').css('display', 'flex');
            $('#user-settings-label').html('<i class="fas fa-user"></i> ' + localStorage.getItem('username'));

            userSettings.click(); //Click the user settings page
        });
    } else {
        localStorage.clear(); //Empties the local storage when no user is signed in
        
        //Reveal and hide the proper elements for the user's profile status
        $('#sign-in-elements').css('display', 'flex');
        $('#upper-elements').hide();
        $('#lower-elements').hide();

        signIn.click(); //Click the sign in page
    }
});

//This function hides all the elements that would appear in the main section of the page,
// allowing for a specific page to be pulled up after all are hidden
function hideAll() {
    $('#sign-in-main').hide();
    $('#user-settings-main').hide();
    $('#map-bans-main').hide();
    $('#operator-bans-main').hide();
    $('#site-stats-main').hide();
}