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

function startVoting() {
sortedMaps = []; //Clear the sorted maps array

//Refresh the list of maps
maps = ["bank", "border", "chalet", "clubhouse", "coastline",
    "consulate", "kafe", "kanal", "oregon", "outback",
    "park", "villa"];
maps = shuffle(maps);//Shuffle the list of maps

m1 = maps.pop();
m2 = maps.pop();

$('#map1').text(m1);
$('#map2').text(m2);
}

function vote(a) {
if (sortedMaps.length == 0) { //Handles the first vote
    if (a == 1) {
        sortedMaps.push(m1);
        sortedMaps.push(m2);
    } else {
        sortedMaps.push(m2);
        sortedMaps.push(m1);
    }
    m1 = maps.pop();
    m2 = sortedMaps[0];
} else {
    if (a == 1) {
        sortedMaps.splice(sortedMaps.indexOf(m2), 0, m1);
        m1 = maps.pop();
        m2 = sortedMaps[0];
    } else {
        m2 = sortedMaps[sortedMaps.indexOf(m2) + 1];
        if (m2 == undefined) {
            sortedMaps.push(m1);
            m1 = maps.pop();
            m2 = sortedMaps[0];
        }
    }
}

if (m1 == undefined) {
    var i;
    for (i = 0; i < sortedMaps.length; i++) {
        database.ref("users/" + userName + "/map-bans/" + sortedMaps[i]).set(i);
        database.ref("squads/" + squadName + "/map-bans/" + userName + "/" + sortedMaps[i]).set(i);
    }
    viewBanList();
} else {
    //Updates the text of the voting buttons
    $('#map1').text(m1);
    $('#map2').text(m2);
}
}

function viewBanList() {
    $('#map-compare').hide();//Hiding the buttons after voting is finished prevents undefined errors

    updateSquadBans();
    database.ref("users/" + userName + "/map-bans").once('value').then(function(snapshot) {
        console.log(snapshot.val());
    });
}

function updateSquadBans() {
database.ref("squads/" + squadName).once('value').then(function(snapshot) {
    var members = snapshot.val()["members"];//Gets the list of members in the squad
    var maps = ["bank", "border", "chalet", "clubhouse", "coastline",
        "consulate", "kafe", "kanal", "oregon", "outback",
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
        database.ref("squads/" + squadName + "/map-bans/squad-bans/" + entries[i][0]).set(i);
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
        if(currentVal > arr[currentIndex - 1][1]){
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