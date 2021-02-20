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

    const squadPath = "squads/" + squad;

    admin.database().ref(squadPath + "/password").set(password);
    admin.database().ref(squadPath + "/admin").set(userID);

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

    const userPath = "users/" + userID;
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

// This function allows the user to join a squad. Once a user joins the squad,
// they are more free to interact with the squad
exports.joinSquad = functions.https.onCall((data, context) => {
  if (context.auth) {
    const squadName = data.squad;
    const password = data.password;
    const userID = context.auth.uid;

    admin.database().ref("squads").once("value").then(function(s) {
      if (Object.keys(s.val()).includes(squadName)) {
        const squad = s.val()[squadName];

        if (squad["password"] == password) {
          if (Object.keys(squad["members"].length < 5)) {
            // The operations for joining a squad
            const uPath = "users/" + userID;
            const squadPath = "squads/" + squadName;

            admin.database().ref(uPath + "/squad").set(squadName);

            return admin.database().ref(uPath).once("value").then(function(s) {
              const memberPath = squadPath + "/members/" + userID;
              const mapPath = squadPath + "/map-bans/" + userID;
              admin.database().ref(memberPath).set(s.val()["username"]);
              admin.database().ref(mapPath).set(s.val()["map-bans"]);
            });
          } else { // Squad is full
            throw new functions.https.HttpsError(
                "out-of-range",
                "This squad is already at the max size"
            );
          }
        } else { // Incorrect password
          throw new functions.https.HttpsError(
              "invalid-argument",
              "This squad exists and the password is incorrect"
          );
        }
      } else { // Squad does not exist
        throw new functions.https.HttpsError(
            "not-found",
            "this squad does not exist"
        );
      }
    });
  }
});
