//Once the user clicks on the map bans page
const mapBans = $('#map-bans');
mapBans.on('click', function() {
    hideAll();
    loadMapBans();
    $('#map-bans-main').show();
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
    $('#edit-user-bans-button').html("Edit bans for " + sessionStorage.getItem("username"));
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
    squadRadioLabel.text(sessionStorage.getItem("squadname"));//Sets the label to display the squad name

    //Append the radio button and the label to the overall div
    $('#map-ban-radios-div').append(squadRadio);
    $('#map-ban-radios-div').append(squadRadioLabel);

    //This div will hold the names of the members of the squad
    var membersListMapBan = $('<div></div>');
    membersListMapBan.addClass("members-list-map-ban");

    //Gets the list of all the squad members and will display them as radio button labels which can be selected
    database.ref("squads/" + sessionStorage.getItem("squadname") + "/members").once('value').then(function(s) {
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

            var memberRadioDiv = $('<div></div>');
            memberRadioDiv.append(memberRadio);
            memberRadioDiv.append(memberRadioLabel);
            
            //Append the radio button and the label to the div
            membersListMapBan.append(memberRadioDiv);
        }

        $('#map-ban-radios-div').append(membersListMapBan);

        var elements = document.getElementsByClassName('map-ban-radio');
        Array.from(elements).forEach(function(e){
            e.addEventListener('click', function() {
                updateSquadBans(sessionStorage.getItem("squadname"));
                $('#ban-list').hide();//Gives better feedback to the user that the ban list is loading
                //Gets the map ban list for the given data in the map-bans section of the squad
                database.ref('squads/' + sessionStorage.getItem("squadname") + "/map-bans/" + this.value).once('value').then(function(s) {
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
            database.ref("users/" + auth.currentUser.uid + "/map-bans/" + votedMaps[i]).set(i);
            database.ref("squads/" + sessionStorage.getItem("squadname") + "/map-bans/" + auth.currentUser.uid + "/" + votedMaps[i]).set(i);
        }
        $('#' + auth.currentUser.uid).click();//Shows the user their new ban list
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