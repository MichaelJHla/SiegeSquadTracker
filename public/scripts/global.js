var username;
console.log(localStorage.getItem("userid"));
database.ref("users/" + localStorage.getItem("userid") + "/username").once('value').then(function(snapshot) {
    $('footer').text("Signed in as " + snapshot.val());
});

$('#squad-name').text(localStorage.getItem("squadname"));

//Get the current status of the user's login
auth.onAuthStateChanged(user => {
    console.log(user);
    if (!user) { //If a user is not logged in
        window.location.replace("../index.html");
    }
});

function signOut() {
    auth.signOut().then(() => {
        localStorage.removeItem("squadname");
        localStorage.removeItem("userid");
    });
}