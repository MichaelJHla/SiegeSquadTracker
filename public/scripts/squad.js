//This map associates each map with its list of 4 sites
var allSites = 
    {"bank": ["Executive Lounge and CEO", "Staff Room and Open Area", "Teller's Office and Archives", "Lockers and CCTV"],
    "border": ["Customs and Supply Room", "Workshop and Ventilation", "Tellers and Bathroom", "Armory Lockers and Archives"],
    "chalet": ["Master Bedroom and Office", "Bar and Gaming Room", "Dining Room and Kitchen", "Wine Cellar and Snowmobile Garage"],
    "clubhouse": ["Gym and Bedroom", "CCTV and Cashroom", "Bar and Stock Room", "Church and Arsenal Room"],
    "coastline": ["Theater and Penthouse", "Hookah Lounge and Billiards Room", "Blue Bar and Sunrise Bar", "Service Entrance and Kitchen"],
    "consulate": ["Consul Office and Meeting Room", "Lobby and Press Room", "Garage and Cafeteria", "Tellers and Archives"],
    "kafe": ["Cocktail Lounge and Bar", "Mining Room and Fireplace Hall", "Reading Room and Fireplace Hall", "Kitchen Service and Kitchen Cooking"],
    "kanal": ["Server Room and Radar Room", "Security Room and Map Room", "Coast Guard Meeting Room and Lounge", "Supply Room and Kayaks"],
    "oregon": ["Main Dorms Hall and Kids Dorm", "Dining Hall and Kitchen", "Meeting Hall and Kitchen", "Laundry Room and Supply Room"],
    "outback": ["Games Room and Laundry Room", "Party Room and Office", "Nature Room and Bushranger Office", "Gear Store and Compressor"],
    "park": ["Office and Initiation Room", "Bunk and Day Care", "Armory and Throne Room", "Lab and Storage"],
    "skyscraper": ["Tea Room and Karaoke", "Exhibition Room and Office", "Kitchen and BBQ", "Bedroom and Bathroom"],
    "villa": ["Aviator Room and Games Room", "Trophy Room and Statuary Room", "Living Room and Library", "Dining Room and Kitchen"]
};

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (!user) { //If a user is not logged in
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
        localStorage.removeItem("username");
        window.location.replace("../index.html");
    }
});

function signOut() {
    auth.signOut().then(() => {
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
        localStorage.removeItem("username");
    });
}

function checkSquadStatus() {
    database.ref("users/" + localStorage.getItem("userid")).once('value').then(function(snapshot) {
        $('footer').text("Signed in as " + snapshot.val().username);
        var squad = snapshot.val().squad;
        if (squad) { //If the user is part of a squad
            $('#header-wrapper').show();
            $('#squad-data').show();
            $('#squad-name').text(localStorage.getItem("squadname"));
            $('#no-squad').hide();
        } else { //If the user is not part of a squad
            $('#no-squad').show();
        }
    });
}

var joinSquadForm = document.querySelector("#join-squad-form");
joinSquadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    database.ref("squads").once('value').then(function(snapshot) {
        var squad = $('#squad').val();
        var squadPassword = $('#squad-password').val();
        var squadList = Object.keys(snapshot.val());
        if (squadList.includes(squad)) {//If this squad exists
            if (squadPassword == snapshot.val()[squad].password) { //If the password is correct
                if (window.confirm("Would you like to join the squad " + squad + "?")) { //If the user confirms to join the squad
                    database.ref("users/" + localStorage.getItem("userid") + "/squad").set(squad);
                    database.ref("users/" + localStorage.getItem("userid") + "/username").once('value').then(function(snapshot) {
                        database.ref("squads/" + squad + "/members/" + localStorage.getItem("userid")).set(snapshot.val());
                    });
                    localStorage.setItem("squadname", squad);
                    database.ref("users/" + localStorage.getItem("userid") + "/map-bans").once('value').then(function(snapshot) {
                        database.ref("squads/" + squad + "/map-bans/" + localStorage.getItem("userid")).set(snapshot.val());
                        updateSquadBans();
                    });
                }
            } else { //If the password is not correct
                window.alert("This squad already exists and the password is incorrect");
            }
        } else {//If this squad does not exist
            if (window.confirm("The squad " + squad + " does not exist. Would you like to create a new squad with this name and password?")) {
                createNewSquad(squad, squadPassword);
                localStorage.setItem("squadname", squad);
                database.ref("users/" + localStorage.getItem("userid") + "/squad").set(squad);
            } else {
                window.alert("New squad not created");
            }
        }
        checkSquadStatus();
    });
});

function createNewSquad(squad, password) {
    //Sets the squad password to the proper value
    database.ref("squads/" + squad + "/password").set(password);

    //sets the admin to the creator of the squad
    database.ref("squads/" + squad + "/admin").set(localStorage.getItem("userid"));

    //Add the first member to the squad
    database.ref("users/" + localStorage.getItem("userid") + "/username").once('value').then(function(snapshot) {
        database.ref("squads/" + squad + "/members/" + localStorage.getItem("userid")).set(snapshot.val());
    });

    //This creates all the site data and sets it to 0, and sets all maps to have no ban listed for their operator bans
    Object.keys(allSites).forEach(function(key) {
        database.ref("squads/" + squad + "/operator-bans/" + key + "/attacker").set("none");
        database.ref("squads/" + squad + "/operator-bans/" + key + "/defender").set("none");

        var i;
        for (i = 0; i < 4; i++) {
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/name").set(allSites[key][i]);

            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/aloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/awin").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/dloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/dwin").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/paloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/pawin").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/pdloss").set(0);
            database.ref("squads/" + squad + "/site-data/" + key + "/site" + i + "/pdwin").set(0);
        }
    });

    database.ref("users/" + localStorage.getItem("userid") + "/map-bans").once('value').then(function(snapshot) {
        database.ref("squads/" + squad + "/map-bans/" + localStorage.getItem("userid")).set(snapshot.val());
        updateSquadBans();
    });
    checkSquadStatus();
}

function updateSquadBans() {
    database.ref("squads/" + localStorage.getItem("squadname")).once('value').then(function(snapshot) {
        var members = Object.keys(snapshot.val()["members"]);//Gets the list of members in the squad
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

//Swap helper function
function swap (arr, index1, index2){
    let temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
}

checkSquadStatus();