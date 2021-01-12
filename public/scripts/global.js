$('footer').text("Signed in as " + localStorage.getItem("username"));
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
        localStorage.removeItem("username");
    });
}