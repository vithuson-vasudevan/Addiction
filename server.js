//import modules
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const clientSessions = require('client-sessions');
const multer = require('multer');
const path = require('path');

//import files
//var apiService = require('./api-service.js');
var dataService = require('./data-service.js');

//set port for server to listen on
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

//set up handlebars
app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item">' +
                    '<a '  + ((url == app.locals.activeRoute) ? 'class="nav-link active"' : 'class="nav-link"')  +  
                    ' href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        formatRaid: function(raid) {
            str = raid.replace(/-/g, " ");
            str = str.toLowerCase().split(' ');
            for (var i = 0; i < str.length; i++) {
                str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
            }
            return str.join(' ');
        },
        groupRow: function(every, context, options) {
            var out = "", subcontext = [], i;
                if (context && context.length > 0) {
                    for (i = 0; i < context.length; i++) {
                        if (i > 0 && i % every === 0) {
                            out += options.fn(subcontext);
                            subcontext = [];
                        }
                        subcontext.push(context[i]);
                    }
                    out += options.fn(subcontext);
                }
            return out;
        },
        toLowerCase: function(str) {
            return str.toLowerCase();
        },
        spaceToDash: function(str) {
            str = str.replace(/-/g, ' ').toLowerCase();
            return str;
        },
        removeSpace: function(str) {
            str = str.replace(/\s/g, '').toLowerCase();
            return str;
        },
        rankName: function(num) {
            rank = ["Guild Master", "Guild Master Alt", "Officer", "Officer Alt", "Loot Council", "Loot Council Alt", "Core Raider", "Core Raider Alt", "Trial"];
            return rank[num];
        },
        numberSuffix: function(num) {
            ////Work In Progress ///
                // if (!in_array(($num % 100),array(11,12,13))){
                //   switch ($num % 10) {
                //     // Handle 1st, 2nd, 3rd
                //     case 1:  return $num +'st';
                //     case 2:  return $num + 'nd';
                //     case 3:  return $num + 'rd';
                //   }
                // }
                // return $num + 'th';
        },
        ifCheck: function(a, b, options) {
            if(a == b) 
                return options.fn(this);
            else   
                return options.inverse(this);
        },
        numberFormat: function (value, options) {
            // Helper parameters
            var dl = options.hash['decimalLength'];
            var ts = options.hash['thousandsSep'] || ',';
            var ds = options.hash['decimalSep'];
        
            // Parse to float
            var value = parseFloat(value);
        
            // The regex
            var re = '\\d(?=(\\d{3})+' + (dl > 0 ? '\\D' : '$') + ')';
        
            // Formats the number with the decimals
            var num = value.toFixed(Math.max(0, ~~dl));
        
            // Returns the formatted number
            return (ds ? num.replace('.', ds) : num).replace(new RegExp(re, 'g'), '$&' + ts);
        },
        limit: function(from, to, context, options) {
            var item = "";
            if(context.length < to) to = context.length;
            for (var i = from, j = to; i < j; i++) {
                item = item + options.fn(context[i]);
            }
            return item;
        }
    }
}));

app.set('view engine', '.hbs');

//get URL paths to highlight appropriate menu item
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});  

app.use(function(req, res, next) {
    dataService.getStreamsInfo()
    .then((data) => {
        app.locals.items = data;
    })
    .catch((err) => {
        app.locals.items = err;
    });
    next();
});

//set the middleware for urlencoded
app.use(bodyParser.urlencoded({ extended: true}));

//initialize routes
app.get('/', (req, res, next) => {
    let viewData = {};
    let errData = {};
    //store raid progression
    dataService.getRaidProg()
    .then((data) => {
        viewData.progression = data;
    })
    .catch(() => {
        viewData.progression = null;
        errData.progression = "No Progression Info Available.";
        // res.render({message: "No Progression Info Available."});
    })
    //store guild ranks
    .then(dataService.getGuildRanks)
    .then((data) => {
        viewData.ranks = data;
    })
    .catch((err) => {
        viewData.ranks = null;
        errData.ranks = "No Ranks Available";
        // res.render({message: "No Ranks Available."});
    })
    //store recruitment info
    .then(dataService.getRecruitmentInfo)
    .then((data) => {
        viewData.recruitment = data;
    })
    .catch((err) => {
        viewData.recruitment = null;
        errData.recruitment = "Recruitment Info not Available.";
        // res.render({message: "Recruitment Info not Available."});
    })
    //store news info
    .then(dataService.getNews)
    .then((data) => {
        viewData.news = data;
    })
    .catch((err) => {
        viewData.news = null;
        errData.news = "Unable to find news information.";
    })
    // //store streams info
    // .then(dataService.getStreamsInfo)
    // .then((data) => {
    //     viewData.streams = data;
    // })
    // .catch((err) => {
    //     viewData.streams = null;
    //     errData.streams = "Unable to find streams information.";
    // })
    //render the view
    .then(() => {
        res.render("index", {viewData: viewData, errData: errData, streams: app.locals.items});
    })
    .catch(() => {
        res.render("index", {errData: errData});
    });
});

app.get('/forums', (req, res, next) => {
    res.statusCode = 302;
    res.setHeader("Location", "https://www.warcraftlogs.com/guilds/471");
    res.end();
});

app.get('/roster', (req, res, next) => {
    dataService.getRoster()
    .then((data) => {
        res.render("roster", {roster: data, streams: app.locals.items});
    })
    .catch((err) => {
        res.render("roster", {message: "Roster not found."});
    });
});

app.get('/about', (req, res, next) => {
    res.render("about", {streams: app.locals.items});
});

app.get('/streams', (req, res, next) => {
    dataService.getStreamsInfo()
    .then((data) => {
        res.render("streams", {streams: data, streams: app.locals.items});    
    })
    .catch((err) => {
        res.render("streams");
    });
});

app.get('/sales', (req, res, next) => {
    dataService.getItem()
    .then((data) => {
        res.render("sales", {items: data, streams: app.locals.items});
    })
    .catch((err) => {
        res.render("sales", {message: "Items not found."});
    });
});

app.post('/sales', (req, res, next) => {
    dataService.createSalesReq(req.body)
    .then((data) => {
        res.redirect("/sales");
    })
    .catch((err) => {
        res.render("sales", {err: err});
    });
});

app.get('/gallery', (req, res, next) => {
    res.send("Gallery Page.", {streams: app.locals.items});
});

app.get('/videos', (req, res, next) => {
    res.send("Videos Page.", {streams: app.locals.items});
});

app.get('/logs', (req, res, next) => {
    res.statusCode = 302;
    res.setHeader("Location", "https://www.warcraftlogs.com/guilds/471");
    res.end();
});

app.get('/dashboard', (req, res, next) => {
    res.render("dashboard", {layout: 'admin.hbs'});
});

app.get('/news', (req, res, next) => {
    res.render("news", {layout: 'admin.hbs'});
});

app.post('/news/add', (req, res, next) => {
    dataService.createNews(req.body)
    .then((data) => {
        res.redirect("/news");
    })
    .catch((err) => {
        res.render("news", {err: err});
    });
});

app.get('/sales-items', (req, res, next) => {
    dataService.getItem()
    .then((data) => {
        res.render("sales-items", {items: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render("sales-items", {err: err, layout: 'admin.hbs'});
    });
});

app.get('/sales-items/add', (req, res, next) => {
    res.render("addSalesItem", {layout: 'admin.hbs'});
});

app.post('/sales-items/add', (req, res, next) => {
    dataService.createItem(req.body)
    .then((data) => {
        res.redirect("/sales-items");
    })
    .catch((err) => {
        res.render("addSalesItem", {err: err, layout: 'admin.hbs'});
    });
});

app.get('/sales-items/delete/:itemId', (req, res, next) => {
    dataService.deleteItem(req.params.itemId)
    .then((data) => {
        res.redirect("/sales-items");
    })
    .catch((err) => {
        res.redirect("/sales-items");
    });
});

app.get('/sales-request', (req, res, next) => {
    dataService.getSalesReq()
    .then((data) => {
        res.render("sales-request", {request: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render("sales-request", {err: err, layout: 'admin.hbs'});
    });
})

app.get('/sales-request/delete/:requestId', (req, res, next) => {
    dataService.deleteSalesReq(req.params.requestId)
    .then((data) => {
        res.redirect('/sales-request');
    })
    .catch((err) => {
        res.redirect('/sales-request');
    });
})

app.get('/recruitment', (req, res, next) => {
    dataService.getRecruitmentInfo()
    .then((data) => {
        res.render("adminRecruitment", {recruitment: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render("adminRecruitment", {err: err, layout: 'admin.hbs'});
    });
});

app.get('/recruitment/:classNum', (req, res, next) => {
    dataService.getClassInfo(req.params.classNum)
    .then((data) => {
        res.render("adminClassRecruitment", {class: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render("adminClassRecruitment", {err: err, layout: 'admin.hbs'});
    });
});

app.post('/recruitment/:classNum', (req, res, next) => {
    dataService.updateClassInfo(req.params.classNum, req.body)
    .then((data) => {
        res.render("adminRecruitment", {success: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render('adminRecruitment', {err: err, layout: 'admin.hbs'});
    });
});

app.get('/addaccount', (req, res, next) => {
    res.render('addaccount', {layout: 'admin.hbs'});
});

app.get('/applications', (req, res, next) => {
    dataService.getApplications()
    .then((data) => {
        res.render('applications', {apps: data, layout: 'admin.hbs'});
    })
    .catch((err) => {
        res.render('applications', {err: err, layout: 'admin.hbs'});
    });
});

app.post('/submit-app', (req, res, next) => {
    dataService.createApplication(req.body)
    .then((data) => {
        res.redirect("/");
    })
    .catch((err) => {
        res.redirect("/");
        alert("Your application has been successfully submitted.");
    });    
});

app.get('/login', (req, res, next) => {
    res.render("login", {layout: false});
});

//app.listen(HTTP_PORT);
dataService.initialize().then(() => {
    app.listen(HTTP_PORT);
    console.log("Server listening on port: " + HTTP_PORT);
}).catch((err) => {
    console.log("Error: " + err);
});



