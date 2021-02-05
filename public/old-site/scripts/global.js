//Displays the username of the user who is currently signed in
database.ref("users/" + localStorage.getItem("userid") + "/username").once('value').then(function(snapshot) {
    $('footer').text("Signed in as " + snapshot.val());
});

//Sets the squad name text at the top of the page
$('#squad-name').html("<a href='squad.html'>" + localStorage.getItem("squadname") + "</a>");

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (!user) { //If a user is not logged in
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
        localStorage.removeItem("username");
        window.location.replace("../index.html");
    } else {
        //Checks if the user is part of a squad, if they are not then return them to the squad page
        database.ref("users/" + localStorage.getItem("userid")).once('value').then(function(snapshot) {
            if (!snapshot.val().squad) {
                localStorage.removeItem("squadname");
                window.location.replace("squad.html");
            }
        });
    }
});

//Signs out the user, then clears all the data in the local storage
function signOut() {
    auth.signOut().then(() => {
        localStorage.clear();
    });
}