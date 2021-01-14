//This function is used to load and display the operator ban for the map
function loadBan() {
    //This sets the dropdown back to default values
    $('#attack-operators').val('NA');
    $('#defense-operators').val('NA');
    //TODO HANDLE THE NA CASE WHEN SUBMITTING NEW BANS

    $('#edit-bans').show();
    $('.wrapper').hide();
    $('#unsaved-changes').hide();

    database.ref("squads/" + localStorage.getItem("squadname") + "/operator-bans/" + $('#map-list').val()).once('value').then(function(snapshot) {
        //Load and display the data regarding operator bans
        $('#attack-operator').attr("src", "../images/operators/" + snapshot.val().attacker + ".svg");
        $('#defense-operator').attr("src", "../images/operators/" + snapshot.val().defender + ".svg");
    });
}

//This function is used to change the image of the operators while the user is editing the bans for a map
function changeOpImg(role) {
    $('#' + role + '-operator').attr("src", '../images/operators/' + $('#' + role + '-operators').val() + ".svg");
    $('#unsaved-changes').show();
}

//This function is used to submit the new ban information to the database
function submitBan() {

    var map = $('#map-list').val();
    var dOp = $('#defense-operators').val();
    var aOp = $('#attack-operators').val();

    var reference = "squads/" + localStorage.getItem("squadname") + "/operator-bans/" + map + "/";

    //Only update the ban if the dropdown menu has been changed, otherwise leave the operator the same
    if (aOp != null){ database.ref(reference + "attacker").set(aOp); }
    if (dOp != null){ database.ref(reference + "defender").set(dOp); }

    loadBan();
}

//Displays the proper items when a map's bans are to be edited
function openEditScreen() {
    $('.wrapper').show();
    $('#edit-bans').hide();
}