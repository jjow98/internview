/*---------------------------------------------------------------------------*/
/* server.js                                                                 */
/* Author: Jonathan Jow                                                      */
/*---------------------------------------------------------------------------*/

const PORT = process.env.PORT || 3001;
var HOST = '';
if (PORT == 3001) { HOST = 'http://localhost:' + PORT }
else { HOST = 'http://internview.herokuapp.com' }

const CASURL = 'https://fed.princeton.edu/cas';

var express = require('express');
var cors = require('cors');
var app = express();
var http = require('http');
var request = require('request');
var querystring = require('querystring');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
var sanitize = require('mongo-sanitize'); // sanitize mongo inputs
var url = process.env.MONGOLAB_URI;
var connection; // will store mongo connection
var db; // will store mongo database
var session = require('express-session');
var CentralAuthenticationService = require('cas');
var swearjar = require('swearjar'); // profanity checker
var lngDetector = new (require('languagedetect'));
var geocoder = require('google-geocoder');
var geo = geocoder({
  key: process.env.GOOGLE_API_KEY
});
var fs = require('fs'); // for reading in files
app.use(bodyParser.json()); // for parsing json
app.use(bodyParser.urlencoded({ extended: true }));

// initialize Session for use with CAS
app.use(session({
    secret: 'super secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false
    }
}));

// Create the database connection
MongoClient.connect(url, {poolSize: 10},function(err, dbo) {
  if (err) {
    console.log(err);
    return;
  } else {
    connection = dbo;
    db = connection.db('internview');
  }
});

var yearDict = {}; // {netid: year}
var nameDict = {}; // {netid: full name}

// read the netid/years into a dict
var allNames = fs.readFileSync(path.join(__dirname + '/scraper/allNames')).toString('utf8');
function parseNames(allNames) {
  var lines = allNames.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var entry = lines[i].trim().split(', ');
    if (entry[0].length == 0) continue;
    yearDict[entry[1]] = entry[2];
    nameDict[entry[1]] = entry[0];
  }
}
parseNames(allNames);

//================================================================================
//                                    Serving Routes
//================================================================================

app.use('/style', express.static(__dirname + '/client/public/style'));

// serve the home page
app.get('/', function(req, res) {
  // check whether the user sending this request is authenticated
  if (!(typeof (req.session.cas) !== 'undefined')) {
    // the user in unauthenticated. Redirect to homepage.
    res.sendFile(path.join(__dirname + '/client/public/splash.html'));
  } else {
    // create new user if first login
    createUser(req.session.cas.netid, function() {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      res.sendFile(path.join(__dirname + '/client/build/index.html'));
    });
  }
});

// serve the main page
app.get('/index.html', function(req, res) {
  // check whether the user sending this request is authenticated
  if (!(typeof (req.session.cas) !== 'undefined')) {
    // the user in unauthenticated. Redirect to CAS Authentication.
    res.redirect(CASURL + '/login?service=' + HOST + '/verify');
  } else {
    // create new user if first login
    createUser(req.session.cas.netid, function() {
      // prevent caching so that app cannot be reached via back button if unauthenticated
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      res.sendFile(path.join(__dirname + '/client/build/index.html'));
    });
  }
});

// serve the info page
app.get('/info.html', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/public/info.html'));
});

// serve the design document
app.get('/design.pdf', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/public/DesignDocument.pdf'));
});

// serve the design document
app.get('/design', function(req, res) {
  res.sendFile(path.join(__dirname + '/DesignDocument.pdf'));
});

// use static build
app.use(express.static('client/build'));

//================================================================================
//                               CAS Authentication
//================================================================================

// instantiate CAS Authentication middleware
var cas = new CentralAuthenticationService({
  base_url: CASURL,
  service: HOST + '/verify'
});

// to prevent Cross-Origin Resource Sharing errors
app.use(cors());

// create new user, if necessary
function createUser(netid, done) {
  // query the database for user that matches netid stored in session
  db.collection('users').find({'netid' : netid}).toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    } else {

      // first time logging in, add new user to database
      if (result.length == 0) {
        var newUser = {};
        newUser['netid'] = netid;
        // we set "2000" for users who we don't have graduation year for (non-undergraduates)
        // assumption is that these users often have internship experience already (e.g. grad students)
        newUser['classYear'] = yearDict[netid] ? yearDict[netid] : '2000';
        newUser['firstLogin'] = new Date(); // set firstLogin to today
        newUser['surveyCompleted'] = false;
        newUser['favoriteCompanies'] = [];
        newUser['recentSearches'] = [];
        newUser['upvoted'] = [];
        newUser['downvoted'] = [];

        // insert new user into user db
        db.collection('users').insertOne(newUser, function(err, db) {
          if (err) {
            console.log('Error inserting entry into database!');
            return;
          }
          done();
        });
      } else {
        done();
      }
    }
  });
}

// verify that a user's login is legitimate
app.get('/verify', function(req, res) {
  let redirectDestination = HOST + '/index.html'; // main page

  // if the user already has a session, send them to the app
  if (req.session.cas) {
    createUser(req.session.cas.netid, function() { // create new user if necessary
      res.redirect(redirectDestination);
    });
    return;
  }

  var ticket = req.query.ticket; // CAS ticket

  // if the user does not have a ticket, send them to the home page (splash)
  if (typeof (ticket) === 'undefined') {
    res.redirect(HOST);
    return;
  }

  // validate the user's ticket
  cas.validate(ticket, function(err, status, netid) {
    if (err) {
      console.log(err);
      res.sendStatus(500); // generic error
      return;
    }

    // save the user's CAS data into a new session
    req.session.cas = {
      status: status,
      netid: netid
    };
    req.session.save();

    // create a new user, if necessary, then redirect to app
    createUser(netid, function() {
      res.redirect(redirectDestination);
    });
  });
});

// redirect to CAS login on login request
app.get('/login', function(req, res) {
  res.redirect(CASURL + '/login?service=' + HOST + '/verify');
});

// redirect to CAS logout on logout request
app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect(CASURL + '/logout?url=' + HOST);
});

// serve a 404 page for any other GET request
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/public/404.html'));
});

//================================================================================
//                               Database Queries
//================================================================================

// escape regex special characters
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

// check if a dict is empty
function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

// for search requests
app.post('/search', function(req, res) {
  // parse query, ANDing together ORs
  var and = [];
  for (var key in req.body) {
    // if query field empty, continue
    if (req.body[key].length == 0) {
      continue;
    }
    // split around "|", since multiple inputs given in this format
    // e.g. "COS|MAT" should be parsed as "COS" OR "MAT"
    var words = sanitize(req.body[key]).trim().split('|');
    var conditions = {};
    var or = [];
    for (var i = 0; i < words.length; i++) {
      var condition = {};
      // case-insensitive query
      condition[key] = new RegExp('^' + escapeRegExp(words[i]), 'i');
      or.push(condition);
    }
    conditions['$or'] = or;
    and.push(conditions);
  }
    var query = {};
    if (and.length != 0) {
      query['$and'] = and;
    }

    if (!isEmpty(query)) {
      // query database, sorting by popularity
      db.collection('info').find(query).sort({'voteCount' : -1}).toArray(function(err, result) {
          if (err) {
            console.log(err);
            return;
          }
          // if no results, no corresponding click counts either
          if (result.length == 0) {
            res.send({'clicks' : [], 'results' : []});

          // otherwise, get click counts for all companies in results
          } else {
            var unique = [];
            var clickQuery = [];
            for (var i = 0; i < result.length; i++) {
              if (!unique.includes(result[i]['companyName'])) {
                unique.push(result[i]['companyName']);
                clickQuery.push({'companyName': result[i]['companyName']});
              }
            }

            // query for click counts
            db.collection('companies').find({'$or' : clickQuery}).sort({'totalClicks' : -1})
            .toArray(function(err, clicks) {
              res.send({'clicks' : clicks, 'results' : result});
            });
          }
      });
    // if empty search, return nothing
    } else {
      res.send({'clicks' : [], 'results' : []});
    }
});

// requests for all entries in the database
app.post('/getAllEntries', function(req, res) {
  // query for all entries, sorting by popularity
  db.collection('info').find().sort({'voteCount' : -1}).toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }

    // if no results, no corresopnding click counts either
    if (result.length == 0) {
      res.send({'clicks' : [], 'results' : []});

    // otherwise, get click counts for all companies in result
    } else {
      var unique = [];
      var clickQuery = [];
      for (var i = 0; i < result.length; i++) {
        if (!unique.includes(result[i]['companyName'])) {
          unique.push(result[i]['companyName']);
          clickQuery.push({'companyName': result[i]['companyName']});
        }
      }

      // query for click counts
      db.collection('companies').find({'$or' : clickQuery}).sort({'totalClicks' : -1})
      .toArray(function(err, clicks) {
        res.send({'clicks' : clicks, 'results' : result});
      });
    }
  });
});

// for autocomplete requests
app.post('/autocomplete', function(req, res) {
  // parse query
  var conditions = {};
  var fields = {};
  for (var key in req.body) {
    // if query field empty, continue
    if (req.body[key].length == 0) {
      continue;
    }
    var condition = {};
    var or = [];
    // escape regex special characters in input, case insensitive search
    condition[key] = new RegExp('^' + escapeRegExp(sanitize(req.body[key]).trim()), 'i');
    or.push(condition);
    conditions['$or'] = or;
    // include only the specific field being searched for in the result
    fields[key] = 1;
  }

  // exclude the db unique id, not necessary for autocomplete
  fields['_id'] = 0;

  if (isEmpty(conditions)) {
    // if empty search, send no results
    res.send([]);
  } else {
    // query database
    db.collection('info').find(conditions).project(fields).toArray(function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      // return the first 5 results
      ac = [];
      let bool = false;
      for (var i = 0; i < result.length; i++) {
        for (var key in result[i]) {
          if (!ac.includes(result[i][key])) {
            ac.push(result[i][key]);
            if (ac.length == 5) {
              bool = true;
              break;
            }
          }
        }
        if (bool) break;
      }
        res.send(ac);
      });
  }
});

// request to check if survey should be displayed for current user
app.post('/userSurvey', function(req, res) {
  // query the database for the logged in user
  db.collection('users').find({'netid' : req.session.cas.netid}).toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }

    // there should only be one user with a given netid, so 0th result is the user
    var user = result[0];
    if (user['surveyCompleted'] || user['classYear'] == '2021') {
      // authenticated if survey completed or current freshman
      res.send({res: 'no'});
    } else {
      const WAIT_TIME = new Date(1209600000); // 2 weeks
      var valid = user['firstLogin'].getTime() + WAIT_TIME.getTime();
      if (new Date() - new Date(valid) > 0) {
        // authenticated if at least 2 weeks since first login
        res.send({res: 'no'});
      } else {
        // display survey with amount of time left to wait
        timeleft = new Date(valid).getTime() - new Date().getTime();
        res.send({res: timeleft});
      }
    }
  });
});

// request to validate user's survey submission
app.post('/survey', function(req, res) {
  // find the latitude/longitude of input location
  geo.find(req.body.location, function(err, loc) {
    if (err) {
      console.log(err);
    }
    var text = '';
    var prof = '';
    // concatenate the longer fields and check if they are mostly english
    for (var key in req.body) {
      if (key == 'positionName' || key == 'questions' || key == 'howDidYouPrepare'
        || key == 'recommendations' || key == 'averageDay' || key == 'overallExperience'
        || key == 'advice') { // fields to check
        text += req.body[key] + ' ';
      }
      prof += req.body[key] + ' '; // concatenate all fields to check for profanity
    }

    // profanity check
    if (swearjar.profane(prof)) {
      res.send({res: 'false'});
      return;
    }

    // check response is mostly english
    var lang = lngDetector.detect(text);
    for (var i = 0; i < lang.length; i++) {
      if (lang[i][0] == 'english') {
        if (lang[i][1] < 0.15) {
          res.send({res: 'false'});
          return;
        } else {
          break;
        }
      }
    }

    // if google maps api cannot find location, set it to be empty
    if (typeof loc == 'undefined' || loc.length == 0) {
      req.body['coordinates'] = {'lat' : '', 'lng' : ''};
    } else {
      req.body['coordinates'] = loc[0]['location'];
    }
    // new entries start at 0 upvotes/downvotes
    req.body['voteCount'] = 0;
    db.collection('info').insertOne(req.body);

    // update current user's surveyCompleted field
    var userQuery = { 'netid' : req.session.cas.netid };
    var update = { 'surveyCompleted' : true };
    db.collection('users').update(userQuery, {$set: update});

    // valid submission
    res.send({res: 'true'});
  });
});


// request for entry data to populate the map
app.post('/mapData', function(req, res) {
  // query all entries, including just companyName, positionName, location, and coordinates
  db.collection('info').find().project({'companyName' : 1, 'positionName' : 1,
    'location' : 1, 'coordinates' : 1})
  .toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.send(result);
  });
});

// request to display popular companies
app.post('/popularCompanies', function(req, res) {
  // query companies by popularity
  db.collection('companies').find().sort({ totalClicks: -1 }).project({'_id' : 0, 'totalClicks' : 0})
  .toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    or = [];
    cmp = [];
      // 10 most popular companies
      for (var i = 0; i < 10; i++) {
        or.push(result[i]);
        cmp.push(result[i]['companyName']);
      }
      // query for these 10 companies, descending order by their upvote/downvote difference
      db.collection('info').find({'$or': or}).sort({'voteCount' : -1}).toArray(function(err, popular) {
        if (err) {
          console.log(err);
          return;
        }
        // sort entries by the popularity of their associated companies
        sorted = popular.sort(function(a, b) {return cmp.indexOf(a.companyName) - cmp.indexOf(b.companyName);});
        res.send(sorted);
    });
  });
});

// request to increment the click count of a company
app.post('/totalClick', function(req, res) {
  // increment the company's click count
  db.collection('companies').update({'companyName' : req.body.companyName},
    {$inc: {'totalClicks' : 1}});
  res.send('true');
});

// request to update an entry's vote count
app.post('/voteCount', function(req, res) {
  db.collection('info').update({'_id' : new ObjectID(req.body._id)},
    {$inc: {'voteCount' : req.body.voteCount}});
  res.send('true');
});

// request to update a user's recent searches
app.post('/recentSearches', function(req, res) {
  // remove entry if it exists
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'recentSearches' : req.body.companyName}});
  // add new entry, cap list size at 10
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$push: {'recentSearches' : {
      $each: [req.body.companyName],
      $slice: -10}}});
  res.send('true');
});

// request to add a new favorite company from a user
app.post('/favoriteCompanies', function(req, res) {
  // remove entry if it exists, should never happen
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'favoriteCompanies' : req.body.companyName}});
  // add new entry, cap list size at 10
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$push: {'favoriteCompanies' : {
      $each: [req.body.companyName],
      $slice: -10}}});
  res.send('true');
});

// request to remove a favorite company from a user
app.post('/favoriteCompaniesRemove', function(req, res) {
  // remove entry if it exists
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'favoriteCompanies' : req.body.companyName}});
  res.send('true');
});

// request to add an entry to the list of entries a user has upvoted
app.post('/upvote', function(req, res) {
  // remove entry if it exists, should never happen
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'upvoted' : req.body._id}});
  // add entry to array
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$push: {'upvoted' : req.body._id}});
  res.send('true');
});

// request to remove an entry from the list of entries a user has upvoted
app.post('/upvoteRemove', function(req, res) {
  // remove entry if it exists
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'upvoted' : req.body._id}});
  res.send('true');
});

// request to add an entry to the list of entries a user has downvoted
app.post('/downvote', function(req, res) {
  // remove entry if it exists, should never happen
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'downvoted' : req.body._id}});
  // add entry to array
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$push: {'downvoted' : req.body._id}});
  res.send('true');
});

// request to remove an entry from the list of entries a user has downvoted
app.post('/downvoteRemove', function(req, res) {
  // remove entry if it exists
  db.collection('users').update({'netid' : req.session.cas.netid},
    {$pull: {'downvoted' : req.body._id}});
  res.send('true');
});

// request to retrieve the vote counts for entries associated with a company
app.post('/retrieveVoteCount', function(req, res) {
  // query the info database by companyName, return only the voteCount field and entry id
  db.collection('info').find({'companyName': req.body.companyName}).project({'voteCount': 1})
  .toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      // associate each entry with its vote count
      final = {};
      for (var i = 0; i < result.length; i++) {
        final[result[i]['_id']] = result[i]['voteCount'];
      }
      res.send(final);
    }
  });
});

// retrieve the entries that a user has upvoted or downvoted
app.post('/retrieveUserVotes', function(req, res) {
  // query the user database, return only the upvoted/downvoted arrays of the user
  db.collection('users').find({'netid' : req.session.cas.netid})
  .project({'_id': 0, 'upvoted': 1, 'downvoted': 1}).toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      res.send(result);
    }
  });
});

// helper function to convert an array of companyNames to a valid MongoDB query
function companyNameToOr(arr) {
  let or = [];
  for (let i = 0; i < arr.length; i++) {
    or.push({'companyName' : arr[i]});
  }
  return or;
}

// request for user's personalized information upon page load
app.post('/getUserInfo', function(req, res) {
  // find user's favorite companies and recent searches
  db.collection('users').find({'netid' : req.session.cas.netid})
  .project({'netid': 1, 'favoriteCompanies': 1, 'recentSearches': 1})
  .toArray(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    // reverse arrays, since most recently viewed/favorited should be first
    var fav = result[0]['favoriteCompanies'].reverse();
    var rec = result[0]['recentSearches'].reverse();
    // get the first name of the user, use their netid if name can't be found
    var name = nameDict[req.session.cas.netid];
    if (typeof name !== 'undefined') {
      result[0]['netid'] = name.split(' ')[0];
    }
    // if no favorites or recents, return empty arrays
    if (fav.length == 0 && rec.length == 0) {
      result[0]['favoriteCompanies'] = [];
      result[0]['recentSearches'] = [];
      res.send(result);
    // if no favorites, query only for entries associated with recently viewed companies
    } else if (fav.length == 0) {
        db.collection('info').find({'$or': companyNameToOr(rec)}).toArray(function(err, recents) {
        if (err) {
          console.log(err);
          return;
        }
        // sort entries by the popularity of their associated company
        recSorted = recents.sort(function(a, b) {return rec.indexOf(a.companyName) - rec.indexOf(b.companyName);});
        result[0]['recentSearches'] = recSorted;
        result[0]['favoriteCompanies'] = [];
        res.send(result);
      });
    // if no recents, query only for entries associated with favorited companies
    } else if (rec.length == 0) {
        db.collection('info').find({'$or': companyNameToOr(fav)}).toArray(function(err, favorites) {
        if (err) {
          console.log(err);
          return;
        }
        // sort entries by popularity of their associated company
        favSorted = favorites.sort(function(a, b) {return fav.indexOf(a.companyName) - fav.indexOf(b.companyName);});
        result[0]['favoriteCompanies'] = favSorted;
        result[0]['recentSearches'] = [];
        res.send(result);
      });
    // query database for entries associated with favorite companies
    } else {
        db.collection('info').find({'$or': companyNameToOr(fav)}).toArray(function(err, favorites) {
          if (err) {
            console.log(err);
            return;
          }
          // query database for entries associated with recent searches
          db.collection('info').find({'$or': companyNameToOr(rec)}).toArray(function(err, recents) {
            if (err) {
              console.log(err);
              return;
            }
            // sort both arrays of entries by the popularity of their associated companies
            favSorted = favorites.sort(function(a, b) {return fav.indexOf(a.companyName) - fav.indexOf(b.companyName);});
            recSorted = recents.sort(function(a, b) {return rec.indexOf(a.companyName) - rec.indexOf(b.companyName);});
            result[0]['favoriteCompanies'] = favSorted;
            result[0]['recentSearches'] = recSorted;
            res.send(result);
        });
      });
    }
  });
});

// request for an entry's related positions
app.post('/related', function(req, res) {
  // query for other positions with the same related field that aren't from the same company
  db.collection('info').find({$and: [{'relatedField' : req.body.relatedField},
    {'companyName' : {$ne: req.body.companyName}}]}).toArray(function(err, result) {
      if (err) {
        console.log(err);
        return;
      } else {
        let final = [];
        // if no results, send no results;
        if (result.length == 0) {
          final.push('');
          final.push('');
          res.send(final);
          return;
        }
        // choose a random result
        var rand1 = Math.floor(Math.random() * result.length);
        // ensure both results are not from the same company
        var remaining = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i]['companyName'] != result[rand1]['companyName']) {
            remaining.push(result[i]);
          }
        }
        // if no other companies, send just one result
        if (remaining.length == 0) {
          final.push(result[rand1]);
          final.push('');
          res.send(final);
          return;
        } else {
        // send a random result from the remaining companies
          var rand2 = Math.floor(Math.random() * remaining.length);
          final.push(result[rand1]);
          final.push(remaining[rand2]);
          res.send(final);
          return;
        }
      }
    });
});

// listens for connections
app.listen(PORT, function() {
  console.log('Listening on port ' + PORT + '!');
});