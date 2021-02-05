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
            $('#upper-elements').css('display', 'flex');
            displaySquadMembers(s.val().squad);
        } else {//If the user is not part of a squad then show the user the screen to join a squad
            $('#join-squad').show();
            $('#squad-info').hide();
            $('#upper-elements').hide();
        }
    });
});

//Once the user clicks on the site stats page
const siteStats = $('#site-stats');
siteStats.on('click', function() {
    hideAll();
    $('#site-data-div').hide();
    $('#site-selection-div').hide();
    $('#site-stat-form').hide();
    $('#site-stats-main').show();
});

//Once the user clicks on the operator bans page
const operatorBans = $('#operator-bans');
operatorBans.on('click', function() {
    hideAll();
    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').hide();
    $('#edit-operators-button').hide();
    $('#operator-bans-main').show();
});

//Once the user clicks on the map bans page
const mapBans = $('#map-bans');
mapBans.on('click', function() {
    hideAll();
    loadMapBans();
    $('#map-bans-main').show();
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
                        updateSquadBans(localStorage.getItem("squadname"));
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
        updateSquadBans(localStorage.getItem("squadname"));
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
    updateSquadBans(localStorage.getItem("squadname"));
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
    $('#edit-user-bans-button').html("Edit bans for " + localStorage.getItem("username"));
}

function mapBanUserList() {
    $('#map-ban-radios-div').empty();

    //The radio button which shows the squad's bans
    var squadRadio = $('<input type="radio">');
    squadRadio.prop('name', 'map-ban-radio');
    squadRadio.addClass('map-ban-radio');//Used for styling and adding an event listener
    squadRadio.prop('id', 'map-ban-radio-squad-name');//So the 'for' in the next label can be paired with this radio button
    squadRadio.val('squad-bans');//The way the squad is listed in the database

    //The label associated with the radio button for the squad's bans
    var squadRadioLabel = $('<label></label>');
    squadRadioLabel.prop('for', 'map-ban-radio-squad-name');//Associates this label with the above radio button
    squadRadioLabel.prop('id', 'map-ban-label-squad-name');//Sets this label to be a unique id for styling purposes
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
            memberRadio.prop('name', 'map-ban-radio');//Puts all new radio buttons in the map-ban-radio grouping of radios
            memberRadio.addClass('map-ban-radio');//Used for styling and adding an event listener
            memberRadio.prop('id', key);//Sets the id to be the key of the user as to be unique
            memberRadio.val(key);//Sets the value to be the key of the user as to be unique
            

            var memberRadioLabel = $('<label></label>');
            memberRadioLabel.text(s.val()[key]);//Sets the text to be the username of the user
            memberRadioLabel.prop('for', key);//Associates the 'for'propibute with the id of the radio button
            memberRadioLabel.addClass('member-radio-label');//Adds the member-radio-label class to the label for styling
            
            //Append the radio button and the label to the div
            membersListMapBan.append(memberRadio);
            membersListMapBan.append(memberRadioLabel);
        }

        $('#map-ban-radios-div').append(membersListMapBan);

        var elements = document.getElementsByClassName('map-ban-radio');
        Array.from(elements).forEach(function(e){
            e.addEventListener('click', function() {
                updateSquadBans(localStorage.getItem("squadname"));
                $('#ban-list').hide();//Gives better feedback to the user that the ban list is loading
                //Gets the map ban list for the given data in the map-bans section of the squad
                database.ref('squads/' + localStorage.getItem("squadname") + "/map-bans/" + this.value).once('value').then(function(s) {
                    $('#ban-list').empty();

                    var mapEntries = Object.entries(s.val());//Breaks down map bans into easy to iterate array
                    var sortedMaps = [];//Will store the sorted maps
                    for (var i = 0; i < mapEntries.length; i++) {//Iterate through the database to store maps in sorted array
                        sortedMaps[mapEntries[i][1]] = mapEntries[i][0];
                    }

                    //Iterates through the sorted array to display the maps
                    for (var i = sortedMaps.length - 1; i >= 0; i--) {
                        //Creates an img and changes the source to the png which holds the current map
                        var img = $('<img>');
                        img.prop('src', 'images/maps/' + sortedMaps[i] + ".PNG");
                        $('#ban-list').append(img);//Appends the image to the list of images
                    }

                    $('#ban-list').show();
                    $('#edit-user-bans-button').show();
                    $('#voting').hide();
                });
                if (e.id == 'map-ban-radio-squad-name') {
                    $('#map-ban-status').text("Your squad's ban list");
                } else {
                    database.ref("users/" + e.id + "/username").once('value').then(function(u) {
                        $('#map-ban-status').text(u.val() + "'s ban list");
                    });
                }
            });
        });

        squadRadio.click();//Sets the default radio button to be the squad radio
    });
}

var votedMaps = [];
var shuffledMaps = [];
var m1;
var m2;

//This button will initialize and prepare the user's ban editing screen
const editUserBans = $('#edit-user-bans-button');
editUserBans.on('click', function() {
    $('#ban-list').hide();
    $('#edit-user-bans-button').hide();
    $('#voting').show();

    votedMaps = [];//This will store the maps sorted in the way that the user wants them sorted
    shuffledMaps = shuffle(maps.slice(0));//By using the slice function, the original array will not be altered

    m1 = shuffledMaps.pop();
    m2 = shuffledMaps.pop();

    //Updates the images of the voting buttons
    $('#map1').css({"background-image": "url('images/maps/" + m1 + ".PNG')"});
    $('#map2').css({"background-image": "url('images/maps/" + m2 + ".PNG')"});

    $('#map-ban-status').text("Select which map you would rather play");

    //This unchecks all radio buttons
    var elements = document.getElementsByClassName('map-ban-radio');
    Array.from(elements).forEach(function(e) {
        e.checked = false;
    });
});

const voteMap1 = $('#map1');
voteMap1.on('click', function() {
    vote(1);
});

const voteMap2 = $('#map2');
voteMap2.on('click', function() {
    vote(2);
});

//This function is used to handle each vote as they are cast for a user's map ban list
function vote(a) {
    if (votedMaps.length == 0) { //Handles the first vote
        if (a == 1) {//If the player prefers the first map listed
            votedMaps.push(m1);//Pushed the first map on then the second map
            votedMaps.push(m2);
        } else {
            votedMaps.push(m2);//Pushes the second map on then the first map
            votedMaps.push(m1);
        }
        m1 = shuffledMaps.pop();//Pops the next map to be evaluated off the list of maps
        m2 = votedMaps[0];//Gets the top map on the players list of maps
    } else {
        if (a == 1) {//If the most recently evaluated map is preferred
            votedMaps.splice(votedMaps.indexOf(m2), 0, m1);//Splice the map into the list of sorted maps
            m1 = shuffledMaps.pop();//Get the next map to be evaluated from the remaining maps
            m2 = votedMaps[0];//Gets the top map of the players list of maps
        } else {//A previously sorted map is selected as the preferred map
            m2 = votedMaps[votedMaps.indexOf(m2) + 1];//Make the next map to be evaluated, the next map in the sorted list
            if (m2 == undefined) {//If there is no next map 
                votedMaps.push(m1);//Put the map being evaluated to the end of the array of sorted maps
                m1 = shuffledMaps.pop();//Get the next map to be evaluated from the remaining maps
                m2 = votedMaps[0];//Gets the top map of the players list of maps
            }
        }
    }

    if (m1 == undefined) {//If there is no more maps left in the list that need to be evaluated
        $('#voting').hide();//Doesn't allow the user to click to many options when voting on maps
        var i;
        for (i = 0; i < votedMaps.length; i++) {//Set the maps in the database under the proper username
            database.ref("users/" + localStorage.getItem("userid") + "/map-bans/" + votedMaps[i]).set(i);
            database.ref("squads/" + localStorage.getItem("squadname") + "/map-bans/" + localStorage.getItem("userid") + "/" + votedMaps[i]).set(i);
        }
        $('#' + localStorage.getItem("userid")).click();//Shows the user their new ban list
    } else {
        //Updates the images of the voting buttons
        $('#map1').css({"background-image": "url('images/maps/" + m1 + ".PNG')"});
        $('#map2').css({"background-image": "url('images/maps/" + m2 + ".PNG')"});
    }
}

function updateSquadBans(squad) {
    database.ref("squads/" + squad).once('value').then(function(s) {
        var members = Object.keys(s.val()["members"]);//Gets the list of members in the squad
        var maps = ["bank", "border", "chalet", "clubhouse", "coastline",
            "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
            "park", "villa"];
        var squadBanArray = { //This array tracks the total popularity of each map
            bank: 0,
            border: 0,
            chalet: 0,
            clubhouse: 0,
            coastline: 0,
            consulate: 0,
            kafe: 0,
            kanal: 0,
            oregon: 0,
            outback: 0,
            skyscraper: 0,
            park: 0,
            villa: 0
        };

        for (var i = 0; i < members.length; i++) {//Iterates through each map for each member
            for (var j = 0; j < maps.length; j++) {
                squadBanArray[maps[j]] += s.val()["map-bans"][members[i]][maps[j]];
            }
        }

        var entries = Object.entries(squadBanArray);//Turn the squad bans into a iterable array
        entries = insertionSort2D(entries);
        for (var i = 0; i < entries.length; i++) {
            database.ref("squads/" + squad + "/map-bans/squad-bans/" + entries[i][0]).set(i);
        }
    });
}

//Swap helper function
function swap (arr, index1, index2){
    let temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
}

function insertionSort2D(arr){
    let beginningIndex = 0;
    let currentIndex = 1;
    //while the start of the unsorted portion doesnt not start at the after the end of the array
    while(currentIndex < arr.length){
        //while the currentIndex does not reach the end of the sorted section or the array (index of -1)
        while(currentIndex > 0){
            //get currentValue(value to be sorted)
            currentVal = arr[currentIndex][1];
            //if it is lesser than the last value, swap the two values, otherwise, break out of the loop
            if(currentVal < arr[currentIndex - 1][1]){
                swap(arr, currentIndex, currentIndex - 1);
                currentIndex--;
            } else{
                break;
            }
        }
        //add 1 to beginningIndex to account for newly sorted section
        beginningIndex++;
        //start sorting from index after beginning
        currentIndex = beginningIndex + 1;
    }
    return arr;
}

const operatorMapSelect = $('#operator-map-list');
operatorMapSelect.on('change', function() {
    //This sets the dropdown back to default values
    $('#attack-operators').val('NA');
    $('#defense-operators').val('NA');

    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').show();
    $('#edit-operators-button').show();

    database.ref("squads/" + localStorage.getItem("squadname") + "/operator-bans/" + this.value).once('value').then(function(s) {
        //Load and display the data regarding operator bans
        $('#attack-operator').prop("src", "images/operators/" + s.val().attacker + ".svg");
        $('#defense-operator').prop("src", "images/operators/" + s.val().defender + ".svg");
    });
});

const editOperatorBans = $('#edit-operator-bans');
editOperatorBans.on('click', function() {
    $('#edit-operators-button').hide();
    $('#operator-select-div').show();
});

const attackOperatorDropdown = $('#attack-operators');
attackOperatorDropdown.on('change', function() {
    changeOpImg("attack");
});

const defenseOperatorDropdown = $('#defense-operators');
defenseOperatorDropdown.on('change', function() {
    changeOpImg("defense");
});

//This function is used to change the image of the operators while the user is editing the bans for a map
function changeOpImg(role) {
    $('#' + role + '-operator').attr("src", 'images/operators/' + $('#' + role + '-operators').val() + ".svg");
    $('#unsaved-changes').show();
}

const submitOperatorBans = $('#submit-operator-bans');
submitOperatorBans.on('click', function() {

    var map = $('#operator-map-list').val();
    var dOp = $('#defense-operators').val();
    var aOp = $('#attack-operators').val();

    var reference = "squads/" + localStorage.getItem("squadname") + "/operator-bans/" + map + "/";

    //Only update the ban if the dropdown menu has been changed, otherwise leave the operator the same
    if (aOp != null){ database.ref(reference + "attacker").set(aOp); }
    if (dOp != null){ database.ref(reference + "defender").set(dOp); }

    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').show();
    $('#edit-operators-button').show();
});

const siteStatMapList = $('#site-stat-map-list');
siteStatMapList.on('change', function() {
    var map = this.value;

    $('#site0').text(allSites[map][0]);
    $('#site1').text(allSites[map][1]);
    $('#site2').text(allSites[map][2]);
    $('#site3').text(allSites[map][3]);

    $('#site-data-div').hide();
    $('#site-stat-form').hide();
    $('#site-selection-div').show();
});

const siteSelection = $('#site-selection');
siteSelection.on('change', function() {
    $('#all-site-info').show();
    $('#attack').prop('checked', false);
    $('#defend').prop('checked', false);
    $('#win').prop('checked', false);
    $('#loss').prop('checked', false);
    $('#yes').prop('checked', false);
    $('#no').prop('checked', false);
    $('#submit-div').hide();

    var site = $('#site-selection').val();
    if (site != "default") {
        loadSiteData($('#site-stat-map-list').val(), site);
    }
});

function loadSiteData(map, site) {
    database.ref("squads/" + localStorage.getItem("squadname") + "/site-data/" + map + "/site" + site).once('value').then(function(s) {
        $('#attacking-wins').text("Attacking wins: " + s.val().awin);
        $('#attacking-losses').text("Attacking losses: " + s.val().aloss);

        $('#attacking-planted-wins').text("Successful plants: " + s.val().pawin);
        $('#attacking-planted-losses').text("Failed plants: " + s.val().paloss);

        $('#defending-wins').text("Defending wins: " + s.val().dwin);
        $('#defending-losses').text("Defending losses: " + s.val().dloss);

        $('#defending-planted-wins').text("Defusers disabled: " + s.val().pdwin);
        $('#defending-planted-losses').text("Failed disables: " + s.val().pdloss);

        $('#site-data-div').show();
        $('#site-stat-form').show();
    });
}

const siteRadios = document.getElementsByClassName('site-radio');
Array.from(siteRadios).forEach(function(e) {
    e.addEventListener('click', function() {
        if (document.querySelector('input[name="role"]:checked') != null && document.querySelector('input[name="success"]:checked') != null && document.querySelector('input[name="planted"]:checked') != null) {
            $('#submit-div').show();
        }
    });
});

const siteStatForm = $('#site-stat-form');
siteStatForm.on('submit', (e) => {
    e.preventDefault();

    var site = $('#site-selection').val();
    database.ref("squads/" + localStorage.getItem("squadname") + "/site-data/" + $('#site-stat-map-list').val() + "/site" + site).once('value').then(function(s) {
        var role = document.querySelector('input[name="role"]:checked');
        var winStatus = document.querySelector('input[name="success"]:checked');
        var plantStatus = document.querySelector('input[name="planted"]:checked');

        var roundStatus = role.value + winStatus.value;
        database.ref("squads/" + localStorage.getItem("squadname") + "/site-data/" + $('#site-stat-map-list').val() + "/site" + site + "/" + roundStatus).set(s.val()[roundStatus] + 1);

        if (plantStatus.value == "yes") {
            database.ref("squads/" + localStorage.getItem("squadname") + "/site-data/" + $('#site-stat-map-list').val() + "/site" + site + "/p" + roundStatus).set(s.val()["p" + roundStatus] + 1);
        }

        $('#attack').prop('checked', false);
        $('#defend').prop('checked', false);
        $('#win').prop('checked', false);
        $('#loss').prop('checked', false);
        $('#yes').prop('checked', false);
        $('#no').prop('checked', false);

        loadSiteData($('#site-stat-map-list').val(), site);

        $('#submit-div').hide();

        window.alert($('label[for="' + role.id + '"]').text() + " " + $('label[for="' + winStatus.id + '"]').text() + " submitted");
    });
});