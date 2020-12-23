//This map associates each map with its list of 4 sites
var allSites = new Map([
    ["bank", ["Executive Lounge and CEO", "Staff Room and Open Area", "Teller's Office and Archives", "Lockers and CCTV"]],
    ["border", ["Customs and Supply Room", "Workshop and Ventilation", "Tellers and Bathroom", "Armory Lockers and Archives"]],
    ["chalet", ["Master Bedroom and Office", "Bar and Gaming Room", "Dining Room and Kitchen", "Wine Cellar and Snowmobile Garage"]],
    ["clubhouse", ["Gym and Bedroom", "CCTV and Cashroom", "Bar and Stock Room", "Church and Arsenal Room"]],
    ["coastline", ["Theater and Penthouse", "Hookah Lounge and Billiards Room", "Blue Bar and Sunrise Bar", "Service Entrance and Kitchen"]],
    ["consulate", ["Consul Office and Meeting Room", "Lobby and Press Room", "Garage and Cafeteria", "Tellers and Archives"]],
    ["kafe", ["Cocktail Lounge and Bar", "Mining Room and Fireplace Hall", "Reading Room and Fireplace Hall", "Kitchen Service and Kitchen Cooking"]],
    ["kanal", ["Server Room and Radar Room", "Security Room and Map Room", "Coast Guard Meeting Room and Lounge", "Supply Room and Kayaks"]],
    ["oregon", ["Main Dorms Hall and Kids Dorm", "Dining Hall and Kitchen", "Meeting Hall and Kitchen", "Laundry Room and Supply Room"]],
    ["outback", ["Games Room and Laundry Room", "Party Room and Office", "Nature Room and Bushranger Office", "Gear Store and Compressor"]],
    ["park", ["Office and Initiation Room", "Bunk and Day Care", "Armory and Throne Room", "Lab and Storage"]],
    ["skyscraper", ["Tea Room and Karaoke", "Exhibition Room and Office", "Kitchen and BBQ", "Bedroom and Bathroom"]],
    ["villa", ["Aviator Room and Games Room", "Trophy Room and Statuary Room", "Living Room and Library", "Dining Room and Kitchen"]]
]);

var map;

$('#all-site-info').hide();

function loadSites() {
    $('#all-site-info').hide();

    map = $('#map-selection').val();

    $('#site-selection').val('default');

    $('#site0').text(allSites.get(map)[0]);
    $('#site1').text(allSites.get(map)[1]);
    $('#site2').text(allSites.get(map)[2]);
    $('#site3').text(allSites.get(map)[3]);

    $('#site-selection-div').show();
}

function submitSiteData() {
    $('#submit').hide();
    
    var site = $('#site-selection').val();
    database.ref("squads/" + localStorage.getItem("squadName") + "/site-data/" + map + "/site" + site).once('value').then(function(snapshot) {
        var role = document.querySelector('input[name="role"]:checked').value;
        var winStatus = document.querySelector('input[name="success"]:checked').value;
        var plantStatus = document.querySelector('input[name="planted"]:checked').value;

        var roundStatus = role + winStatus;
        database.ref("squads/" + localStorage.getItem("squadName") + "/site-data/" + map + "/site" + site + "/" + roundStatus).set(snapshot.val()[roundStatus] + 1);

        if (plantStatus == "yes") {
            database.ref("squads/" + localStorage.getItem("squadName") + "/site-data/" + map + "/site" + site + "/p" + roundStatus).set(snapshot.val()["p" + roundStatus] + 1);
        }

        $('#attack').prop('checked', false);
        $('#defend').prop('checked', false);
        $('#win').prop('checked', false);
        $('#loss').prop('checked', false);
        $('#yes').prop('checked', false);
        $('#no').prop('checked', false);

        loadSiteData();
    });
}

function loadSiteData() {
    $('#all-site-info').show();
    $('#attack').prop('checked', false);
    $('#defend').prop('checked', false);
    $('#win').prop('checked', false);
    $('#loss').prop('checked', false);
    $('#yes').prop('checked', false);
    $('#no').prop('checked', false);
    $('#submit').hide();
    
    var site = $('#site-selection').val();
    if (site != "default") {
        database.ref("squads/" + localStorage.getItem("squadName") + "/site-data/" + map + "/site" + site).once('value').then(function(snapshot) {
            $('#attacking-wins').text("Attacking wins: " + snapshot.val().awin);
            $('#attacking-losses').text("Attacking losses: " + snapshot.val().aloss);

            $('#successful-plants').text("Successful defuser plants: " + snapshot.val().pawin);
            $('#failed-plants').text("Failed defuser plants: " + snapshot.val().paloss);

            $('#defending-wins').text("Defending wins: " + snapshot.val().dwin);
            $('#defending-losses').text("Defending losses: " + snapshot.val().dloss);

            $('#successful-disables').text("Defusers disabled: " + snapshot.val().pdwin);
            $('#failed-disables').text("Defusers not disabled: " + snapshot.val().pdloss);
        });
    }
}

function checkAllRadio() {
    if (document.querySelector('input[name="role"]:checked') != null && document.querySelector('input[name="success"]:checked') != null && document.querySelector('input[name="planted"]:checked') != null) {
        $('#submit').show();
    }
}