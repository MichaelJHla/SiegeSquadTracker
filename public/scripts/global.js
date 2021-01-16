database.ref("users/" + localStorage.getItem("userid") + "/username").once('value').then(function(snapshot) {
    $('footer').text("Signed in as " + snapshot.val());
});

$('#squad-name').text(localStorage.getItem("squadname"));

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    if (!user) { //If a user is not logged in
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
        localStorage.removeItem("username");
        window.location.replace("../index.html");
    } else {
        database.ref("users/" + localStorage.getItem("userid")).once('value').then(function(snapshot) {
            if (!snapshot.val().squad) {
                window.location.replace("squad.html");
            }
        })
    }
});

function signOut() {
    auth.signOut().then(() => {
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
        localStorage.removeItem("username");
    });
}