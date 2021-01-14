//Some variables used by the whole script
var sortedMaps = [];
var maps = [];
var m1;
var m2;

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

function loadSquadMembers() {
    database.ref("squads/" + localStorage.getItem("squadname") + "/members").once('value').then(function(snapshot) {
        for (var key in snapshot.val()) {
            var member = $('<button>' + snapshot.val()[key] + '</button>'); //Create new h4 element that represents a member
            member.val(key);
            member.attr('onClick', 'viewPlayerBanList(this.value)');
            $('#squad-members').append(member);
        }
    });
}

//This function is used to initiate the voting process by setting everything up for the vote process to take place
function startVoting() {
    $('#squad-bans').show();//Show the button which lets the user view the squad bans
    $('#edit-bans').hide();//Hide the button which starts the voting process for the user
    $('#ban-list').hide();//Hides the ban list area so that screen clutter is reduced
    $('#status').text("Choose the map which you would rather play:");

    sortedMaps = []; //Clear the sorted maps array

    //Refresh the list of maps
    maps = ["bank", "border", "chalet", "clubhouse", "coastline",
        "consulate", "kafe", "kanal", "oregon", "outback", "skyscraper",
        "park", "villa"];
    maps = shuffle(maps);//Shuffle the list of maps

    m1 = maps.pop();
    m2 = maps.pop();

    $('#map1').css({"background-image": "url('../images/maps/" + m1 + ".PNG')"});
    $('#map2').css({"background-image": "url('../images/maps/" + m2 + ".PNG')"});

    $('#map-compare').show();
}

//This function is used to handle each vote as they are cast
function vote(a) {
    if (sortedMaps.length == 0) { //Handles the first vote
        if (a == 1) {//If the player prefers the first map listed
            sortedMaps.push(m1);//Pushed the first map on then the second map
            sortedMaps.push(m2);
        } else {
            sortedMaps.push(m2);//Pushes the second map on then the first map
            sortedMaps.push(m1);
        }
        m1 = maps.pop();//Pops the next map to be evaluated off the list of maps
        m2 = sortedMaps[0];//Gets the top map on the players list of maps
    } else {
        if (a == 1) {//If the most recently evaluated map is preferred
            sortedMaps.splice(sortedMaps.indexOf(m2), 0, m1);//Splice the map into the list of sorted maps
            m1 = maps.pop();//Get the next map to be evaluated from the remaining maps
            m2 = sortedMaps[0];//Gets the top map of the players list of maps
        } else {//A previously sorted map is selected as the preferred map
            m2 = sortedMaps[sortedMaps.indexOf(m2) + 1];//Make the next map to be evaluated, the next map in the sorted list
            if (m2 == undefined) {//If there is no next map 
                sortedMaps.push(m1);//Put the map being evaluated to the end of the array of sorted maps
                m1 = maps.pop();//Get the next map to be evaluated from the remaining maps
                m2 = sortedMaps[0];//Gets the top map of the players list of maps
            }
        }
    }

    if (m1 == undefined) {//If there is no more maps left in the list that need to be evaluated
        var i;
        for (i = 0; i < sortedMaps.length; i++) {//Set the maps in the database under the proper username
            database.ref("users/" + localStorage.getItem("userid") + "/map-bans/" + sortedMaps[i]).set(i);
            database.ref("squads/" + localStorage.getItem("squadname") + "/map-bans/" + localStorage.getItem("userid") + "/" + sortedMaps[i]).set(i);
        }
        viewPlayerBanList(localStorage.getItem("userid"));//View the list of maps that was just created
    } else {
        //Updates the images of the voting buttons
        $('#map1').css({"background-image": "url('../images/maps/" + m1 + ".PNG')"});
        $('#map2').css({"background-image": "url('../images/maps/" + m2 + ".PNG')"});
    }
}

function viewPlayerBanList(player) {
    updateSquadBans();
    database.ref("users/" + player).once('value').then(function(snapshot) {
        $('#ban-list').empty();//Clears all the content out of the ban list

        $('#map-compare').hide();//Hiding the buttons after voting is finished prevents undefined errors
        $('#squad-bans').show();//Shows the button which lets the user pull up the squad ban list
        $('#edit-bans').show();//Shows the button which lets the user edit their own bans
        $('#status').text(snapshot.val().username + "'s ban list:");

        console.log(snapshot.val()["map-bans"]);
        var entries = Object.entries(snapshot.val()["map-bans"]);
        var i;
        //This for loop sorts the entries from the database
        for (i = 0; i < entries.length; i++) {
            sortedMaps[entries[i][1]] = entries[i][0];
        }

        //Adds the images needed to the main area of the page
        for (i = sortedMaps.length - 1; i >= 0; i--) {
            var img = $('<img>');
            img.attr('src', '../images/maps/' + sortedMaps[i] + '.PNG');
            $('#ban-list').append(img);
        }
    });

    $('#ban-list').show();
}

function viewSquadBanList() {
    console.log("Testing");
    $('#ban-list').empty();//Clears all the content out of the ban list

    $('#map-compare').hide();//Hiding the buttons after voting is finished prevents undefined errors
    $('#squad-bans').hide();//Hides the view squad bans button since this is already displayed
    $('#edit-bans').show();//Show the button that lets the user edit their ban list
    $('#status').text(localStorage.getItem("squadname") + "'s ban list:");

    database.ref("squads/" + localStorage.getItem("squadname") + "/map-bans/squad-bans").once('value').then(function(snapshot) {
        var entries = Object.entries(snapshot.val());
        var i;
        //This for loop sorts the entries from the database
        for (i = 0; i < entries.length; i++) {
            sortedMaps[entries[i][1]] = entries[i][0];
        }

        //Adds the images needed to the main area of the page
        for (i = sortedMaps.length - 1; i >= 0; i--) {
            var img = $('<img>');
            img.attr('src', '../images/maps/' + sortedMaps[i] + '.PNG');
            $('#ban-list').append(img);
        }
    });

    $('#ban-list').show();
}

function updateSquadBans() {
    database.ref("squads/" + localStorage.getItem("squadname")).once('value').then(function(snapshot) {
        var members = Object.keys(snapshot.val()["members"]);//Gets the list of members in the squad
        console.log(members);
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

        var i;
        var j;
        for (i = 0; i < members.length; i++) {//Iterates through each map for each member
            for (j = 0; j < maps.length; j++) {
                squadBanArray[maps[j]] += snapshot.val()["map-bans"][members[i]][maps[j]];
            }
        }

        var entries = Object.entries(squadBanArray);//Turn the squad bans into a iterable array
        entries = insertionSort2D(entries);
        for (i = 0; i < entries.length; i++) {
            database.ref("squads/" + localStorage.getItem("squadname") + "/map-bans/squad-bans/" + entries[i][0]).set(i);
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

viewSquadBanList();
loadSquadMembers();