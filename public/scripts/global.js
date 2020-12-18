//This will tell the user who they are signed in as
$('footer').text("Signed in as " + localStorage.getItem("userName"));
$('#squad-name').text(localStorage.getItem("squadName"));

function changeUser() {
    localStorage.setItem("userName", $('#user-name').val());
    database.ref("users/" + localStorage.getItem("userName") + "/squad").once('value').then(function(snapshot) {
        localStorage.setItem("squadName", snapshot.val());
    });
}