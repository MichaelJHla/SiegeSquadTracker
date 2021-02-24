//Once the user clicks on the user settings page
const userSettings = $('#user-settings');
userSettings.on('click', function() {
    hideAll();
    $('#loading').hide();
    $('#user-settings-main').show();//Display the user settings section
    $('#change-squad-password-form').hide();
    $('#squad-password-div').show();
    $('#squad-password-button').show();
    $('#change-squad-password-button').show();
    //Access the database to see if the user is part of a squad
    database.ref('users/' + auth.currentUser.uid).once('value').then(function(s) {
        $('#user-info-username').text("Signed in as " + s.val().username);
        $('#user-info-email').text(auth.currentUser.email);

        if (s.val().squad) {//If the user is part of a squad, then show the squad info
            $('#join-squad').hide();
            $('#squad-info').show();
            $('#user-settings-squad-name').text(s.val().squad);
            $('#upper-elements').css('display', 'flex');
            displaySquadMembers(s.val().squad);
        } else {//If the user is not part of a squad then show the user the screen to join a squad
            $('#join-squad').show();
            $('#squad-info').hide();
            $('#upper-elements').hide();
        }
    });
});

const joinSquadForm = $('#join-squad-form');
joinSquadForm.on('submit', (e) => {
    e.preventDefault();

    var squad = $('#join-squad-name').val();//The squad name the user provided
    var squadPassword = $('#join-squad-password').val();//The squad password the user provided

    const joinSquad = firebase.functions().httpsCallable('joinSquad');
    joinSquad({
        'squad': squad,
        'password': squadPassword
    }).then(function(result) {
        const exitCode = result.data;

        if (exitCode == 0) {//The squad has been joined
            sessionStorage.setItem("squadname", squad);
            userSettings.click();
        } else if (exitCode == 1) {//The squad does not exist
            if(window.confirm("The squad " + squad + " does not exist. Would you like to create a new squad with this name?")) {
                createNewSquad(squad, squadPassword);
            } else {
                userSettings.click();
            }
        } else if (exitCode == 2) {//The password is incorrect
            window.alert("This squad already exists and the password is incorrect");
            userSettings.click();
        } else if (exitCode == 3) {//The squad is at max capacity
            window.alert("This squad is full. The current max squad size is 5.");
            userSettings.click();
        }
    });
    
    $('#join-squad').hide();
    $('#loading').show();
});

//This function handles the creation of a new squad by assigning the admin to the creator,
// and then creating all the blank data the squad needs to be added onto later
function createNewSquad(squad, password) {
    const newSquad = firebase.functions().httpsCallable('createNewSquad');
    newSquad({
        'squad': squad,
        'password': password,
        'sites': allSites
    }).then(function() {
        sessionStorage.setItem("squadname", squad);
        userSettings.click();//Refresh the info on the userSettings page
    });
}

//This functions displays a list showing the squad members
function displaySquadMembers(squad) {
    $('#members-list').empty();//Clears the list in case there was a previous viewing of the squad list
    $('#members-list').append('<h3>Members</h3>');
    database.ref("squads/" + squad).once('value').then(function(s) {
        var admin = s.val().admin;
        Object.keys(s.val().members).forEach(function(key) {
            if (auth.currentUser.uid == admin) {//If the user is the admin add extra to the squad list
                $('#change-squad-password-button').show();

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
                $('#change-squad-password-button').hide();
            }
        });
    });
}

//This function handles removing a player from a squad. It will properly remove their data from a squad
// and remove that squad association from their profile
function removeFromSquad(player, squad) {
    const remove = firebase.functions().httpsCallable('removeFromSquad');
    remove({
        'squad': squad,
        'player': player
    }).then(function() {
        userSettings.click();
    }); 
}

//This function allows the user to remove themselves from a squad by calling the remove from squad function
const leaveSquadButton = $('#leave-squad-button');
leaveSquadButton.on('click', function() {
    if (window.confirm("Would you like to leave " + sessionStorage.getItem("squadname") + "?")) {
        removeFromSquad(auth.currentUser.uid, sessionStorage.getItem("squadname"));
        sessionStorage.removeItem("squadname");
        $('#loading').show();
        $('#squad-info').hide();
    }
});

//This functions shows and hides the squad password when the view password button is clicked
const squadPasswordButton = $('#squad-password-button');
squadPasswordButton.on('click', function() {
    if ($(this).text() == "Show") {
        $(this).html("Hide");
        database.ref("squads/" + sessionStorage.getItem("squadname") + "/password").once('value').then(function(s) {
            $('#squad-password').text(s.val());
        });
    } else {
        $('#squad-password').text("**********");
        $(this).html("Show");
    }
});

//Allows the user to sign out of their profile
const signOutButton = $('#sign-out-button');
signOutButton.on('click', function() {
    auth.signOut();
});

const changeSquadPasswordButton = $('#change-squad-password-button');
changeSquadPasswordButton.on('click', function() {
    $('#change-squad-password-form').show();
    $('#squad-password-div').hide();
    $('#squad-password-button').hide();
    $('#change-squad-password-button').hide();
});

const changeSquadPasswordForm = $('#change-squad-password-form');
changeSquadPasswordForm.on('submit', (e) => {
    e.preventDefault();

    if (window.confirm("Change squad password?")) {
        database.ref("squads/" + sessionStorage.getItem("squadname") + "/password").set($('#new-squad-password').val());
    }

    $('#new-squad-password').val('');
    $('#change-squad-password-form').hide();
    $('#squad-password-div').show();
    $('#squad-password-button').show();
    $('#change-squad-password-button').show();
});

const changePasswordButton = $('#change-password-button');
changePasswordButton.on('click', function() {
    changePassword(auth.currentUser.email);
});