//This map associates each map with its list of 4 sites
var allSites;
var maps;

//This assigns the global variables based on the maps in the database
database.ref("maps").once("value").then(function(m) {
    allSites = m.val();
    maps = Object.keys(m.val());

    console.log(allSites);
    console.log(maps);
});