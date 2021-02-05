//Once the user clicks on the site stats page
const siteStats = $('#site-stats');
siteStats.on('click', function() {
    hideAll();
    $('#site-data-div').hide();
    $('#site-selection-div').hide();
    $('#site-stat-form').hide();
    $('#site-stats-main').show();
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