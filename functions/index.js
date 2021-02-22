const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// This function creates a new squad in the database
exports.createNewSquad = functions.https.onCall((data, context) => {
  if (context.auth) { // Evaluates to true if a user is authenticated
    const squad = data.squad;
    const password = data.password;
    const userID = context.auth.uid;
    const sites = data.sites;

    // Used to shorten the path to the squad in the database
    const squadPath = "squads/" + squad;

    // Sets the admin and password in the database for the new squad
    admin.database().ref(squadPath + "/password").set(password);
    admin.database().ref(squadPath + "/admin").set(userID);

    // Sets all the blank site data for the new squad
    Object.keys(sites).forEach((map) => {
      const opBanPath = squadPath + "/operator-bans/" + map;

      admin.database().ref(opBanPath + "/attacker").set("none");
      admin.database().ref(opBanPath + "/defender").set("none");

      for (let i = 0; i < 4; i++) {
        const sitePath = squadPath + "/site-data/" + map + "/site" + i;

        admin.database().ref(sitePath + "/name").set(sites[map][i]);

        admin.database().ref(sitePath + "/aloss").set(0);
        admin.database().ref(sitePath + "/awin").set(0);
        admin.database().ref(sitePath + "/dloss").set(0);
        admin.database().ref(sitePath + "/dwin").set(0);
        admin.database().ref(sitePath + "/paloss").set(0);
        admin.database().ref(sitePath + "/pawin").set(0);
        admin.database().ref(sitePath + "/pdloss").set(0);
        admin.database().ref(sitePath + "/pdwin").set(0);
      }
    });

    // Used to shorten the path to the user in the database
    const userPath = "users/" + userID;

    // Reads user info and writes it to the new squad
    admin.database().ref(userPath + "/squad").set(squad);
    return admin.database().ref(userPath).once("value").then(function(s) {
      const memberPath = squadPath + "/members/" + userID;
      const mapPath = squadPath + "/map-bans/" + userID;
      admin.database().ref(memberPath).set(s.val()["username"]);
      admin.database().ref(mapPath).set(s.val()["map-bans"]);
    });
  } else {
    throw new functions.https.HttpsError("unauthenticated");
  }
});

// This function joins a squad in the database
exports.joinSquad = functions.https.onCall((data, context) => {
  if (context.auth) { // Evaluates to true if a user is authenticated
    return admin.database().ref("squads").once("value").then(function(s) {
      const squadName = data.squad;
      const password = data.password;
      const userID = context.auth.uid;

      // If the squad name does not exist in the database
      if (!Object.keys(s.val()).includes(squadName)) {
        return 1;
      }

      const squad = s.val()[squadName];
      // If the password does not match the name of the squad
      if (squad["password"] != password) {
        return 2;
      }

      // If the squad has reached the max squad size
      if (Object.keys(squad["members"]).length >= 5) {
        return 3;
      }

      // Used to shorten the path to a database point
      const squadPath = "squads/" + squadName;
      const userPath = "users/" + userID;

      // Sets the squad name in the user's profile in the database
      admin.database().ref(userPath + "/squad").set(squadName);

      // Reads user info and writes it into the squad they just joined
      admin.database().ref(userPath).once("value").then(function(u) {
        const memberPath = squadPath + "/members/" + userID;
        const mapPath = squadPath + "/map-bans/" + userID;
        admin.database().ref(memberPath).set(u.val()["username"]);
        admin.database().ref(mapPath).set(u.val()["map-bans"]);
      });

      // Exit code for the user being added to the squad
      return 0;
    });
  } else {
    throw new functions.https.HttpsError("unauthenticated");
  }
});
