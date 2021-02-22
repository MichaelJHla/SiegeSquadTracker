//This map associates each map with its list of 4 sites
var allSites;
var maps;

database.ref("maps").once("value").then(function(m) {
    allSites = m.val();
    maps = Object.keys(m.val());

    console.log(allSites);
    console.log(maps);
});