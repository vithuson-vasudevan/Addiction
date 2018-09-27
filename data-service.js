const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//set connection
//connection details go here

sequelize.authenticate()
    .then(function() {
        console.log("Connected to database successfully.");
    })
    .catch(function(err) {
        console.log("Unable to connect to database: ", err);
    });

//news module
var News = sequelize.define('news', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    content: Sequelize.TEXT,
    author: Sequelize.CHAR
});

//sales item module
var Items = sequelize.define('items', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: Sequelize.STRING,
    name: Sequelize.STRING,
    description: Sequelize.TEXT,
    price: Sequelize.INTEGER,
    imagePath: Sequelize.CHAR  
});

//sales request module
var SalesRequest = sequelize.define('request', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: Sequelize.CHAR,
    email: Sequelize.CHAR,
    message: Sequelize.TEXT
});

//application module
var Application = sequelize.define('application', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstname: Sequelize.CHAR,
    lastname: Sequelize.CHAR,
    age: Sequelize.INTEGER,
    city: Sequelize.TEXT,
    state: Sequelize.TEXT,
    email: Sequelize.TEXT,
    battletag: Sequelize.TEXT,
    class: Sequelize.TEXT,
    spec: Sequelize.TEXT,
    armory: Sequelize.TEXT,
    timeplayed: Sequelize.TEXT,
    alt: Sequelize.TEXT,
    schedule: Sequelize.TEXT,
    uikeybinds: Sequelize.TEXT,
    logs: Sequelize.TEXT,
    raidingexp: Sequelize.TEXT,
    references: Sequelize.TEXT,
    previousguilds: Sequelize.TEXT,
    reasons: Sequelize.TEXT,
    about: Sequelize.TEXT,
    special: Sequelize.TEXT,
    color: Sequelize.TEXT,
    archived: Sequelize.INTEGER
});

//import modules
const fs = require('fs');

//global variables
var progArray = [];
var ranksArray = [];
var rosterArray = []; 
var recruitArray = [];
var streamsArray = [];

//module exports
module.exports = {
    initialize: initialize,
    getRaidProg: getRaidProg,
    getGuildRanks: getGuildRanks,
    getRoster: getRoster,
    getRecruitmentInfo: getRecruitmentInfo,
    getStreamsInfo: getStreamsInfo,
    getNews: getNews,
    createNews: createNews,
    createItem: createItem,
    getItem: getItem,
    createSalesReq: createSalesReq,
    getSalesReq: getSalesReq,
    getClassInfo: getClassInfo,
    updateClassInfo: updateClassInfo,
    getApplications: getApplications,
    createApplication: createApplication,
    deleteItem: deleteItem,
    deleteSalesReq: deleteSalesReq,
    deleteApp: deleteApp
};


//exported functions
function initialize() {
    return new Promise(function (resolve, reject) {
        fs.readFile('./data/raider.json', 'utf8', (err, data) => {
            if(err) reject(err);
            else 
            { 
                //load progression data into global array
                progArray = JSON.parse(data);
                resolve('Progression array populated');
            }
        });
        fs.readFile('./data/wowprogress.json', 'utf8', (err, data) => {
            if(err) reject(err);
            else 
            {
                //load ranking data into global array
                ranksArray = JSON.parse(data);
                resolve('Ranks array populated');
            }
        });
        fs.readFile('./data/blizzard.json', 'utf8', (err, data) => {
            if(err) reject(err);
            else
            {
                // console.log(data);
                let roster = JSON.parse(data);  
                for(var i = 0; i < roster.members.length; i++){
                    if(((roster.members[i].rank) % 2) == 0) {
                        rosterArray.push(roster.members[i]);
                    }
                } 
            }
        });
        fs.readFile('./data/recruitment.json', 'utf8', (err, data) => {
            if(err) reject(err);
            else 
            {
                //recruitment info
                recruitArray = JSON.parse(data);
                resolve(recruitArray);
            }
        });
        fs.readFile('./data/twitch-stream-status.json', 'utf8', (err, data) => {
            if(err) reject(err);
            else 
            {
                //streams info
                streamsArray = JSON.parse(data);
                resolve(streamsArray);
            }
        });
    });
}

//non-exported functions
function reverseObject(object) {
    var newObject = {};
    var keys = [];
    for (var key in object) {
        keys.push(key);
    }
    for (var i = keys.length - 1; i >= 0; i--) {

      var value = object[keys[i]];
      newObject[keys[i]]= value;
    }       

    return newObject;
}
//retrieves raid progress from JSON file
function getRaidProg() {
    return new Promise(function (resolve, reject) {
        newArray = {};
        newArray.raid_rankings = reverseObject(progArray.raid_rankings);
        newArray.raid_progression = reverseObject(progArray.raid_progression);

        if(newArray.length == 0) {
            reject('Array is empty.');
        }
        else {
            resolve(newArray);
        }
       console.log(newArray);
    });
}
//retrieves guild ranks from JSON file
function getGuildRanks() {
    return new Promise(function (resolve, reject) {
        if(ranksArray.length == 0) {
            reject('Array is empty.');
        }
        else {
            resolve(ranksArray);
        }
    });
}

function getRoster() {
    return new Promise(function (resolve, reject) {
        if(rosterArray.length == 0) {
            reject('Array is empty.');
        }
        else {
            resolve(rosterArray);
        }
    });
}

function getRecruitmentInfo() {
    return new Promise(function (resolve, reject) {
        if(recruitArray.length == 0) {
            reject('Array is empty.');
        }
        else {
            resolve(recruitArray);
        }
    });
}
//retrieves stream info from JSON file
//display offline list and online list when appropriate
function getStreamsInfo() {
    return new Promise(function (resolve, reject) {
        onlineArray = [];
        offlineArray = [];
        //check streams and sort them appropriately
        for(stream in streamsArray) {
            //put online streamers in an array
            if(streamsArray[stream].status === "online") {
                onlineArray.push(streamsArray[stream]);
            }
            //put offline streamers in an array
            if(streamsArray[stream].status === "offline") {
                offlineArray.push(streamsArray[stream]);
            }
        }
        //check if arrays are empty
        if(onlineArray.length == 0 && offlineArray == 0) {
            reject('No streams available.');
        }
        else {
            if(onlineArray.length > 0) resolve(onlineArray);
            else resolve(offlineArray);
        }
        console.log(offlineArray);
        console.log(onlineArray);
        
    });
}
//retrieves application from database
function getApplications() {
    return new Promise(function (resolve, reject) {
        Application.findAll({
            // where: {
            //     archived: {
            //         [Op.ne]: 0
            //     }
            // },
            order: [['id', 'DESC']]
        }).then(result => {
            resolve(result);
        }).catch(err => {
            reject("Can not find application.");
        });
    });
}
//creates application and stores in database
function createApplication(app) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Application.create({
                firstname: app.inputFirstName,
                lastname: app.inputLastName,
                age: app.inputAge,
                city: app.inputCity,
                state: app.inputState,
                email: app.inputEmail,
                battletag: app.inputBattleTag,
                class: app.classSelect,
                spec: app.inputSpec,
                armory: app.inputArmoryLink,
                timeplayed: app.inputTimePlayed,
                alt: app.altsTextArea,
                schedule: app.scheduleTextArea,
                uikeybinds: app.uiTextArea,
                logs: app.inputLogs,
                raidingexp: app.raidexpTextArea,
                references: app.inputReference,
                previousguilds: app.previousGuildsTextArea,
                reasons: app.reasonsTextArea,
                about: app.hearAboutUsTextArea,
                special: app.specialTextArea,
                color: app.inputColor,
                archived: 0
            }).then(apps => {
                if(apps) resolve(apps);
                else reject("Unable to create application.");
                console.log(apps);
            }).catch(err => {
                reject("Unable to create application.");
                console.log(err);
            });
        });
    });
}

function deleteApp(appId) {
    return new Promise(function (resole, reject) {
        sequelize.sync().then(function () {
            Application.destroy({
                where: {
                  id: appId
                }
            }).then(app => {
                resolve('Application ' + appId + ' has been deleted.');
            }).catch(err => {
                reject('Error deleting application number ' + appId);
            });
        })
    });
}

function getNews() {
    return new Promise(function (resolve, reject) {
        News.findAll({
            limit: 5,
            order: [['id', 'DESC']]
        }).then(result => {
            resolve(result);
        }).catch(err => {
            reject("Can not find news.");
        });
    });
}

function createNews(news) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            News.create({
                title: news.title,
                content: news.content,
                author: "Admin"
            }).then(news => {
                if(news) resolve(news);
                else reject("Unable to create news.");
            }).catch(err => {
                reject("Unable to create news.");
            });
        });
    });
}

function getItem() {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Items.findAll()
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject("Item not found.");
            });
        });
    });
}

function createItem(item) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Items.create({
                category: item.category,
                name: item.name,
                description: item.description,
                price: item.price,
                imagePath: item.imagePath
            }).then(items => {
                if(items) resolve(items);
                else reject("Unable to create sales item.")
            }).catch(err => {
                reject("Unable to create sales item.");
            });
        });
    });
}

function deleteItem(itemId) {
    return new Promise(function (resole, reject) {
        sequelize.sync().then(function () {
            Items.destroy({
                where: {
                  id: itemId
                }
            }).then(item => {
                resolve('Item ' + itemId + ' has been deleted.');
            }).catch(err => {
                reject('Error deleting item number ' + item);
            });
        })
    });
}

function getSalesReq() {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            SalesRequest.findAll()
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject("Sales request not found.");
            });
        });
    });
}

function createSalesReq(request) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            SalesRequest.create({
                username: request.username,
                email: request.email,
                message: request.message
            }).then(request => {
                if(request) resolve(request);
                else reject("Unable to create request.")
            }).catch(err => {
                reject("Unable to create request.");
            });
        });
    });
}

function deleteSalesReq(requestId) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            SalesRequest.destroy({
                where: {
                  id: requestId
                }
            }).then(request => {
                resolve('Request ' + requestId + ' has been deleted.');
            }).catch(err => {
                reject('Error deleting item number ' + requestId);
            });
        })
    });    
}

function getClassInfo(classId) {
    return new Promise(function (resolve, reject) {
        //array id is class id minus one
        id = classId - 1;
        if(id < 0 || id > 11) reject('Unable to find class information!');
        else {
            classArr = recruitArray.class[id];
            resolve(classArr);
        }
    });
}
//update if class or specs are recruiting
//store in JSON file once updated
function updateClassInfo(classId, classData) {
    return new Promise(function (resolve, reject) {
        id = classId - 1;
        if(id < 0 || id > 11) reject('Unable to find class information!');
        else {
            classData.recruiting = (classData.recruiting) ? "true" : "false";
            recruitArray.class[id].recruiting = classData.recruiting;
            //loop through both arrays and set the values
            for(var keyOne in classData.spec) {
                for(var keyTwo in recruitArray.class[id].spec) {
                    if(keyOne == keyTwo) { 
                        recruitArray.class[id].spec[keyTwo] = classData.spec[keyOne];

                    }
                }
            }
            resolve('Changes to the ' + recruitArray.class[id].name + ' class was successful!');

            //save data to existing json file
            fs.writeFileSync('data/recruitment.json', JSON.stringify(recruitArray, null, 4), function(err) {
                if(err) {
                    console.log(err);
                }
            });
        }
    });
}


