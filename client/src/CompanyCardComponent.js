/* Written by Jason Xu
Creates each individual company card that is rendered after receiving search results
Given parameters: 
- a data array, which contains all entries that fit the search query
- an index, which says which array index to look for each specific company
- an upvote indicator, if the user has upvoted the company

The company card component must split up each individual position, as well as
have a button for an all positions option. Returned inside a ReactList

NOTE: The most complicated part of the code is how I choose to handle the 
"All Positions" button and the separate positions button.

State Variables important for the separate positions methods: 
pos - contains all company data in an array, separated by position title
posArr - array of position titles
openPosIndex - index that represents which posArr is being referenced, -1 if not clicked
  or in the "All Positions" dialog
*/

import React, {Component} from 'react';
import {Card, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import {Tab, Tabs} from 'material-ui/Tabs';
import RaisedButton from "material-ui/RaisedButton";
import Paper from "material-ui/Paper";
import ReactList from 'react-list';
import Chip from "material-ui/Chip"
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from 'material-ui/IconButton';
import myMuiTheme from './myMuiTheme';
import FontIcon from 'material-ui/FontIcon';
import Snackbar from 'material-ui/Snackbar';
import {Doughnut, HorizontalBar} from 'react-chartjs-2';
import {Grid, Row, Col, Label} from 'react-bootstrap';
import Divider from 'material-ui/Divider';
import {List, ListItem} from 'material-ui/List';
import ContentSend from 'material-ui/svg-icons/content/send';

// function that returns color depending on the average score of the company
function colorAt(score) {
  if (score > 4.5)
    // to deeper green #2e7d32 hsl(123, 46%, 34%)
    return hsllg(122,39,49, 123,46,34, 4.5,5,score)
  if (score > 4.0)
    // to brighter green #4caf50 hsl(122, 39%, 49%)
    return hsllg(88,50,53, 122,39,49, 4,4.5,score)
  if (score > 3.5)
    // to lighter green #8bc34a hsl(88, 50%, 53%)
    return hsllg(64,61,51, 88,50,53, 3.5,4,score)
  else if (score > 3.0)
    // to olive #c6cf37 hsl(64, 61%, 51%)
    return hsllg(45,100,58, 64,61,51, 3,3.5,score)
  else if (score > 2.5)
    // to yellow #ffca28 hsl(45, 100%, 58%)
    return hsllg(36,100,47, 45,100,58, 2.5,3,score)
  else if (score > 2.0)
    // to orange #ef9100 hsl(36, 100%, 47%)
    return hsllg(2,64,58, 36,100,47, 2,2.5,score)
  else if (score > 1.5)
    // to brighter red #d9534f hsl(2, 64%, 58%)
    return hsllg(14,88,40, 2,64,58, 1.5,2,score)
  else
    // deeper red #bf360c hsl(14, 88%, 40%)
    return '#bf360c'
}

// linear interpolation of hsl at x given (h1, s1%, l1%) at x1 and (h2, s2%, l2%) at x2
function hsllg(h1,s1,l1, h2,s2,l2, x1,x2,x) {
  var h = h1 + (h2-h1)/(x2-x1)*(x-x1)
  var s = s1 + (s2-s1)/(x2-x1)*(x-x1)
  var l = l1 + (l2-l1)/(x2-x1)*(x-x1)

  return 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
}

// Pie chart colors that are associated with the majors
const majorColors = {"AAS":"#6660d6","AFS":"#86f7f9","AMS":"#0c409b",
"ANT":"#004475","AOS":"#2d64c4","APC":"#03707a","ARA":"#3667c9",
"ARC":"#1a9be0","ART":"#1e3ad8","AST":"#0534c1","ATL":"#2b23ff",
"BCS":"#bfaaf7","CBE":"#4cffff","CEE":"#4e54d8","CGS":"#9a96f7",
"CHI":"#b9edf7","CHM":"#6ae0e2","CHV":"#ada4e8","CLA":"#769aed",
"CLG":"#2828ed","COM":"#458ead","COS":"#0963a3","CTL":"#b8caf9",
"CWR":"#190384","CZE":"#2e72a5","DAN":"#8f92ea","EAS":"#9ccced",
"ECO":"#664ed3","ECS":"#4766d8","EEB":"#293ce5","EGR":"#bdd9f9",
"ELE":"#9cbcfc","ENE":"#6385ff","ENG":"#9985db","ENT":"#0a02ed",
"ENV":"#8f8fea","EPS":"#8f94e8","FIN":"#422ba8","FRE":"#1b4982",
"FRS":"#6762c1","GEO":"#4968af","GER":"#0a1e75","GHP":"#8d94dd",
"GLS":"#0059b2","GSS":"#83d6fc","HEB":"#287da8","HIN":"#2a59b7",
"HIS":"#58a2b7","HLS":"#a0e1ff","HOS":"#00dcf4","HPD":"#00b3ef",
"HUM":"#010b7f","Independent":"#ccccff","ISC":"#4669ea","ITA":"#6a92c4",
"JDS":"#317f8e","JPN":"#9893f9","JRN":"#afd2f7","KOR":"#5d6dc1","LAO":"#4c2aa3",
"LAS":"#917ccc","LAT":"#144fff","LCA":"#55c4d1","LIN":"#8674fc","MAE":"#2143a0",
"MAT":"#81e2e2","MED":"#297de5","MOD":"#007789","MOG":"#217e9e","MOL":"#035f99",
"MSE":"#3e22f7","MTD":"#24116b","MUS":"#3663a5","NES":"#a2b7f2","NEU":"#043b68",
"ORF":"#7777dd","PAW":"#81a1d1","PER":"#7e84f7","PHI":"#371e89","PHY":"#6f98ce",
"PLS":"#70eaea","POL":"#6db2c6","POP":"#634cc9","POR":"#0d307c","PSY":"#a7cfe8",
"QCB":"#58a4d3","REL":"#9db6e0","RES":"#340f9b","RUS":"#2f1d7a","SAN":"#878adb",
"SAS":"#c0b8f2","SLA":"#62c2c9","SML":"#076584","SOC":"#78add3","SPA":"#559db5",
"STC":"#cac4ff","SWA":"#60ced6","THR":"#215ca5","TPP":"#ccd7ff","TRA":"#d0ccff",
"TUR":"#959ae5","TWI":"#c7f8fc","URB":"#032bad","URD":"#b5ccfc","VIS":"#196a75",
"WRI":"#28abe2","WWS":"#849ee0"};

// Colors associated with each year for bar chart
const yearColors = {"Before freshman year":"#6f98ce", "After freshman year":"#6660d6",
"After sophomore year":"#a7cfe8","After junior year":"#bfccfc"}

// Styling of a dialog box
const customContentStyle = {
  width: '95%',
  maxWidth: 'none',
}

// Company Card Component, rendered in a react list
class CompanyCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state ={
      ind: 0, // index that shows which review in data array to look at
      open: false, // opening of dialog box status for "All Positions"

      pos: {}, // dictionary with positionName and all data
      posArr: [], // list of positions
      openPosIndex: -1, // shows which index of position is open, if -1, none

      favorite: this.props.favorite, // boolean whether company is favorited
      favOpen: false, // determines the snackbar state

      // for upvoted downvoted
      upvotedReviews: [], // array of upvoted reviews
      downvotedReviews: [], // array of downvoted reviews
      voteCount: [], // the counts of each entry in the company card
      voteCountID: -1, // the index of the entry in the votecount array
      upClick: false, // the current upvote state of the index
      downClick: false, // the current downvote state of the index

      // for the pie chart
      doughnutMajor: {},
      histYear: {},
      metrics: false,

      // average star rating
      avgRate: 0,

      // related
      relatedLabelOne: '',
      relatedLabelTwo: '',
      relatedData: [],
    };


    var ratingTotal = 0; // total star rating

    const res = this.props.data[this.props.index].results // the company results array
    var majorCount = {}; // major counting dict
    var yearCount = {"Before freshman year":0, "After freshman year":0, 
          "After sophomore year":0, "After junior year":0}

    // Counting the different position names
    // keeping track of ratings, year count, major count
    for (var i = 0; i < res.length; i++)
    {
      // calculating the total rating
      ratingTotal += res[i].rating;

      // creating the different positionnames
      if (!this.state.posArr.includes(res[i].positionName))
        this.state.posArr.push(res[i].positionName);

      // counting the majors of each position
      if (!(res[i].major in majorCount))
        majorCount[res[i].major] = 1;
      else 
        majorCount[res[i].major]++;

      // incrementing the year count
      yearCount[res[i].year]++;
    }

    // setting the average rating
    this.state.avgRate = ratingTotal/res.length

    // setting pos with position name and empty array 
    for (i = 0; i < this.state.posArr.length; i++)
    {
      // splitting by position name
      var posData = res.filter(r => r.positionName === this.state.posArr[i])
      this.state.pos[this.state.posArr[i]] = posData;
    }

    // creating the data object for major pie chart
    var majorCountKey = Object.keys(majorCount);
    var majorLabel = []
    var majorData = []
    var majorColor = []

    for (i = 0; i < majorCountKey.length; i++)
    {
      majorLabel.push(majorCountKey[i])
      majorData.push(majorCount[majorCountKey[i]]);
      majorColor.push(majorColors[majorCountKey[i]])
    }

    // creating the data object for year histogram
    var yearCountKey = Object.keys(yearColors);
    var yearData = []

    for (i = 0; i < yearCountKey.length; i++)
      yearData.push(yearCount[yearCountKey[i]]);


    var dataYearHist = {
      labels: Object.keys(yearColors),
      datasets: [{
        label: "Year distribution",
        backgroundColor: ['rgba(29, 233, 182, 1)',
          'rgba(129, 212, 250, 1)', 'rgba(55,71,79,1)',
          'rgba(63,81,181,1)'],
        borderColor: ['rgba(29, 233, 182, 1)',
          'rgba(129, 212, 250, 1)', 'rgba(55,71,79,1)',
          'rgba(63,81,181,1)'],
        borderWidth: 1,
        hoverBackgroundColor: ['rgba(29, 233, 182, 1)',
          'rgba(129, 212, 250, 1)', 'rgba(55,71,79,1)',
          'rgba(63,81,181,1)'],
        hoverBorderColor: ['rgba(29, 233, 182, 1)',
          'rgba(129, 212, 250, 1)', 'rgba(55,71,79,1)',
          'rgba(63,81,181,1)'],
        data: yearData
      }]
    }

    var dataMajorDoughnut = {
      labels: majorLabel,
      datasets: [{
        data: majorData,
        backgroundColor: majorColor,
        hoverBackgroundColor: majorColor
      }]
    }

    this.state.doughnutMajor = dataMajorDoughnut;
    this.state.histYear = dataYearHist;
    this.renderEntry = this.renderEntry.bind(this);
    this.renderEachPos = this.renderEachPos.bind(this);
    this.handleChangePos = this.handleChangePos.bind(this);
    this.handleMetricsClick = this.handleMetricsClick.bind(this);
  }
  

  /*
    When the "All Positions" dialog is to be opened or closed. If it is about to
    be opened, change the state and fetch the user upvoted reviews for that specific company,
    update the click count and recent company list, as well as retrieve the vote count per entry.
    Also gets the related companies data

    If the dialog is to be closed, change the state and set the related company labels to null

    In both cases: send clicked data back to Component.js, change openPosIndex to -1, ind to 0.
  */
  handleChangeAll = () => {
    // if about to be opened
    if (!this.state.open)
    {
      // retrieving the user votes from back end
      const json = {"companyName": this.props.data[this.props.index].companyName};
      var upvotedReviews = [];
      var downvotedReviews = [];
      fetch("/retrieveUserVotes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          var upvotedReviewsAll;
          var downvotedReviewsAll;
          upvotedReviewsAll = data[0].upvoted;
          downvotedReviewsAll = data[0].downvoted;

          // accumulating all the upvoted and downvoted reviews for the specific company
          for (var j = 0; j < this.props.data[this.props.index].results.length; j++) {
            if (upvotedReviewsAll.includes(this.props.data[this.props.index].results[j]._id)) 
              upvotedReviews.push(this.props.data[this.props.index].results[j]._id);

            if (downvotedReviewsAll.includes(this.props.data[this.props.index].results[j]._id)) 
              downvotedReviews.push(this.props.data[this.props.index].results[j]._id);
          }

          this.setState({upvotedReviews: upvotedReviews});
          this.setState({downvotedReviews: downvotedReviews});

          // setting current state of the upvote or downvote of each review
          var up = upvotedReviews.includes(this.props.data[this.props.index].results[0]._id)
          var down = downvotedReviews.includes(this.props.data[this.props.index].results[0]._id)

          this.setState({upClick: up});
          this.setState({downClick: down})
          this.setState({voteCountID: this.props.data[this.props.index].results[0]._id})
        });

      // updating the total click count of a looked at company
      fetch("/totalClick", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("totalClick request error");
        })
        .catch((error) => {
          console.error(error);
        });

      // updating the most recent looked at searches
      fetch("/recentSearches", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("recentSearches request error");
        })
        .catch((error) => {
          console.error(error);
        });

      // retrieving the specific vote count for all of the reviews in a company
      fetch("/retrieveVoteCount", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          this.setState({voteCount: data}, () => this.setState({open: !this.state.open}));
        })
        .catch((error) => {
          console.error(error);
        });

      // getting the related companies
      const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.props.data[this.props.index].results[0].relatedField}; // needs to be based on posIndex
      var labelOne = "";
      var labelTwo = "";
      fetch("/related", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;

          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
        })
        .catch((error) => {
          console.error(error);
        });
    }
    else
    {
      this.setState({relatedLabelOne: ''})
      this.setState({relatedLabelTwo: ''})
    }

    // changing the state of the open boolean
    var open = !this.state.open;
    this.setState({openPosIndex: -1});
    this.setState({ind: 0});

    if (!open) 
    {
      var clickInfo = [this.props.mode, this.props.index];
      this.setState({open: open}, () => this.props.sendClickedResult(clickInfo));
    }
  }
  

  /*
    When in the "All Positions" dialog and the next button is selected, get the new upvote/downvote states,
    change the index and vote count in the state array. Also fetch the new related companies label
  */
  handleNextAll = () =>{
    // incrementing the ind variable
    var newInd = ((this.state.ind + 1)% this.props.data[this.props.index].results.length);
    this.setState({upClick: this.state.upvotedReviews.includes(this.props.data[this.props.index].results[newInd]._id)})
    this.setState({downClick: this.state.downvotedReviews.includes(this.props.data[this.props.index].results[newInd]._id)})
    this.setState({voteCountID: this.props.data[this.props.index].results[newInd]._id})
    this.setState({ind: newInd})

    // Getting the related companies
    const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.props.data[this.props.index].results[newInd].relatedField}; // needs to be based on posIndex
      var labelOne = "";
      var labelTwo = "";
      fetch("/related", {
        method: "POST",
        credentials: "include",

        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {

          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;
          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
        })
        .catch((error) => {
          console.error(error);
        });
  }

  /*
    When in the "All Positions" dialog and the previous button is selected, get the new upvote/downvote states,
    change the index and vote count in the state array. Also fetch the new related companies labels
  */
  handlePrevAll = () =>{
    // Decrementing the ind variable
    var newInd = (this.state.ind-1+this.props.data[this.props.index].results.length) % this.props.data[this.props.index].results.length;
    this.setState({upClick: this.state.upvotedReviews.includes(this.props.data[this.props.index].results[newInd]._id)})
    this.setState({downClick: this.state.downvotedReviews.includes(this.props.data[this.props.index].results[newInd]._id)})
    this.setState({voteCountID: this.props.data[this.props.index].results[newInd]._id})
    this.setState({ind: newInd})

    // Getting the related companies
    const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.props.data[this.props.index].results[newInd].relatedField}; // needs to be based on posIndex
      var labelOne = "";
      var labelTwo = "";
      fetch("/related", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {

          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;

          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
        })
        .catch((error) => {
          console.error(error);
        });
  }

  /*
    When a specific position dialog is to be opened or closed. Takes in the variable posInd, which
    represents which index of the position array is to be referenced.

    If it is about to be opened, 
    change the state and fetch the user upvoted reviews for that specific company,
    update the click count and recent company list, as well as retrieve the vote count per entry.
    Also gets the related companies data

    If the dialog is to be closed, change the state and set the related company labels to null

    In both cases: send clicked data back to Component.js, change the ind state to 0.
  */
  handleChangePos(posInd) {
    // if about to be opened
    if (posInd !== -1)
    {
      // fetching the upvoted reviews array for the specific company
      var upvotedReviews = [];
      var downvotedReviews = [];
      fetch("/retrieveUserVotes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          var upvotedReviewsAll;
          var downvotedReviewsAll;

          upvotedReviewsAll = data[0].upvoted;
          downvotedReviewsAll = data[0].downvoted;

          for (var j = 0; j < this.state.pos[this.state.posArr[posInd]].length; j++) {
            if (upvotedReviewsAll.includes(this.state.pos[this.state.posArr[posInd]][j]._id)) {
              upvotedReviews.push(this.state.pos[this.state.posArr[posInd]][j]._id);
            }
          }
          for (j = 0; j < this.state.pos[this.state.posArr[posInd]].length; j++) {
            if (downvotedReviewsAll.includes(this.state.pos[this.state.posArr[posInd]][j]._id)) {
              downvotedReviews.push(this.state.pos[this.state.posArr[posInd]][j]._id);
            }
          }

          this.setState({upvotedReviews: upvotedReviews});
          this.setState({downvotedReviews: downvotedReviews});
          var up = upvotedReviews.includes(this.state.pos[this.state.posArr[posInd]][0]._id)
          var down = downvotedReviews.includes(this.state.pos[this.state.posArr[posInd]][0]._id)
          //var voteNum = this.props.votething[this.state.pos[this.state.posArr[posInd]][0]._id]
          this.setState({upClick: up});
          this.setState({downClick: down})
          this.setState({voteCountID: this.state.pos[this.state.posArr[posInd]][0]._id})
        })
        .catch((error) => {
          console.error(error);
        });

      // updating the total click count
      const json = {"companyName": this.props.data[this.props.index].companyName};
      fetch("/totalClick", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
          console.log("totalClick request error");
        })
        .catch((error) => {
          console.error(error);
        });

      // updating the research search field
      fetch("/recentSearches", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
          console.log("recentSearches request error");
        })
        .catch((error) => {
          console.error(error);
        });

      // retrieving the vote count for the new company
      fetch("/retrieveVoteCount", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          this.setState({voteCount: data}, () => this.setState({openPosIndex: posInd}));
        })
        .catch((error) => {
          console.error(error);
        });

      // getting the new related companies 
      const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.state.pos[this.state.posArr[posInd]][0].relatedField}; // needs to be based on posIndex
      var labelOne = "";
      var labelTwo = "";
      fetch("/related", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;
          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
       })
        .catch((error) => {
          console.error(error);
        });

    }
    else
    {
      this.setState({relatedLabelOne: ''})
      this.setState({relatedLabelTwo: ''})
    }

    if (posInd === -1) {
      var clickInfo = [this.props.mode, this.props.index];
      this.setState({openPosIndex: posInd}, () => this.props.sendClickedResult(clickInfo));
    }

    this.setState({ind: 0});
  }

  /*
    When in a specific position dialog and the next button is selected, get the new upvote/downvote states,
    change the index and vote count in the state array. Also fetch the new related companies labels
  */
  handleNextPos = () =>{
    var dataA = this.state.pos[this.state.posArr[this.state.openPosIndex]]
    var newInd = (this.state.ind + 1) % dataA.length;
    this.setState({voteCountID: dataA[newInd]._id})
    this.setState({ind: newInd})
    this.setState({upClick: this.state.upvotedReviews.includes(dataA[newInd]._id)})
    this.setState({downClick: this.state.downvotedReviews.includes(dataA[newInd]._id)})

    // Retrieving the new related companies
    const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.state.pos[this.state.posArr[this.state.ind]][newInd].relatedField}; 

      var labelOne = '';
      var labelTwo = '';
      fetch("/related", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;

          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
        })
        .catch((error) => {
          console.error(error);
        });
  }

  /*
    When in the "All Positions" dialog and the previous button is selected, get the new upvote/downvote states,
    change the index and vote count in the state array. Also fetch the new related companies labels
  */
  handlePrevPos = () =>{
    var dataA = this.state.pos[this.state.posArr[this.state.openPosIndex]]
    var newInd = (this.state.ind - 1 + dataA.length) % dataA.length
    this.setState({voteCountID: dataA[newInd]._id})
    this.setState({ind: newInd})
    this.setState({upClick: this.state.upvotedReviews.includes(dataA[newInd]._id)})
    this.setState({downClick: this.state.downvotedReviews.includes(dataA[newInd]._id)})

    // Retrieving the new related companies
    const relatedFieldJson = {"companyName": this.props.data[this.props.index].companyName,
      "relatedField":this.state.pos[this.state.posArr[this.state.ind]][newInd].relatedField}; // needs to be based on posIndex
      var labelOne = "";
      var labelTwo = "";
      fetch("/related", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(relatedFieldJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {

          if (data[0] !== '')
            labelOne += data[0].companyName + " - " + data[0].positionName;

          if (data[1] !== '')
            labelTwo += data[1].companyName + " - " + data[1].positionName;
          this.setState({relatedLabelOne: labelOne})
          this.setState({relatedLabelTwo: labelTwo})
          this.setState({relatedData: data})
        })
        .catch((error) => {
          console.error(error);
        });
  }

  /* When the user clicks on any of the related companies buttons, close dialog and fill in search */
  handleRelatedSearch(data) {
    this.setState({openPosIndex: -1})
    this.setState({open: false}, () => this.props.sendRelatedSearch(data.companyName, data.positionName, ""));
    var clickInfo = [this.props.mode, this.props.index];
    this.setState({open: false}, () => this.props.sendClickedResult(clickInfo));
  }


  /* 
    After upvoting/unupvoting a review, update the local versions of upvotedReviews/downvotedReviews 
    and voteCount. Fetch request for sending the upvoted information back to the server per user
  */
  handleUpVoteClick = () => {
    var data = this.props.data[this.props.index].results
    if (this.state.openPosIndex !== -1)
      data = this.state.pos[this.state.posArr[this.state.openPosIndex]]

    // local copies of the state variables
    var upvotedReviewsTemp = this.state.upvotedReviews;
    var downvotedReviewsTemp = this.state.downvotedReviews;
    var voteCountTemp = this.state.voteCount;
    var voteChange;
    var index;

    const userVoteJson = {"_id": data[this.state.ind]._id};

    // if unupvoting a review
    if (this.state.upClick) {
      voteCountTemp[data[this.state.ind]._id]--;
      index = upvotedReviewsTemp.indexOf(data[this.state.ind]._id);
      if (index > -1) {
        upvotedReviewsTemp.splice(index, 1);
      }
      voteChange = -1;
      fetch("/upvoteRemove", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(userVoteJson),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json())
          .then(data => {
            if (!data.res)
              console.log("upVoteRemove request error");
          })
          .catch((error) => {
            console.error(error);
          });
    }
    // if upvoting a previously downvoted review
    else if (this.state.downClick)
    {
      voteCountTemp[data[this.state.ind]._id] += 2;
      this.setState({downClick: false});
      upvotedReviewsTemp.push(data[this.state.ind]._id)
      index = downvotedReviewsTemp.indexOf(data[this.state.ind]._id)
      if (index > -1)
        downvotedReviewsTemp.splice(index, 1)
      voteChange = 2;
      fetch("/upvote", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("upvote request error");
        })
        .catch((error) => {
          console.error(error);
        });
      fetch("/downvoteRemove", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("downvoteRemove request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // if upvoting a never voted on review
    else {
      voteCountTemp[data[this.state.ind]._id] ++;
      voteChange = 1
      upvotedReviewsTemp.push(data[this.state.ind]._id);
      fetch("/upvote", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("upvote request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // updating the vote count in the server
    const voteCountJson = {"_id": data[this.state.ind]._id, "voteCount": voteChange};
    fetch("/voteCount", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(voteCountJson),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => {
        if (!data.res)
          console.log("voteCount request error");
      })
      .catch((error) => {
        console.error(error);
      });

    this.setState({upvotedReviews: upvotedReviewsTemp});
    this.setState({downvotedReviews: downvotedReviewsTemp});
    this.setState({voteCount: voteCountTemp});
    this.setState({upClick: !this.state.upClick});
  }

  /* 
    After downvoting/undownvoting a review, update the local versions of upvotedReviews/downvotedReviews 
    and voteCount. Fetch request for sending the downvoted information back to the server per user
  */
  handleDownVoteClick = () => {
    var data = this.props.data[this.props.index].results
    if (this.state.openPosIndex !== -1)
      data = this.state.pos[this.state.posArr[this.state.openPosIndex]]
    
    var voteChange;
    var upvotedReviewsTemp = this.state.upvotedReviews;
    var downvotedReviewsTemp = this.state.downvotedReviews;
    var voteCountTemp = this.state.voteCount;
    var index;

    const userVoteJson = {"_id": data[this.state.ind]._id};

    // if undownvoting
    if (this.state.downClick) {
      voteCountTemp[data[this.state.ind]._id]++
      voteChange = 1;
      index = downvotedReviewsTemp.indexOf(data[this.state.ind]._id)
      if (index > -1)
        downvotedReviewsTemp.splice(index, 1);
      fetch("/downvoteRemove", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
          console.log("downvoteRemove request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // if downvoting a previous upvoted
    else if (this.state.upClick)
    {
      voteCountTemp[data[this.state.ind]._id] -= 2;
      this.setState({upClick: false});
      voteChange = -2;
      index = upvotedReviewsTemp.indexOf(data[this.state.ind]._id)
      if (index > -1)
        upvotedReviewsTemp.splice(index, 1)
      downvotedReviewsTemp.push(data[this.state.ind]._id);
      fetch("/downvote", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("downvote request error");
        })
        .catch((error) => {
          console.error(error);
        });
      fetch("/upVoteRemove", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(userVoteJson),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
            console.log("upVoteRemove request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // if downvoting a never voted on before review
    else {
      voteCountTemp[data[this.state.ind]._id] --;
      voteChange = -1;
      downvotedReviewsTemp.push(data[this.state.ind]._id);
      fetch("/downvote", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(userVoteJson),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json())
          .then(data => {
            if (!data.res)
              console.log("downvote request error");
          })
          .catch((error) => {
            console.error(error);
          });
    }

    // updating the vote count array in the database
    const voteCountJson = {"_id": data[this.state.ind]._id, "voteCount": voteChange};
    fetch("/voteCount", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(voteCountJson),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => {
        if (!data.res)
          console.log("voteCount request error");
      })
      .catch((error) => {
        console.error(error);
      });

    this.setState({upvotedReviews: upvotedReviewsTemp});
    this.setState({downvotedReviews: downvotedReviewsTemp})
    this.setState({voteCount: voteCountTemp})
    this.setState({downClick: !this.state.downClick})
  }

  /*
    Once the favorite icon is clicked per a company card, send the information to the server
    depending on if it is favoriting or unfavoriting. Update the state variable favorite
  */
  handleFavoriteClick = () =>
  {
    var favorite = !this.props.favorite;
    this.setState({favorite: favorite});
    var favoriteInfo = [this.props.mode, this.props.index, favorite];

    const json = {"companyName": this.props.data[this.props.index].companyName};

    // if adding to favorites
    if (favorite) {
      /* Update favorite companies for this user in database. */
      fetch("/favoriteCompanies", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
          console.log("favoriteCompanies request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    /* Remove favorite from database and from user's list of favorite companies. */
    else {
      /* Remove this company from list of favorites for this user in database. */
      fetch("/favoriteCompaniesRemove", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (!data.res)
          console.log("favoriteCompaniesRemove request error");
        })
        .catch((error) => {
          console.error(error);
        });
    }
    this.setState({favOpen: true}, () => this.props.sendFavoriteItem(favoriteInfo));
  }

  // function that determines which snackbar state is displayed for favoriting
  handleRequestFavClose = () =>
  {
    this.setState({favOpen: false});
  }

  /* 
    Given the parameter data for each specific review, 
    returns the student information as a JS Object
  */
  infoText(data)
  {
    var ppgm = 'N/A';
    if (data.princetonProgram !== '')
      ppgm = data.princetonProgram

    return (<div>
      <b>Major: </b> <Chip style={{display:"inline"}} >{data.major} </Chip><br />
      <b>Year Internship Occurred</b>:  <Chip style={{display:"inline"}}>{data.year}</Chip><br />
      <b>Application Method</b>:  {data.apply} <br /><br />
      <b>Princeton Program</b>: {ppgm} <br/></div>
      )
  }

  /*
    Given the index and data parameter (the .results of the props data), 
    returns a formatted listitem object that displays the infoText() return HTML
  */
  renderStudentInfo(i, dataA) {
    const data = dataA[i]; 
    return (
      <div>
      <ListItem disabled={true}
        leftIcon={<ContentSend/>} initiallyOpen={true}>
      {this.infoText(data)}
      </ListItem>
      <Divider /></div>)
  }

  /* 
    Given the parameter data for each specific review, 
    returns the interview information as a JS Object
  */
  interviewText(data)
  {
    return (<div>
      <b>Number of Interviews: </b> {data.numberOfInterviews} <br /><br />
      <b>Interview Questions: </b> {data.questions} <br /><br />
      <b>Tips: </b> {data.recommendations} <br /><br />
      <b>Preparation: </b> {data.howDidYouPrepare} <br /><br />
      <b>Classes to Prepare: </b> {data.classesToPrepare} <br /></div>)
  }

  /*
    Given the index and data parameter (the .results of the props data), 
    returns a formatted listitem object that displays the interviewText() return HTML
  */
  renderInterview(i, dataA) {
    const data = dataA[i];   
    return (
      <div>
      <ListItem disabled={true}
        leftIcon={<ContentSend/>} initiallyOpen={true}>
      {this.interviewText(data)}
      </ListItem>
      <Divider /></div>)
  }

  /* 
    Given the parameter data for each specific review, 
    returns the experience information as a JS Object
  */
  experienceText(data)
  {
    return (<div>
      <b>Overall Experience: </b> {data.overallExperience} <br /></div>)
  }

  /*
    Given the index and data parameter (the .results of the props data), 
    returns a formatted listitem object that displays the experienceText() return HTML
  */
  renderExperience(i, dataA) {
    const data = dataA[i];   
    return (
      <div>
      <ListItem disabled={true}
        leftIcon={<ContentSend/>} initiallyOpen={true}>
      {this.experienceText(data)}
      </ListItem>
      <Divider /></div>)
  }

  /* 
    Given the parameter data for each specific review, 
    returns the facts information as a JS Object
  */
  factsText(data)
  {
    return (<div> 
      <b>Duration: </b> {data.duration} weeks<br /> <br />
      <b>Location: </b> {data.location} <br /><br />
      <b>Average Day: </b> {data.averageDay} <br /> <br />
      <b>Salary: </b>{data.salary}<br /> <br />
      <b>General Advice: </b> {data.advice}<br /><br />
      <b>Other: </b>{data.anythingElse}<br /></div>);
  }

  /*
    Given the index and data parameter (the .results of the props data), 
    returns a formatted listitem object that displays the factsText() return HTML
  */
  renderFacts(i, dataA) {
    const data = dataA[i];   
    return (
      <div>
      <ListItem disabled={true}
        leftIcon={<ContentSend/>} initiallyOpen={true}>
      {this.factsText(data)}
      </ListItem>
      <Divider /></div>)
  }

  /*
  Called in each dialog box, returns 0-2 buttons of the related label text 
  */
  renderRelated() {
    if (this.state.relatedLabelOne === '')
    {
      // if no related companies are suggested
      if (this.state.relatedLabelTwo === '')
        return;

      // if only relatedLabelTwo is filled
      else
      {
        return (<div>
                  <div> <b>Recommended Searches For You </b></div>
                  <div><FlatButton primary={true} label={this.state.relatedLabelTwo} onClick={() => this.handleRelatedSearch(this.state.relatedData[1])} /></div>
                </div>)
      }
    }
    else if (this.state.relatedLabelTwo === '')
    {
      // if only relatedLabelOne is filled
      return (<div>
                  <div> <b>Recommended Searches For You </b></div>
                  <div><FlatButton primary={true} label={this.state.relatedLabelOne} onClick={() => this.handleRelatedSearch(this.state.relatedData[0])} /></div>
                </div>)
    }

    // if two companies are recommended
    else
    {
      return (<div style={{padding:0, margin:0, overflow:"auto"}} >
        <div> <b>Recommended Searches For You </b></div>
        <FlatButton primary={true} label={this.state.relatedLabelOne} onClick={() => this.handleRelatedSearch(this.state.relatedData[0])} />
        <FlatButton primary={true} label={this.state.relatedLabelTwo} onClick={() => this.handleRelatedSearch(this.state.relatedData[1])} />
      </div>
      );
    }
    
  }

  /* 
    Given the parameter data array, render each position with nested information as a Card within a Dialog
    Objects such as upvote/downvote, are needed to be highlighted based on this.state.upvotedReviews etc.
  */
  renderEntry(data) {
    var dataA = data[this.props.index].results

    // creating the left right buttons for "All Positions"
    var buttonStyle = {display: "inline-block", padding:"0vh", float:"left"}
    var nextButtonStyle = {display: "inline-block", padding:"0vh", float:"right"}
    var next = (<IconButton style={nextButtonStyle} onClick={this.handleNextAll} disabled={this.state.ind === dataA.length-1}>
                  <ChevronRightIcon />
                </IconButton>)
    var prev = (<IconButton style={buttonStyle} onClick={this.handlePrevAll} disabled={this.state.ind === 0}>
                  <ChevronLeftIcon />
                </IconButton>)

    // creating the left right buttons for position specific dialog
    if (this.state.openPosIndex !== -1)
    {
      dataA = this.state.pos[this.state.posArr[this.state.openPosIndex]]
      next = (<IconButton style={nextButtonStyle} onClick={this.handleNextPos} disabled={this.state.ind === dataA.length-1}>
                  <ChevronRightIcon />
                </IconButton>)
      prev = (<IconButton style={buttonStyle} onClick={this.handlePrevPos} disabled={this.state.ind === 0}>
                  <ChevronLeftIcon />
                </IconButton>)
    }

    var title = dataA[this.state.ind].positionName;

    // Color of the upvote or downvote icons
    var classUp = "black";
    var classDown = "black";
    if (this.state.upvotedReviews.includes(dataA[this.state.ind]._id))
      classUp = "orange";
    else if (this.state.downvotedReviews.includes(dataA[this.state.ind]._id))
      classDown = "blue"

    // Color of the rating
    var badgeColor = colorAt(dataA[this.state.ind].rating)

    return (
      <div >
      <Card style={{display:"inline-block", overflow: 'auto', maxHeight: "35vh", width:"100%"}} zdepth={2}>
        <div style={{padding: "16px", paddingBottom: "0px"}}>
          {title}
          <IconButton onClick={this.handleUpVoteClick}>
                <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.accent3Color} color={classUp} >thumb_up</FontIcon>
            </IconButton>
            {this.state.voteCount[this.state.voteCountID]}
            <IconButton onClick={this.handleDownVoteClick}>
              <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.accent3Color} color={classDown}>thumb_down</FontIcon>
            </IconButton>
          <span style={{float: "right"}}>
          <Label style={{backgroundColor:badgeColor, fontSize:"1.5em"}}>
            <span style={{verticalAlign:"center"}}>{dataA[this.state.ind].rating.toFixed(1) }</span>
            <FontIcon className="material-icons" color={"white"} style={{verticalAlign:"center"}}>star</FontIcon>
          </Label>
          </span>
        </div>
        <List>
          {this.renderStudentInfo(this.state.ind, dataA)}
          {this.renderInterview(this.state.ind, dataA)}
          {this.renderExperience(this.state.ind, dataA)}
          {this.renderFacts(this.state.ind, dataA)}
        </List>
      </Card>
      <div style={{textAlign:"center", verticalAlign:"center"}} >{prev}{"Entry "}<b>{(this.state.ind + 1)}</b>{" of "}<b>{dataA.length}</b>{next}
      </div>
      </div>
    );
  }


  /* 
    Under the "Experiences" tab of the dialog, creates a List of all renderExperience() returns.
    Returns this all in a Card format
  */
  renderAllExperiences(index, output) {
    var data = output[index].results;
    if (this.state.openPosIndex !== -1)
      data = this.state.pos[this.state.posArr[this.state.openPosIndex]]

    // creates an array of each review, to create the list items
    const range = Array.from(Array(data.length).keys())
    const listItems = range.map((i) => this.renderExperience(i, data))

    return (<div><Card style={{overflow: 'auto', maxHeight: "35vh"}} zdepth={2}>
              <CardText style={{whiteSpace: 'pre-line'}}>
              <b><u> Experiences </u></b> <br />
              <List>{listItems}</List>
              </CardText>
            </Card></div>);
  }


  /* 
    Under the "Interviews" tab of the dialog, creates a List of all renderInterview() returns.
    Returns this all in a Card format
  */
  renderAllInterview(index, output) {
    var data = output[index].results;
    if (this.state.openPosIndex !== -1)
      data = this.state.pos[this.state.posArr[this.state.openPosIndex]]

    // creates an array of each review, to create the list items
    const range = Array.from(Array(data.length).keys())
    const listItems = range.map((i) => this.renderInterview(i, data))

    return (<div><Card style={{overflow: 'auto', maxHeight: "35vh"}} zdepth={2}>
              <CardText style={{whiteSpace: 'pre-line'}}>
              <b><u> Interview Processes </u></b> <br />
              <List>{listItems}</List>
              </CardText>
            </Card></div>);
  }

  /*
  Given an index and key, for the ReactList, creates each button for each position
  The dialog box is stored inside the RaisedButton with three tabs: All Entries, Interview, Experiences
  As well as a related companies button 
  */
  renderEachPos(index, key) {
    // return the button with dialog 
    const closePosactions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={() => this.handleChangePos(-1)}
      />
      ];

    return (
      <RaisedButton primary={true} label={Object.keys(this.state.pos)[index]} style = {{marginLeft: "10px", marginTop: "10px"}} onClick={() => this.handleChangePos(index)} key={key}>
        <Dialog 
          title={this.props.data[this.props.index].companyName + " " + Object.keys(this.state.pos)[index]}
          actions={closePosactions}
          titleStyle={{padding:"18px 24px"}}
          actionsContainerStyle={{marginTop: "0px" }}
          modal={false}
          open={(index === this.state.openPosIndex)}
          onRequestClose={() => this.handleChangePos(-1)}
          contentStyle={customContentStyle}
          autoScrollBodyContent={false}
          bodyStyle={{padding:"0px 24px"}}
        >
          <Tabs style={{minHeight:"50%", maxHeight:"50%"}}>
            <Tab label="All Entries">
              {this.renderEntry(this.props.data)}
            </Tab>
            <Tab label="Interviews">
              {this.renderAllInterview(this.props.index, this.props.data)} 
            </Tab>

            <Tab label="Experiences">
              {this.renderAllExperiences(this.props.index, this.props.data)}
            </Tab>
          </Tabs>
          {this.renderRelated()}
        </Dialog>
      </RaisedButton>
        )
  }

  // Creates the snackbar on favoriting, depends on this.state.favorite
  renderSnack()
  {
    var message = "Removed from favorites!"
    if (this.state.favorite)
      message = "Added to favorites!";
    return(<Snackbar
            open={this.state.favOpen}
            message={message}
            autoHideDuration={1000}
            onRequestClose={this.handleRequestFavClose}/>
          );
  }

  // Creates the doughnut pie chart, displayed on the front of the card when metrics is pushed
  renderDoughnut()
  {
    var titleDoughnut = "Major Distribution";
    var doughnutData = this.state.doughnutMajor;

    return (
      <Doughnut
        data={doughnutData}
        key={this.props.data[this.props.index].companyName}
        height={200}
        width={200}
        options={{
            maintainAspectRatio: false,
            legend: {
              display: false,
            },
            animation: {
              duration: 500
            },
            title: {
              display: true,
              text: titleDoughnut
            }
          }}
      />);
  }

  // Creates the histogram chart, displayed on the front of the card when metrics is pushed
  renderHistogram()
  {
    var titleHistogram = "Year Distribution"
    return (
      <HorizontalBar
        data={this.state.histYear}
        width = {"100%"}
        height={"200%"}
        options={{
          maintainAspectRatio: false,
          legend: {
              display: false,
            },
          scales: {
            xAxes: [{
              ticks: {
                display: false
              },
              gridLines: {
                display: false,
              },
              barPercentage: 1.0,
              categoryPercentage: 1.0,
            }],
            yAxes: [{
              gridLines: {
                display: false
              },
            }]
          },
          title: {
              display: true,
              text: titleHistogram
            },
        }}
        />
      )
  }

  // Shows both the histogram and doughnut when the metrics state is true
  renderMetrics() {
    // showing the metrics
    if (this.state.metrics)
    {
      return (
        <div>
        <Col xsHidden smHidden mdHidden lg="5">
        {this.renderHistogram()}
        </Col>
        <Col xsHidden smHidden mdHidden lg="2">
        {this.renderDoughnut()}
        </Col></div>)
    }
  }

  // Handler for metrics button click, showing metrics or not
  handleMetricsClick() {
    this.setState({metrics: !this.state.metrics})
  }

  // Creating the label if the company is a princeton program
  renderPpgm() {
    if (this.props.data[this.props.index].results[0].princetonProgram !== "")
    {
      return(
        <span style={{fontSize:"1.5em", color:myMuiTheme.palette.disabledColor}} >{this.props.data[this.props.index].results[0].princetonProgram}</span>);
    }
  }

  // Render function
  render() {

    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.handleChangeAll}
      />
      ];

      // change color of heart based on this.props.favorite
      var color = "gray";
      if (this.props.favorite)
        color = "red";

      var badgeColor = colorAt(this.state.avgRate)

      return (<div style={{paddingTop: 10}}>
                <Paper zdepth={5}>
                  <div style={{padding: "10px 0 10px 0"}}>
                  <Grid fluid={true}>
                  <Row>
                  <Col sm="9"><font size="+3"><b>{this.props.data[this.props.index].companyName}</b></font>
                  <IconButton onClick={this.handleFavoriteClick} tooltip="Favorite!">
                      <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.warning} color={color}>favorite</FontIcon>
                    </IconButton>
                      {this.renderSnack()}
                      {this.renderPpgm()}
                  </Col>
                  <Col sm="3" style={{paddingTop:10}} ><span style={{float:"right"}} >
                    {/* <span style={{fontSize:"2em"}} ><Label> {this.state.avgRate}/5</Label></span> */}
                    <Label style={{backgroundColor:badgeColor, fontSize:"1.5em"}}>
                      <span style={{verticalAlign:"center"}}>{this.state.avgRate.toFixed(1) }</span>
                      <FontIcon className="material-icons" color={"white"} style={{verticalAlign:"bottom"}}>star</FontIcon>
                    </Label>
                  </span>
                  </Col>
                  </Row>
                  <Row>
                  <Col md="12" lg="5" style={{paddingTop:10}}>
                  <RaisedButton secondary={true} label={"All POSITIONS"} onClick={this.handleChangeAll} style={{marginLeft :"10px"}}>
                    <Dialog 
                      title={this.props.data[this.props.index].companyName}
                      titleStyle={{padding:"18px 24px"}}
                      actions={actions}
                      actionsContainerStyle={{marginTop: "0px" }}
                      modal={false}
                      open={this.state.open}
                      onRequestClose={this.handleChangeAll}
                      contentStyle={customContentStyle}
                      autoScrollBodyContent={false}
                      bodyStyle={{padding:"0px 24px"}}
                    >
                      <Tabs style={{minHeight:"50%", maxHeight:"50%"}}>
                        <Tab label="All Entries">
                          {this.renderEntry(this.props.data)}
                        </Tab>
                        <Tab label="Interviews">
                          {this.renderAllInterview(this.props.index, this.props.data)} 
                        </Tab>

                        <Tab label="Experiences">
                          {this.renderAllExperiences(this.props.index, this.props.data)}
                        </Tab>
                      </Tabs>
                      {this.renderRelated()}
                    </Dialog>  

                  </RaisedButton>
                  <ReactList
                    itemRenderer={this.renderEachPos}
                    length={this.state.posArr.length}
                    type='simple'
                  />
                  </Col>
                  {this.renderMetrics()}
                  <Col xsHidden smHidden mdHidden lg="12"><RaisedButton primary={true} label={"Metrics"} onClick={this.handleMetricsClick} style={{float:"right"}} />
                  </Col>
                  </Row>
                  </Grid>
                  </div>
                </Paper>
            </div>);
  }
}

export default CompanyCardComponent;