//Once the user clicks on the user stats page
const userStats = $('#user-stats');
userStats.on('click', function() {
    hideAll();
    
    $('#user-stats-main').show();
    $('#user-stat-list-loading').show(); //Displays a loading message

    $('#user-stat-list').hide();
    $('#user-stat-div').hide();

    //Displays the proper list of users once the users have been retrieved from the database
    database.ref("squads/" + sessionStorage.getItem("squadname") + "/members").once('value').then(function(s) {
        const members = Object.keys(s.val());

        members.forEach(m => {
            const cur = s.val()[m];
            $('#user-stat-list').append($('<option></option>').val(cur).html(cur));
        });

        $('#user-stat-list-loading').hide();
        $('#user-stat-list').show();
    });
});

