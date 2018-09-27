//import modules
const request = require("request");
const fs = require('fs');

//twitch requirements
const TwitchHelix = require("twitch-helix");
const twitchApi = new TwitchHelix({
    clientId: //client ID goes here
    clientSecret: //client Secret goes here
});

var streams = ["lookatmybody", "DreamingWithKenton", "EaziTV", "Loots24", "ZarrantDK", "Luxuriia", "Azraelius", "GODgatti", "Fuhnkish", "Roosah", "imaqtpie"];

//Blizzard API Key
const APIkey = //api key goes here

//Region, Locale and Game
var RegionName = 'us';
var LocaleName = 'en_US';
var GameName = 'wow';

//Realm, and Guild
var RealmName = "Bleeding Hollow"; // Replace Realm Name here
    RealmName.replace(' ', '%20');
var GuildName = "Addiction"; //Replace Guild Name here
    GuildName.replace(' ', '%20');

//JSON urls
const wowprogURL = "https://www.wowprogress.com/guild/us/bleeding-hollow/Addiction/json_rank";
const wowtrackURL = "http://wowtrack.org/guilds/" + RegionName.toUpperCase() + "/" + RealmName + "/" + GuildName + "?response=data";
const blizzardURL = "https://" + RegionName + ".api.battle.net/" + GameName + "/guild/" + RealmName + "/" + GuildName + "?fields=members&locale=" + LocaleName + "&apikey=" + APIkey;
const raiderURL = "https://raider.io/api/v1/guilds/profile?region=us&realm=bleeding-hollow&name=Addiction&fields=raid_progression%2Craid_rankings";
//"https://raider.io/api/v1/guilds/profile?region=" + RegionName + "&realm=" + RealmName.replace('%20', '-').toLowerCase + "&name=" + GuildName.toLowerCase + "&fields=raid_rankings";

//Wow Progress request
request({url: wowprogURL, json: true}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        fs.writeFile('data/wowprogress.json', JSON.stringify(body, null, 4), function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
});

//Blizzard request
request({url: blizzardURL, json: true}, function (error, response, body) {
    if(!error && response.statusCode === 200) {
        fs.writeFile('data/blizzard.json', JSON.stringify(body, null, 4), function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
});

//Raider request
request({url: raiderURL, json: true}, function (error, response, body) {
    if(!error && response.statusCode === 200) {
        fs.writeFile('data/raider.json', JSON.stringify(body, null, 4), function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
});

//twitch user profile request
twitchApi.getTwitchUsersByName(streams).then(data => {
    fs.writeFile('data/twitch-data.json', JSON.stringify(data, null, 4), function(err) {
        if(err) {
            console.log(err);
        }
    });
}).catch(err => {
    console.log("Unable to retrieve data.");
});

//twitch stream live check
var obj = [];
streams.forEach(value => {
    twitchApi.getStreamInfoByUsername(value).then(data => {
        if(data != null) {
            obj.push({streamer: value, status: "online"});
        }
        else {
            obj.push({streamer: value, status: "offline"});
        }
        fs.writeFile('data/twitch-stream-status.json', JSON.stringify(obj, null, 4), function(err) {
            if(err) console.log(err);
        }); 
    }).catch(err => {
        console.log(err);
    });
});
    

