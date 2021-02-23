
//Once the user clicks on the operator bans page
const operatorBans = $('#operator-bans');
operatorBans.on('click', function() {
    hideAll();
    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').hide();
    $('#edit-operators-button').hide();
    $('#operator-bans-main').show();
    $('#operator-map-list').val('none');
});

const operatorMapSelect = $('#operator-map-list');
operatorMapSelect.on('change', function() {
    //This sets the dropdown back to default values
    $('#attack-operators').val('NA');
    $('#defense-operators').val('NA');

    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').show();
    $('#edit-operators-button').show();

    database.ref("squads/" + sessionStorage.getItem("squadname") + "/operator-bans/" + this.value).once('value').then(function(s) {
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

    var reference = "squads/" + sessionStorage.getItem("squadname") + "/operator-bans/" + map + "/";

    //Only update the ban if the dropdown menu has been changed, otherwise leave the operator the same
    if (aOp != null){ database.ref(reference + "attacker").set(aOp); }
    if (dOp != null){ database.ref(reference + "defender").set(dOp); }

    $('#operator-select-div').hide();
    $('#unsaved-changes').hide();
    $('#operator-display').show();
    $('#edit-operators-button').show();
});