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
    return admin.database().ref("squads").once("value").then(function(s) {
      // Verifies that no squads will be overwritten
      if (!Object.keys(s.val()).includes(squad)) {
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
        return admin.database().ref(userPath).once("value").then(function(u) {
          const memberPath = squadPath + "/members/" + userID;
          const mapPath = squadPath + "/map-bans/" + userID;
          admin.database().ref(memberPath).set(u.val()["username"]);
          admin.database().ref(mapPath).set(u.val()["map-bans"]);
        });
      }
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

exports.removeFromSquad = functions.https.onCall((data, context) => {
  const player = data.player;
  const squad = data.squad;

  admin.database().ref("squads/" + squad + "/map-bans/" + player).remove();
  admin.database().ref("squads/" + squad + "/members/" + player).remove();

  const d = new Date();
  const tPath = "squads/" + squad + "/trigger";
  admin.database().ref(tPath).set(d.getTime() + Math.random(1000));

  admin.database().ref("users/" + player + "/squad").remove();

  return admin.database().ref("squads/"+squad).once("value").then(function(s) {
    if (player == s.val().admin) {
      const aPath = "squads/" + squad + "/admin";
      admin.database().ref(aPath).set(Object.keys(s.val()["members"])[0]);
    }
  });
});

exports.updateBans = functions.database.ref("squads/{squad}/trigger")
    .onWrite((snap, context) => {
      return admin.database().ref().once("value").then(function(s) {
        const squad = context.params.squad;
        const maps = Object.keys(s.val()["maps"]);
        const squadBanObject = {};

        const squadLoc = s.val()["squads"][squad];

        const members = Object.keys(squadLoc["members"]);

        for (let i = 0; i < maps.length; i++) {
          squadBanObject[maps[i]] = 0;
        }

        for (let i = 0; i < members.length; i++) {
          for (let j = 0; j < maps.length; j++) {
            const curMap = squadLoc["map-bans"][members[i]][maps[j]];
            squadBanObject[maps[j]] += curMap;
          }
        }

        const entries = Object.entries(squadBanObject);

        let begI = 0;
        let curI = 1;

        while (curI < entries.length) {
          while (curI > 0) {
            const curVal = entries[curI][1];
            if (curVal < entries[curI - 1][1]) {
              const temp = entries[curI];
              entries[curI] = entries[curI - 1];
              entries[curI - 1] = temp;
              curI--;
            } else {
              break;
            }
          }
          begI++;
          curI = begI + 1;
        }

        for (let i = 0; i < entries.length; i++) {
          const path = "squads/" + squad + "/map-bans/squad-bans/";
          admin.database().ref(path + entries[i][0]).set(i);
        }
      });
    });
