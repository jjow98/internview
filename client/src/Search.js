import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import ReactList from 'react-list';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import './Search.css';
import {Card, CardTitle, CardHeader, CardText} from 'material-ui/Card';
import CompanyCardComponent from './CompanyCardComponent.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ChipInput from 'material-ui-chip-input';
import FontIcon from 'material-ui/FontIcon';
import myMuiTheme from './myMuiTheme';
import IconButton from 'material-ui/IconButton'; 
import { Grid, Row, Col, Clearfix, Nav, Navbar, NavItem} from 'react-bootstrap';
import ReactMomentCountDown from 'react-moment-countdown';
import Survey from './Survey';
import ReactMapGL, {Marker, Popup, NavigationControl} from 'react-map-gl';
import CompanyPin from './CompanyPin';
import CompanyPinInfo from './CompanyPinInfo';
import Checkbox from 'material-ui/Checkbox';
import Chip from 'material-ui/Chip';

const bgURL=require('./img/newbg.png')

const POP_IMG_URL = require("./img/popular.JPG")
const FAV_IMG_URL = require("./img/favorite.JPG")
const RECENT_IMG_URL = require("./img/recent.JPG")
const INFO_IMG_URL = require("./img/info.JPG")

const muiTheme = getMuiTheme(myMuiTheme);

const majors = [
  'AAS', 'AFS', 'AMS', 'ANT', 'AOS', 'APC', 'ARA', 'ARC', 'ART', 'AST', 'ATL','BCS',
  'CBE', 'CEE', 'CGS', 'CHI', 'CHM', 'CHV', 'CLA', 'CLG', 'COM', 'COS', 'CTL', 'CWR',
  'CZE', 'DAN', 'EAS', 'ECO', 'ECS', 'EEB', 'EGR', 'ELE', 'ENE', 'ENG', 'ENT', 'ENV',
  'EPS', 'FIN', 'FRE', 'FRS', 'GEO', 'GER', 'GHP', 'GLS', 'GSS', 'HEB', 'HIN', 'HIS',
  'HLS', 'HOS', 'HPD', 'HUM', 'Independent', 'ISC', 'ITA', 'JDS', 'JPN', 'JRN', 'KOR',
  'LAO', 'LAS', 'LAT', 'LCA', 'LIN', 'MAE', 'MAT', 'MED', 'MOD', 'MOG', 'MOL', 'MSE',
  'MTD', 'MUS', 'NES', 'NEU', 'ORF', 'PAW', 'PER', 'PHI', 'PHY', 'PLS', 'POL', 'POP',
  'POR', 'PSY', 'QCB', 'REL', 'RES', 'RUS', 'SAN', 'SAS', 'SLA', 'SML', 'SOC', 'SPA',
  'STC', 'SWA', 'THR', 'TPP', 'TRA', 'TUR', 'TWI', 'URB', 'URD', 'VIS', 'WRI', 'WWS'];
const years = ['Before freshman year', 'After freshman year', 'After sophomore year', 'After junior year'];
const princetonProgramAns = ['Andlinger Center for Energy and the Environment', 'Community Based Learning Initiative',
'German Summer Work Program', 'Global Health Program', 'Guggenheim Internships in Criminal Justice',
'International Internship Program (IIP)', 'Interfaith Internship Program', 
'International Research Exchange Program (REACH)', 'John C. Bogle \'51 Fellows in Civic Service',
'Keller Center', 'Princeton Environmental Institute', 'Princeton Internships in Civic Service (PICS)', 'Princeton in Asia',
'Princeton in France', 'Princeton in Ishikawa', 'Princeton Program in Hellenic Studies', 'Princeton University Preparatory Program',
'Princeton Start-Up Immersion Program (PSIP)', 'Research on Campus', 'Scholars in the Nation\'s Service', 'Streicker International Fellows Fund'];
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJhbm1heTk4IiwiYSI6ImNqZ3JpN3V4aTA1MDQyd254a3NqbXhoMTAifQ.w0Zmhw_ZM35TqLx0KlHW0Q'; // make private env var

class SearchForm extends React.Component {
   constructor(props) {
    super(props);
    this.state = {
      pageLoaded: false, // Whether the page has fully loaded with data
      surveyChecked: false, // Whether the survey status of the user has been checked
      surveyOpen: false, // Whether the survey should be displayed
      waitTime: '', // Time to be displayed for survey timer

      studentName: '', // Student name or netid
      userData: false, // Whether the user data has been fetched from the database

      companyName: '', // Company name search filter
      positionName: '', // Position name search filter
      princetonProgram: [], // Princeton program search filter
      maj: [], // Major search filter
      year: [], // Year search filter
      location: '', // Location search filter

      comDataSource: [], // Autocomplete data source for company name
      posDataSource: [],  // Autocomplete data source for position name
      locDataSource: [], // Autocomplete data source for location

      allEntries: false, // Whether the "See All" button has clicked
      dataAvailable: '', // Whether data is avaiable for a search
      output: '', // Search results from database
      sortBy: 'Sort by Company Name', // Sort method for results
      submitted: false, // Whether the survey has been submitted

      quickStart: true, // Whether the quick start guide should be displayed
      displayedState: 'Map', // Page to be displayed
      displayedData: [], // Data to be displayed
      popularCompanies: [], // List of popular companies
      recentCompanies: [], // List of recent companies
      favoriteCompanies: [], // List of favorited companies
      
      displayMap: true, // Whether to display map
      viewport: { // View specifications for map
        width: 1100,
        height: 400,
        latitude: 15,
        longitude: 0,
        zoom: 1
      },
      mapData: [], // Company data for map display
      companyPinInfo: '', // Company pin info to display when company pin is selected
    };

    
    this.getSurveyStatus = this.getSurveyStatus.bind(this);
    this.handleCountdownEnd = this.handleCountdownEnd.bind(this);
    this.renderSurvey = this.renderSurvey.bind(this);
    this.renderSurveyUserLogin = this.renderSurveyUserLogin.bind(this);
    this.renderWaitTime = this.renderWaitTime.bind(this);
    this.renderInitialInfo = this.renderInitialInfo.bind(this);

    this.clearSearchFields = this.clearSearchFields.bind(this);
    this.handleAllEntries = this.handleAllEntries.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.handleDataLoaded = this.handleDataLoaded.bind(this);
    this.renderData = this.renderData.bind(this);
    this.renderDisplayedData = this.renderDisplayData.bind(this);
    this.renderNumResults = this.renderNumResults.bind(this);
    this.sortInitialResults = this.sortInitialResults.bind(this);
    this.sortResults = this.sortResults.bind(this);

    this.handleFavoriteCompanies = this.handleFavoriteCompanies.bind(this);
    this.handlePopularCompanies = this.handlePopularCompanies.bind(this);
    this.handleRecentCompanies = this.handleRecentCompanies.bind(this);
    this.renderNoRecentCompanies = this.renderNoRecentCompanies.bind(this);
    this.renderNoFavoriteCompanies = this.renderNoFavoriteCompanies.bind(this);

    this.getClickedResult = this.getClickedResult.bind(this);
    this.getFavorite = this.getFavorite.bind(this);
    this.getRelatedSearch = this.getRelatedSearch.bind(this);

    this.handleMap = this.handleMap.bind(this);
    this.renderMap = this.renderMap.bind(this);
    this.renderQuickStart = this.renderQuickStart.bind(this);

    this.handleCompanyAutoComplete = this.handleCompanyAutoComplete.bind(this);
    this.handleFormComAutoComplete = this.handleFormComAutoComplete.bind(this);

    this.handlePositionAutoComplete = this.handlePositionAutoComplete.bind(this);
    this.handleFormPosAutoComplete = this.handleFormPosAutoComplete.bind(this);

    this.handleLocationAutoComplete = this.handleLocationAutoComplete.bind(this);
    this.handleFormLocAutoComplete = this.handleFormLocAutoComplete.bind(this);

    this.handleComAutoCompleteSelect = this.handleComAutoCompleteSelect.bind(this);
    this.handlePosAutoCompleteSelect = this.handlePosAutoCompleteSelect.bind(this);
    this.handleLocationAutoCompleteSelect = this.handleLocationAutoCompleteSelect.bind(this);

    this.updateCheckBeforeFreshmanYear = this.updateCheckBeforeFreshmanYear.bind(this);
    this.updateCheckAfterFreshmanYear = this.updateCheckAfterFreshmanYear.bind(this);
    this.updateCheckAfterSophomoreYear = this.updateCheckAfterSophomoreYear.bind(this);
    this.updateCheckAfterJuniorYear = this.updateCheckAfterJuniorYear.bind(this);
  }

  /* Add event listener for window resizing. */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /* Remove event listener for window resizing. */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  /* Display search for given companyName, positionName, and location. */
  getRelatedSearch(companyName, positionName, location) {
    this.setState({companyName: companyName});
    this.setState({positionName: positionName});
    this.setState({location: location}, () => this.handleSubmit());

    /* Clear other search filters to ensure correct result is displayed. */
    this.setState({princetonProgram: []});
    this.setState({maj: []});
    this.setState({year: []});
  }

  /* Clear all seach filters. */
  clearSearchFields() {
    this.setState({companyName: ''});
    this.setState({positionName: ''});
    this.setState({location: ''});
    this.setState({princetonProgram: []});
    this.setState({maj: []});
    this.setState({year: []});
  }

  /* Load results when "Enter" is pressed or a selection from AutoComplete is made for company name. */ 
  handleComAutoCompleteSelect(chosenRequest) {
    this.setState({companyName: chosenRequest}, () => this.handleSubmit());
  }

  /* Get autocomplete results for "Company Name" search from database. */
  handleCompanyAutoComplete(searchText) {
    const json = {companyName: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({comDataSource: data}))
      .catch((error) => {
        console.error(error);
      });
  }

  /* Handle autocomplete for search filter "Company Name". */
  handleFormComAutoComplete(searchText) {
    this.setState({companyName: searchText});
    this.handleCompanyAutoComplete(searchText);
    this.handleComAutoCompleteSelect(searchText);
  }

  /* Load results when "Enter" is pressed or a selection from AutoComplete is made for position name. */ 
  handlePosAutoCompleteSelect(chosenRequest) {
    this.setState({positionName: chosenRequest}, () => this.handleSubmit());
  }

  /* Get autocomplete results for "Position Name" search from database. */
  handlePositionAutoComplete(searchText) {
    const json = {positionName: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({posDataSource: data}))
      .catch((error) => {
        console.error(error);
      });
  }

  /* Handle autocomplete for search filter "Position Name". */
  handleFormPosAutoComplete(searchText) {
    this.setState({positionName: searchText});
    this.handlePositionAutoComplete(searchText);
    this.handlePosAutoCompleteSelect(searchText);
  }

  /* Load results when "Enter" is pressed or a selection from AutoComplete is made for location. */ 
  handleLocationAutoCompleteSelect(chosenRequest) {
    this.setState({location: chosenRequest}, () => this.handleSubmit());
  }

  /* Get autocomplete results for "Location" search from database. */
  handleLocationAutoComplete(searchText) {
    const json = {location: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({locDataSource: data}))
      .catch((error) => {
        console.error(error);
      });
  }

  /* Handle autocomplete for search filter "Location". */
  handleFormLocAutoComplete(searchText) {
    this.setState({location: searchText});
    this.handleLocationAutoComplete(searchText);
    this.handleLocationAutoCompleteSelect(searchText);
  }

  /* Handle adding major to search form; if invalid, user will be alerted. */
  handleAddMajor(chip) {
    var currentMajor = this.state.maj;
    var match = false;
    var majorAdded;
    for (var i = 0; i < majors.length; i++)
      if (majors[i].toUpperCase() === chip.toUpperCase()) {
        match = true;
        majorAdded = majors[i];
        break;
    }
    if (match) {
      currentMajor.push(majorAdded);
      this.setState({maj: currentMajor})
    } else
      alert('Invalid major: ' + chip + "\nPlease use the 3-letter abbreivation (e.g. COS)");
    this.handleSubmit();
  }

  /* Handle deleting major from search. */
  handleDelMajor(chip, index) {
    var currentMajor = this.state.maj;
    currentMajor.splice(index, 1);
    this.setState({maj: currentMajor});
    this.handleSubmit();
  }

  /* Handle adding major to search form; if invalid, user will be alerted. */
  handleAddPpgm(chip) {
    var currentPrincetonProgram = this.state.princetonProgram;
    var match = false;
    var princetonProgramAdded;
    for (var i = 0; i < princetonProgramAns.length; i++)
      if (princetonProgramAns[i].toUpperCase() === chip.toUpperCase()) {
        match = true;
        princetonProgramAdded = princetonProgramAns[i];
        break;
    }
    if (match) {
      currentPrincetonProgram.push(princetonProgramAdded);
      this.setState({princetonProgram: currentPrincetonProgram})
    } else
      alert('Invalid Princeton Program: ' + chip);
    this.handleSubmit();
  }

  /* Handle deleting major from search. */
  handleDelPpgm(chip, index) {
    var currentPrincetonProgram = this.state.princetonProgram;
    currentPrincetonProgram.splice(index, 1);
    this.setState({princetonProgram: currentPrincetonProgram})
    this.handleSubmit();
  }

  /* Handle internship year selection in search form; if invalid, user will be alerted. */
  handleAddYear(chip) {
    var currentYear = this.state.year;
    var match = false;
    var yearAdded;
    for (var i = 0; i < years.length; i++)
      if (years[i].toUpperCase() === chip.toUpperCase()) {
        match = true;
        yearAdded = years[i];
        break;
    }
    if (match) {
      currentYear.push(yearAdded);
      this.setState({year: currentYear})
    } else
      alert('Invalid Year: ' + chip);
    this.handleSubmit();
  }

  /* Handle deleting major from search. */
  handleDelYear(chip, index) {
    var currentYear = this.state.year;
    currentYear.splice(index, 1);
    this.setState({year: currentYear})
    this.handleSubmit();
  }

  /* Update search results if the "Before freshman year" checkbox is selected. */
  updateCheckBeforeFreshmanYear() {
    var currentYear = this.state.year
    if (currentYear.includes("Before freshman year"))
      currentYear.splice(currentYear.indexOf("Before freshman year"), 1);
    else
      currentYear.push("Before freshman year")
    this.setState({year: currentYear})
    this.handleSubmit()
  }

  /* Update search results if the "After freshman year" checkbox is selected. */
  updateCheckAfterFreshmanYear() {
    var currentYear = this.state.year
    if (currentYear.includes("After freshman year"))
      currentYear.splice(currentYear.indexOf("After freshman year"), 1);
    else
      currentYear.push("After freshman year")
    this.setState({year: currentYear})
    this.handleSubmit()
  }

  /* Update search results if the "After sophomore year" checkbox is selected. */
  updateCheckAfterSophomoreYear() {
    var currentYear = this.state.year
    if (currentYear.includes("After sophomore year"))
      currentYear.splice(currentYear.indexOf("After sophomore year"), 1);
    else
      currentYear.push("After sophomore year")
    this.setState({year: currentYear})
    this.handleSubmit()
  }

  /* Update search results if the "After junior year" checkbox is selected. */
  updateCheckAfterJuniorYear() {
    var currentYear = this.state.year
    if (currentYear.includes("After junior year"))
      currentYear.splice(currentYear.indexOf("After junior year"), 1);
    else
      currentYear.push("After junior year")
    this.setState({year: currentYear})
    this.handleSubmit()
  }

  /* Sort results based on initial selection of sort method by user. */
  sortInitialResults() {
    var output = [];
    if (this.state.sortBy === "Sort by Company Name") {
      output = this.sortDataByName(this.state.output); 
    }
    else if (this.state.sortBy === "Sort by Views") {
      output = this.sortDatabyViews(this.state.output);
    }
    else if (this.state.sortBy === "Sort by Rating") {
      output = this.sortDataByRating(this.state.output);
    }
    this.setState({output: output});
  }

  /* Sort results based on user selection after search. */
  sortResults(event, index, value) {
    var output = [];
    this.setState({sortBy: value});
    if (value === "Sort by Company Name") {
      output = this.sortDataByName(this.state.output); 
    }
    else if (value === "Sort by Views") {
      output = this.sortDatabyViews(this.state.output);
    }
    else if (value === "Sort by Rating") {
      output = this.sortDataByRating(this.state.output);
    }
    this.setState({output: output});
  }

  /* Menu for sort options. */
  menuSort(sort) {
    const sortMethods = ['Sort by Company Name', 'Sort by Views', 'Sort by Rating']
    return sortMethods.map((name) => (
      <MenuItem
        name={name}
        insetChildren={true}
        checked={sort && sort.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  /* Handles when "Clear" button is pressed by clearing all search filters and displaying no results. */
  handleClickClear = (event, index, major) => {
    this.setState({companyName: ''})
    this.setState({positionName: ''})
    this.setState({location: ''})
    this.setState({maj: []})
    this.setState({year: []})
    this.setState({princetonProgram: []})
    this.setState({output: []});
    this.setState({submitted: false});
  }

  /* Handles when "See All" button is pressed displaying all entries in database. */
  handleAllEntries(event) {
    fetch("/getAllEntries", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => {
        var sortedData = this.sortInitialData(data.results, data.clicks);
        sortedData = this.sortDataByName(sortedData);
        this.setState({output: sortedData}, () => {
          this.handleDataLoaded();
          this.sortInitialResults();
        });
      })
      .catch((error) => {
        console.error(error);
      });

    /* Set state for whether there are results.*/
    if (this.state.output.length > 0)
      this.setState({dataAvailable: [true]});
    else 
      this.setState({dataAvailable: [false]});

    /* Remove quickstart guide after search. */
    if (this.state.quickStart)
      this.setState({quickStart: false});

    this.setState({displayedData: []});
    this.setState({displayMap: false});

    this.setState({allEntries: true}, () => this.clearSearchFields());

    event.preventDefault();
  }

  /* Performs a database search when a search filter has been updated. */
  handleSubmit(event) {
    var json = {"companyName":this.state.companyName,
                  "positionName":this.state.positionName,
                  "location":this.state.location};
    json["major"] = this.state.maj.join("|");
    json["year"] = this.state.year.join("|");
    json["princetonProgram"] = this.state.princetonProgram.join("|");

    fetch("/search", {
      method: "POST",
      body: JSON.stringify(json),
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => {
        var sortedData = this.sortInitialData(data.results, data.clicks);
        sortedData = this.sortDataByName(sortedData);
        this.setState({output: sortedData}, () => {
          this.handleDataLoaded();
          this.sortInitialResults();
        });
      })
      .catch((error) => {
        console.error(error);
      });
    
    /* Set state for whether there are results.*/
    if (this.state.output.length > 0)
      this.setState({dataAvailable: [true]});
    else 
      this.setState({dataAvailable: [false]});

    /* Remove quickstart guide after search. */
    if (this.state.quickStart)
      this.setState({quickStart: false});

    this.setState({displayedData: []});
    this.setState({displayMap: false});

    this.setState({allEntries: false});
    
    if (typeof event !== "undefined")
      event.preventDefault();
  }

  /* Sort data alphabetically by company name and return sorted data */
  sortDataByName(data) {
    data.sort((a,b) => {
      if (a.companyName.toLowerCase() < b.companyName.toLowerCase()) return -1;
      if (a.companyName.toLowerCase() > b.companyName.toLowerCase()) return 1;
      return 0;
    });
    return data;
  }

  /* Sort data by decreasing number of clicks and return sorted data. */
  sortDatabyViews(data) {
    data.sort((a,b) => {
      if (a.totalClicks > b.totalClicks) return -1;
      if (a.totalClicks < b.totalClicks) return 1;
      return 0;
    });
    return data;
  }

  /* Sort data by decreasing rating and return sorted data. */
  sortDataByRating(data) {
    data.sort((a,b) => {
      if (a.rating > b.rating) return -1;
      if (a.rating < b.rating) return 1;
      return 0;
    });
    return data;
  }

  /* Sort search results returned from database and collate by company. */
  sortInitialData(data, clicks) {
    var originalData = data;
    var newData = [];
    var count = 0;

    /* Going through the data, if there is new company, add to data
      add each entry of the new company in data[count] dictionary. */
    for (var i = 0; i < originalData.length; i++) {
      var added = false;
      for (var j = 0; j < newData.length; j++) {
        if (originalData[i].companyName === newData[j].companyName) {
          newData[j].results.push(originalData[i]);
          added = true;
          break;
        }
      }
      if (!added) {
        newData[count] = {};
        newData[count].companyName = originalData[i].companyName;
        newData[count].results = [];
        newData[count].results.push(originalData[i]);
        count++;
      }
    }

    /* Add the totalClick count for each company. */
    for (i = 0; i < newData.length; i++) {
      for (j = 0; j < clicks.length; j++) {
        if (newData[i].companyName === clicks[j].companyName) {
          newData[i].totalClicks = clicks[j].totalClicks;
          break;
        }
      }
    }

    /* Find average rating of each company. */
    for (i = 0; i < newData.length; i++) {
      var length = newData[i].results.length;
      var totalRating = 0;
      for (j = 0; j < length; j++) {
        totalRating += newData[i].results[j].rating;
      }
      newData[i].rating = (totalRating / length);
    }

    /* Order entries by decreasing voteCount. */
    for (i = 0; i < newData.length; i++) {
      for (j = 0; j < newData[i].results.length; j++) {
        newData[i].results.sort((a,b) => {
          if (a.voteCount > b.voteCount) return -1;
          if (a.voteCount < b.voteCount) return 1;
          return 0;
        });
      }
    }
    
    return newData;
  }

  /* Get favorited company information from Company Card Component to update "Favorites" page. */
  getFavorite(favoriteInfo) {
    var mode = favoriteInfo[0];
    var index = favoriteInfo[1];
    var favoriteState = favoriteInfo[2];
    var data;

    /* Update either search results display or other page. */
    if (mode === "search")
      data = this.state.output;
    else
      data = this.state.displayedData;

    var newEntry = data[index];
    var favoriteCompanies = this.state.favoriteCompanies;
    for (var i = 0; i < favoriteCompanies.length; i++) {
      if (favoriteCompanies[i].companyName === data[index].companyName) {
        favoriteCompanies.splice(i, 1);
        break;
      }
    }

    /* Add company to favorites list only if it was favorired. */
    if (favoriteState)
      favoriteCompanies.unshift(newEntry);

    this.setState({ favoriteCompanies });
  }

  /* Get index of entry clicked on and add in reverse order to list of recent searches. */
  getClickedResult(clickInfo) {
    var mode = clickInfo[0];
    var index = clickInfo[1];
    var data;

    /* Update either search results display or other page. */
    if (mode === "search")
      data = this.state.output;
    else
      data = this.state.displayedData;

    var newEntry = data[index];
    var recentCompanies = this.state.recentCompanies;
    for (var i = 0; i < recentCompanies.length; i++) {
      if (recentCompanies[i].companyName === data[index].companyName) {
        recentCompanies.splice(i, 1);
        break;
      }
    }
    recentCompanies.unshift(newEntry);

    /* Show only the ten most recent searches. */
    if (recentCompanies.length > 10)
      recentCompanies.splice(-1, 1);

    this.setState({ recentCompanies });
  }

  /* Display either popular, recent, or favorite companies based on user selection. */
  renderDisplayData(index, key) {
    const mode = "info";
    var favorite = false;
    for (var i = 0; i < this.state.favoriteCompanies.length; i++) {
      if (this.state.displayedData[index].companyName === this.state.favoriteCompanies[i].companyName) {
        favorite = true;
        break;
      }
    }

    /* Display appropriate header. */
    if (index === 0) {
      if (this.state.displayedState === "Popular Companies") {
        var title = "Popular Companies"
        var subtitle = "Check out what other students are looking at on InternView!"
      }
      else if (this.state.displayedState === "Recent Companies") {
        title = "Recent Companies"
        subtitle = "Here are your recently viewed companies!"
      }
      else if (this.state.displayedState === "Favorite Companies") {
        title = "Favorite Companies"
        subtitle = "Here are your favorited companies!"
      }
      return (<div>
                  <Card style={{backgroundColor:muiTheme.palette.accent3Color}} >
                    <CardTitle title={title} titleStyle={{fontWeight:"bold", fontSize:"2.5em",
                    color:muiTheme.palette.alternateTextColor}} subtitle={subtitle} subtitleStyle=
                    {{paddingTop:"1em", fontSize:"1.2em", color:muiTheme.palette.alternateTextColor}} />
                  </Card>
                  <MuiThemeProvider muiTheme={muiTheme}>
                    <CompanyCardComponent
                      key={this.state.displayedData[index].results[0]._id}
                      index={index}
                      data={this.state.displayedData}
                      sendClickedResult={this.getClickedResult}
                      sendFavoriteItem={this.getFavorite}
                      sendRelatedSearch={this.getRelatedSearch}
                      mode={mode}
                      favorite={favorite}
                    />
                  </MuiThemeProvider>
                  </div>
          );
    }
    else {
      return (<MuiThemeProvider muiTheme={muiTheme}>
              <CompanyCardComponent
                key={this.state.displayedData[index].results[0]._id}
                index={index}
                data={this.state.displayedData}
                sendClickedResult={this.getClickedResult}
                sendFavoriteItem={this.getFavorite}
                sendRelatedSearch={this.getRelatedSearch}
                favorite={favorite}
                mode={mode}
              />
            </MuiThemeProvider>
    );
    }
  }

  /* Display map when requested by user. */
  handleMap() {
    this.setState({displayMap: true});
    this.setState({displayedState: 'Map'});
    this.setState({displayedData: []});
    this.setState({output: []});
    this.setState({submitted: false});
    this.setState({allEntries: false});
    this.clearSearchFields();
  }

  /* Update window of map. */
  updateViewport = (viewport) => {
    this.setState({viewport});
  }

  /* Update dimensions of map based on window length of user. */
  updateDimensions() {

    let viewport = {...this.state.viewport};

    let constant = 0;
    if (window.innerWidth >= 1200) constant = 3/4.;
    else if (window.innerWidth >= 992) constant = 2/3.;
    else if (window.innerWidth >= 768) constant = 7/12.;
    else constant = 1.;

    viewport.width=window.innerWidth*constant - 60;
    viewport.height=viewport.width/3.;

    this.setState({viewport:viewport})
  }

  /* Sort search results returned from database for map display. */
  sortMapData(data) {
    var originalData = data;
    var newData = [];

    for (var i = 0; i < originalData.length; i++) {
      newData[i] = {};
      newData[i].companyName = originalData[i].companyName;
      newData[i].results = [originalData[i]];
    }
    return newData;
  }

  /* Create markers for all companies. */
  renderCompanyMarkers () {
    var display = [];
    for (var i = 0; i < this.state.mapData.length; i++) {
      if (this.state.mapData[i].results[0].coordinates.lng !== "" &&
          this.state.mapData[i].results[0].coordinates.lat !== "") {
        display.push(this.renderCompanyMarker(i));
      }
    }
    return (<div>
              {display}
            </div>
      );
  }

  /* Create a CompanyPin for given company. */
  renderCompanyMarker(index) {
    var data = this.state.mapData[index].results;
    return (
      <Marker key={data.companyName}
        longitude={data[0].coordinates.lng}
        latitude={data[0].coordinates.lat} >
        <CompanyPin size={20} onClick={() => this.setState({companyPinInfo: index})} />
      </Marker>
    );
  }

  /* Render CompanyPinInfo to display company name and position name as a button. */
  renderCompanyPinInfo() {
    if (this.state.mapData.length > 0) {
      const {companyPinInfo} = this.state;
      var info = [this.state.mapData, companyPinInfo];
      return companyPinInfo && (
        <Popup tipSize={5}
          anchor="top"
          longitude={this.state.mapData[companyPinInfo].results[0].coordinates.lng}
          latitude={this.state.mapData[companyPinInfo].results[0].coordinates.lat}
          onClose={() => this.setState({companyPinInfo: ''})} >
          <CompanyPinInfo info={info} sendRelatedSearch={this.getRelatedSearch} />
        </Popup>
      );
    }
  }

  /* Render map with pins for each company in database. */
  renderMap() {
    const navStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: '10px'
    };

    if (this.state.mapData.length === 0) {
      fetch("/mapData", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          var sortedData = this.sortMapData(data);
          this.setState({mapData: sortedData});
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (this.state.displayMap) {
      const mapStyle = 'mapbox://styles/branmay98/cjgx5x8ng000d2rpaxl0xx4aq';
      var title = this.state.quickStart ? 'Welcome to InternView!' : 'Companies Map'
      var subtitle =  this.state.quickStart ? 'Read more below about our features or start searching to get started!' : 'Check out where other students on InternView have worked!'
      return (<div><Card style={{backgroundColor:muiTheme.palette.accent3Color, marginBottom:10}} >
                    <CardTitle title={title} titleStyle={{fontWeight:"bold", fontSize:"2.5em",
                    color:muiTheme.palette.alternateTextColor}} subtitle={subtitle} subtitleStyle=
                    {{paddingTop:"1em", fontSize:"1.2em", color:muiTheme.palette.alternateTextColor}} />
                  </Card>
              <ReactMapGL
                {...this.state.viewport}
                mapStyle={mapStyle}
                mapboxApiAccessToken={MAPBOX_TOKEN}
                onViewportChange={(viewport) => this.setState({viewport})}
              >
              {this.renderCompanyMarkers()}
              {this.renderCompanyPinInfo()}
              <div className="nav" style={navStyle}>
                <NavigationControl onViewportChange={this.updateViewport} />
              </div>
              </ReactMapGL>
              </div>
        );
    }
  }

  /* Check if inputString has number. */
  hasNumber(inputString) {
    return /\d/.test(inputString);
  }

  /* Display survey and timer based on whether user has completed survey before. */
  renderSurveyUserLogin() {
    if (!this.state.surveyChecked) {
      fetch("/userSurvey", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json())
          .then(data => {
            // If the response is a time, then set the countdown for this time. 
            if (this.hasNumber(data.res)) {
              this.setState({surveyOpen: true}, () => this.setState({surveyChecked: true}));
              this.setState({waitTime: data.res});
            }
            else if (data.res === "no") { // should be check for "no"? error handling??
              this.setState({surveyOpen: false}, () => this.setState({surveyChecked: true})); // IDK
            }
          })
          .catch((error) => {
            console.error(error);
          });
    }

    /* Get the user's recent and favorited companies as well as name or netid to display. */
    if (!this.state.userData) {
      fetch("/getUserInfo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          var sortedRecentData = this.sortInitialData(data[0].recentSearches, []);
          var sortedFavoritesData = this.sortInitialData(data[0].favoriteCompanies, []);
          this.setState({studentName: data[0].netid}, () => this.setState({userData: true}));
          this.setState({recentCompanies: sortedRecentData});
          this.setState({favoriteCompanies: sortedFavoritesData});
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  /* Close survey when timer is done. */
  handleCountdownEnd() {
    this.setState({waitTime: ''});
    this.setState({surveyOpen: false});
  }

  /* Show countdown timer. */
  renderWaitTime() {
    if (this.hasNumber(this.state.waitTime)) {
      var endDate = Date.now();
      endDate += this.state.waitTime;
      endDate = new Date(endDate);
      return (<div>
                <Grid style={{paddingTop:20}} >
                <Row>
                <Col xs="12" style={{ marginBottom:20}} >
                <Card style={{backgroundColor:muiTheme.palette.primary1Color}} >
                <CardTitle title={"Welcome to InternView!"} 
                  titleStyle={{fontWeight:"bold", fontSize:"2.5em", color:muiTheme.palette.alternateTextColor}} 
                /> 
                </Card> 
                </Col>
                </Row>
                <Row>
                <Col xs="12">
                <Card>
                <CardTitle title={<ReactMomentCountDown
                    toDate={endDate}
                    sourceFormatMask='YYYY-MM-DD HH:mm:ss'
                    targetFormatMask='\Y\o\u \h\a\v\e D \d\a\y\s H \h\o\u\r\s mm \m\i\n\u\t\e\s s \s\e\c\o\n\d\s\ \l\e\f\t!'
                    onCountdownEnd={this.handleCountdownEnd}
                    />} 
                    titleStyle={{fontWeight:"bold", fontSize:"2.5em", color:muiTheme.palette.primary1Color}}
                    subtitle={"What's this?"} 
                    subtitleStyle={{paddingTop:"1em", fontSize:"1.2em"}}
                    actAsExpander={true} showExpandableButton={true}/>
                <CardText expandable={true}>
                  <p><b>Before we give you access to our site</b>, you'll need you to do one of two things. </p>
                  <p>Have internship experience? Awesome! <b>Please fill out the below questions about your internship experience</b>
                  as truthfully and completely as possible. This is a <b>one-time entrance fee</b>, and afterwards, you'll always have
                  full access to the new data that flows through our site.</p><p>Don't have internship experience? Unfortunately,
                  you'll need to wait a <b>two week hold period</b>. Why the hold period, you ask? Since our site relies entirely on
                  user data, we need users to provide data for our site to grow and develop. Come back to InternView in two weeks, and
                  you'll be able to <b>gain full access</b> to our site!</p>
                  <p>Sincerely,</p>
                  <p>The InternView Team</p>
                </CardText>
                </Card> 
                </Col>
                </Row>
                </Grid>  
              </div>
        )
    }
  }

  /* Check whether to display survey to user. */
  getSurveyStatus(surveyDone) {
    if (surveyDone) {
      this.setState({surveyOpen: false});
    }
  }  
  
  /* Display survey using the Survey component. */
  renderSurvey() {
    if (this.state.surveyOpen) {
      return (
      <div style={{width: "100%", marginTop: 0, minHeight:"100vh", backgroundImage:`url(${bgURL})`}}>
          <Toolbar style={{noGutter:true, backgroundColor:myMuiTheme.palette.primary1Color}}>
            <ToolbarGroup firstChild={true}>
              <ToolbarTitle text="InternView"  style={{fontWeight:'bold', color:myMuiTheme.palette.alternateTextColor, left: '1em'}}/>
            </ToolbarGroup>
            <ToolbarGroup >
              <a href="/info.html">
              <IconButton touch={true} tooltip="Info"><FontIcon className="material-icons" hoverColor=
              {myMuiTheme.palette.accent1Color} color={myMuiTheme.palette.alternateTextColor}>info_outline</FontIcon>
              </IconButton>
              </a>
              <a href="/logout">
              <IconButton touch={true} tooltip="Logout"><FontIcon className="material-icons" hoverColor=
              {myMuiTheme.palette.accent1Color} color={myMuiTheme.palette.alternateTextColor}>power_settings_new</FontIcon>
              </IconButton>
              </a>
            </ToolbarGroup>
          </Toolbar>
          {this.renderWaitTime()}<br />
      <Survey sendSurveyStatus={this.getSurveyStatus} />
      </div>
      );
    }
  }

  /* Get list of top ten most popular companies from database. */
  renderInitialInfo() {
    if (!this.state.pageLoaded) {
      fetch("/popularCompanies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          var sortedData = this.sortInitialData(data, []);
          this.setState({popularCompanies: sortedData});
          this.setState({pageLoaded: true});
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  /* Display popular companies upon user request. */
  handlePopularCompanies() {
    var popularCompanies = this.state.popularCompanies;
    this.setState({displayedState: 'Popular Companies'})
    this.setState({displayedData: popularCompanies});
    this.setState({output: []});
    this.setState({submitted: false});
    this.setState({allEntries: false});
    this.setState({displayMap: false});

    /* Remove quickstart guide if it is being displayed. */
    if (this.state.quickStart)
      this.setState({quickStart: false});

    this.clearSearchFields();
  }

  /* Show specific title card if no recent companies are available for user. */
  renderNoRecentCompanies() {
    if ((this.state.recentCompanies.length === 0) && (this.state.displayedState === "Recent Companies") && !this.state.submitted) {
      var title = "Recent Companies";
      var subtitle = "No recently viewed companies!";
      return (<Card style={{backgroundColor:muiTheme.palette.accent3Color}} >
                <CardTitle title={title} titleStyle={{fontWeight:"bold", fontSize:"2.5em",
                color:muiTheme.palette.alternateTextColor}} subtitle={subtitle} subtitleStyle=
                {{paddingTop:"1em", fontSize:"1.2em", color:muiTheme.palette.alternateTextColor}} />
              </Card>);
    }
  }

  /* Display recent companies upon user request. */
  handleRecentCompanies() {
    var recentCompanies = this.state.recentCompanies;
    this.setState({displayedState: 'Recent Companies'})
    this.setState({displayedData: recentCompanies});
    this.setState({output: []});
    this.setState({submitted: false});
    this.setState({allEntries: false});
    this.setState({displayMap: false});

    /* Remove quickstart guide if it is being displayed. */
    if (this.state.quickStart)
      this.setState({quickStart: false});

    this.clearSearchFields();
  }

  /* Show specific title card if no favorite companies are available for user. */
  renderNoFavoriteCompanies() {
    if ((this.state.favoriteCompanies.length === 0) && (this.state.displayedState === "Favorite Companies") && !this.state.submitted) {
      var title = "Favorite Companies";
      var subtitle = "No favorite companies!";
      return (<Card style={{backgroundColor:muiTheme.palette.accent3Color}} >
                <CardTitle title={title} titleStyle={{fontWeight:"bold", fontSize:"2.5em",
                color:muiTheme.palette.alternateTextColor}} subtitle={subtitle} subtitleStyle=
                {{paddingTop:"1em", fontSize:"1.2em", color:muiTheme.palette.alternateTextColor}} />
              </Card>);
    }
  }

  /* Display favorite companies upon user request. */
  handleFavoriteCompanies() {
    var favoriteCompanies = this.state.favoriteCompanies;
    this.setState({displayedState: 'Favorite Companies'})
    this.setState({displayedData: favoriteCompanies});
    this.setState({output: []});
    this.setState({submitted: false});
    this.setState({allEntries: false});
    this.setState({displayMap: false});

    /* Remove quickstart guide if it is being displayed. */
    if (this.state.quickStart)
      this.setState({quickStart: false});

    this.clearSearchFields();
  }

  /* Display quick start guide when user first accesses the site. */
  renderQuickStart() {
    if (this.state.quickStart) {
      return(
        <Grid fluid={true} style={{paddingTop:20, width:"95%"}} >
        <Row>
        <Col sm="6"><Card style={{width:"100%", marginBottom:10}} zdepth={2}>
          <CardHeader
          title="Search by Popular"
          subtitle="Click the trending icon to see some popular internships among Princeton students!"
          avatar={POP_IMG_URL}
          />
        </Card>
        </Col>

        <Col sm="6"><Card style={{width:"100%", marginBottom:10}} zdepth={2}>
          <CardHeader
          title="Search by Favorites"
          subtitle="Click the heart icon to see internships that you've favorited!"
          avatar={FAV_IMG_URL}
          />
        </Card>
        </Col>
        <Col sm="6"><Card style={{width:"100%"}} zdepth={2}>
          <CardHeader
          title="Search by Recents"
          subtitle="Click the recent icon to see internships you've previously viewed!"
          avatar={RECENT_IMG_URL}
          />
        </Card>
        </Col>
        <Col sm="6"><Card style={{width:"100%"}} zdepth={2}>
          <CardHeader
          title="Info"
          subtitle="Click the info icon for more information regarding !the Internview team!"
          avatar={INFO_IMG_URL}
          />
        </Card>
        </Col>
        </Row>
        </Grid>);
    }
  }

  /* Render each search result as a CompanyCardComponent. */
  renderData(index, key) {
    const mode = "search";
    var favorite = false;

    /* Send whether this company has been favorited by user. */
    for (var i = 0; i < this.state.favoriteCompanies.length; i++) {
      if (this.state.output[index].companyName === this.state.favoriteCompanies[i].companyName) {
        favorite = true;
        break;
      }
    }

    return (<MuiThemeProvider muiTheme={muiTheme}>
              <CompanyCardComponent
                key={this.state.output[index].results[0]._id}
                index={index}
                data={this.state.output}
                sendClickedResult={this.getClickedResult}
                sendFavoriteItem={this.getFavorite}
                sendRelatedSearch={this.getRelatedSearch}
                mode={mode}
                favorite={favorite}
              />
            </MuiThemeProvider>
    );
  }

  /* Make sure data is loaded before displaying number of results. */
  handleDataLoaded() {
    this.setState({submitted: true});
  }

  /* Display the number of search results returned from database. */
  renderNumResults() {
    /* Check if search has occurred before displaying the number of results. */
    if (this.state.submitted && ((this.state.companyName !== '' || this.state.positionName !== '' ||
        this.state.location !== '' || this.state.maj.length !== 0 || this.state.princetonProgram.length !== 0 ||
        this.state.year.length !== 0) || this.state.allEntries)) {
      var numResults = "";
      if (this.state.output.length > 1)
        numResults += this.state.output.length + " companies found:";
      else if (this.state.output.length === 1)
        numResults += "1 company found:";
      else
        numResults += "Sorry, no results."
      return (<Card style={{backgroundColor:muiTheme.palette.accent3Color}}>
                <Grid fluid={true} style={{padding:0}}>
                <Row>
                <Col sm="12" md="8">
                <CardTitle title={"Search Results:"} titleStyle={{fontWeight:"bold", fontSize:"2.5em",
                color:muiTheme.palette.alternateTextColor}} subtitle={numResults} subtitleStyle=
                {{paddingTop:"1em", fontSize:"1.2em", color:muiTheme.palette.alternateTextColor}} /> 
                </Col>
                <Col sm="12" md="4" style={{marginTop:"4em"}} >
                <SelectField value={this.state.sortBy} labelStyle={{color:muiTheme.palette.alternateTextColor}}
                style={{float:"right"}} onChange={this.sortResults}>
                  {this.menuSort(this.state.sortBy)}
                </SelectField>
                </Col>
                </Row>
                </Grid>
              </Card>
              );
    }
  }

  /* Display search filters. */
  renderSearch() {
    if (!this.state.surveyOpen && this.state.surveyChecked && this.state.userData) {
      const greeting = "Hi " + this.state.studentName + "!";
      const maxLength = "100";
      const left = {
        paddingTop:5,
        paddingBottom:5,
        margin:0
      };
      var scrollType = this.state.quickStart ? "none" : "auto";

      const searchStyle = {paddingLeft: "5%", paddingRight:"10%", paddingTop:10, paddingBottom:30, marginBottom:0}
      return (
        <div style={{width: "100%", marginTop: 0, height:"100%", overflowY:"hidden", overflowX:"hidden",
          /*backgroundColor: myMuiTheme.palette.offWhite*/
          backgroundImage:`url(${bgURL})`
        }}> 
        <Grid fluid={true} style={{padding:0}} >
        <Row>
        <Col xs="12" smHidden mdHidden lgHidden> 
          <Navbar inverse collapseOnSelect fluid={true} style={{paddingTop:0, verticalAlign:"middle",
          backgroundColor:myMuiTheme.palette.primary1Color}} >
            <Navbar.Header>
              <Navbar.Brand style={{fontWeight:'bold', color:myMuiTheme.palette.alternateTextColor, left: '1em'}}>
                InternView
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                <NavItem onClick={this.handleMap}><FontIcon style={{display:"inline"}} className="material-icons"
                color={myMuiTheme.palette.accent1Color}>my_location</FontIcon>
                <span style={{fontSize:18}} > &emsp;Map</span></NavItem>
                <NavItem onClick={this.handlePopularCompanies}><FontIcon style={{display:"inline"}}
                className="material-icons"  color={myMuiTheme.palette.accent1Color}>trending_up</FontIcon>
                <span style={{fontSize:18}} > &emsp;Popular</span></NavItem>
                <NavItem onClick={this.handleRecentCompanies}><FontIcon style={{display:"inline"}}
                className="material-icons"  color={myMuiTheme.palette.accent1Color}>history</FontIcon>
                <span style={{fontSize:18}} > &emsp;Recents</span></NavItem>
                <NavItem onClick={this.handleFavoriteCompanies}><FontIcon style={{display:"inline"}}
                className="material-icons"  color={myMuiTheme.palette.accent1Color}>favorite_border</FontIcon>
                <span style={{fontSize:18}} > &emsp;Favorites</span></NavItem>
                <NavItem href="/info.html">
                <FontIcon style={{display:"inline"}} className="material-icons"  color={myMuiTheme.palette.accent1Color}>info_outline</FontIcon>
                <span style={{fontSize:18}} > &emsp;Info</span></NavItem>
                <NavItem href="/logout">
                <FontIcon style={{display:"inline"}} className="material-icons"  color={myMuiTheme.palette.accent1Color}>power_settings_new</FontIcon>
                <span style={{fontSize:18}} > &emsp;Logout</span>
                </NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Col>
        <Col xsHidden md="12">
          <Toolbar style={{noGutter:true, backgroundColor:myMuiTheme.palette.primary1Color}}>
            <ToolbarGroup firstChild={true}>
              <ToolbarTitle text="InternView" style={{fontWeight:'bold', color:myMuiTheme.palette.alternateTextColor, left: '1em'}}/>
            </ToolbarGroup>
            <ToolbarGroup >
              <FlatButton label={greeting} disabled={true} labelStyle={{color:myMuiTheme.palette.alternateTextColor}}/>
              <IconButton touch={true} tooltip="Map" onClick={this.handleMap}><FontIcon className="material-icons"
              hoverColor={myMuiTheme.palette.accent1Color} color={myMuiTheme.palette.alternateTextColor}>my_location</FontIcon>
              </IconButton>
              <IconButton touch={true} type="submit" onClick={this.handlePopularCompanies} tooltip="Popular">
              <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.accent1Color}
              color={myMuiTheme.palette.alternateTextColor}>trending_up</FontIcon>
              </IconButton>
              <IconButton touch={true} type="submit" onClick={this.handleRecentCompanies} tooltip="Recents">
              <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.accent1Color}
              color={myMuiTheme.palette.alternateTextColor}>history</FontIcon>
              </IconButton>
              <IconButton touch={true} type="submit" onClick={this.handleFavoriteCompanies} tooltip="Favorites">
              <FontIcon className="material-icons" hoverColor={myMuiTheme.palette.accent1Color}
              color={myMuiTheme.palette.alternateTextColor}>favorite_border</FontIcon>
              </IconButton>
              <a href="/info.html">
              <IconButton touch={true} tooltip="Info"><FontIcon className="material-icons"
              hoverColor={myMuiTheme.palette.accent1Color} color={myMuiTheme.palette.alternateTextColor}>info_outline</FontIcon>
              </IconButton>
              </a>
              <a href="/logout">
              <IconButton touch={true} tooltip="Logout"><FontIcon className="material-icons"
              hoverColor={myMuiTheme.palette.accent1Color} color={myMuiTheme.palette.alternateTextColor}>power_settings_new</FontIcon>
              </IconButton>
              </a>
            </ToolbarGroup>
          </Toolbar>
        </Col>
        </Row>
        </Grid>
      <Grid fluid={true} style={{paddingTop:"1em"}}>
      <Row className="show-grid">
        <Col xs="12" sm="5" md="4" lg="3">
        <Card style={searchStyle} zdepth={5}>      
        <h3 style={{color:muiTheme.palette.primary1Color}}>Start typing to search! </h3>         
          <AutoComplete
            hintText="Company Name (e.g. Google)"
            hintStyle={{fontWeight:"bold"}}
            style={left}
            fullWidth={true}
            filter={AutoComplete.fuzzyFilter}
            dataSource={this.state.comDataSource}
            onUpdateInput={this.handleFormComAutoComplete}
            onNewRequest={this.handleComAutoCompleteSelect}
            maxSearchResults={5}
            maxLength={maxLength}
            searchText={this.state.companyName}
          />
          <AutoComplete
            hintText="Position (e.g. Research Intern)"
            hintStyle={{fontWeight:"bold"}}
            style={left}
            fullWidth={true}
            filter={AutoComplete.fuzzyFilter}
            dataSource={this.state.posDataSource}
            onUpdateInput={this.handleFormPosAutoComplete}
            onNewRequest={this.handlePosAutoCompleteSelect}
            maxSearchResults={5}
            maxLength={maxLength}
            searchText={this.state.positionName}
          />
          <ChipInput
            hintText="Major (e.g. COS)"
            hintStyle={{fontWeight:"bold"}}
            style={left}
            fullWidth={true}
            value = {this.state.maj}
            onRequestAdd={(chip) => this.handleAddMajor(chip)}
            onRequestDelete={(chip, index) => this.handleDelMajor(chip, index)}
            dataSource={majors}
            maxSearchResults={5}
          />
          <ChipInput
            hintText="Princeton Program (e.g. IIP)"
            hintStyle={{fontWeight:"bold"}}
            style={left}
            fullWidth={true}
            fullWidthInput={true}
            value = {this.state.princetonProgram}
            onRequestAdd={(chip) => this.handleAddPpgm(chip)}
            onRequestDelete={(chip, index) => this.handleDelPpgm(chip, index)}
            dataSource={princetonProgramAns}
            maxSearchResults={5}
            chipRenderer={({ value, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
              <Chip
                key={key}
                style={{ margin: '8px 8px 0 0', float: 'left', pointerEvents: isDisabled ? 'none' : undefined }}
                onTouchTap={handleClick}
                onRequestDelete={handleRequestDelete}
                labelStyle={{overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px"}}
              >
                {value}
              </Chip>)}
          />
          <AutoComplete
            hintText="Location (e.g. New York City)"
            hintStyle={{fontWeight:"bold"}}
            style={left}
            fullWidth={true}
            filter={AutoComplete.fuzzyFilter}
            dataSource={this.state.locDataSource}
            onUpdateInput={this.handleFormLocAutoComplete}
            onNewRequest={this.handleLocationAutoCompleteSelect}
            maxLength={maxLength}
            maxSearchResults={5}
            searchText={this.state.location}
          /><br/><br/>
          <Checkbox
            label="Before freshman year"
            checked={this.state.year.includes("Before freshman year")}
            onCheck={this.updateCheckBeforeFreshmanYear}
            />
          <Checkbox
            label="After freshman year"
            checked={this.state.year.includes("After freshman year")}
            onCheck={this.updateCheckAfterFreshmanYear}
            />
          <Checkbox
            label="After sophomore year"
            checked={this.state.year.includes("After sophomore year")}
            onCheck={this.updateCheckAfterSophomoreYear}
            />
          <Checkbox
            label="After junior year"
            checked={this.state.year.includes("After junior year")}
            onCheck={this.updateCheckAfterJuniorYear}
            />

          <br />
        <RaisedButton label="See All" primary={true} style={{"float":"left", marginLeft:"10%"}} onClick={this.handleAllEntries}/>
        <RaisedButton label="Clear" labelColor={myMuiTheme.palette.alternateTextColor}
        style={{ float:"right", marginRight:"10%"}} backgroundColor={myMuiTheme.palette.warning} onClick={this.handleClickClear}/><br />        
         </Card>
      </Col>
      <Clearfix style={{height:630}} visibleXsBlock></Clearfix>
      <Col xs="12" sm="7" md="8" lg="9" style={{height:"91vh", overflow:scrollType }}>
      <div>
      <div style={this.state.resultsStyle}>
        {this.renderMap()}
        {this.renderQuickStart()}
        {this.renderInitialInfo()}
        {this.renderNoRecentCompanies()}
        {this.renderNoFavoriteCompanies()}
        <ReactList
          itemRenderer={this.renderDisplayedData}
          length={this.state.displayedData.length}
          type='simple'
        />
        {this.renderNumResults()}
        <ReactList
          itemRenderer={this.renderData}
          length={this.state.output.length}
          type='simple'
          style={{overflowY: 'auto'}}
        />
      </div>   
      </div>
      </Col>
      </Row>
      </Grid>
      <br />
    </div>
        );
    }
  }

  /* Render site. */
  render() {
    return (<div>
      {this.renderSurveyUserLogin()}
      {this.renderSurvey()}
      {this.renderSearch()}
      </div>
    );
  }
}

export default SearchForm;