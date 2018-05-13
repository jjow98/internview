// Created in blissful unison between Jason and Audrey

import React from 'react';
import {Step, Stepper, StepButton, StepContent} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import myMuiTheme from './myMuiTheme';
import Paper from 'material-ui/Paper';
import ValidatorForm from './ValidatorForm.jsx';
import AutoCompleteValidator from './AutoCompleteValidator.jsx';
import AutoComplete from 'material-ui/AutoComplete';
import SelectValidator from './SelectValidator.jsx';
import TextValidator from './TextValidator.jsx';
import MenuItem from 'material-ui/MenuItem';
import StarRatings from 'react-star-ratings';
import { Grid, Row, Col } from 'react-bootstrap';
import Color from 'color';
import Snackbar from 'material-ui/Snackbar';

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
'International Internship Program (IIP)', 'Interfaith Internship Program', 'International Research Exchange Program (REACH)',
'John C. Bogle \'51 Fellows in Civic Service', 'Keller Center', 'Princeton Environmental Institute',
'Princeton Internships in Civic Service (PICS)', 'Princeton in Asia', 'Princeton in France', 'Princeton in Ishikawa',
'Princeton Program in Hellenic Studies', 'Princeton Start-Up Immersion Program (PSIP)', 'Princeton University Preparatory Program',
'Research on Campus', 'Scholars in the Nation\'s Service', 'Streicker International Fellows Fund']
const interviewAns = ['Yes', 'No'];
const numberOfInterviewsAns = ['1', '2', '3', '4', '5', 'More than 5'];
const relatedFields = ['Arts, Culture & Design', 'Consulting', 'Entrepreneurships & Startups', 'Human Resources & Organizational Development',
'Advertising, Marketing, Journalism, and Public Relations', 'Education & Teaching', 'Engineering', 'Programming, Software Development and Information Technology',
'Health Care, Nutrition, and Public Health', 'Mathematics, Life & Physical Sciences', 'Nonprofit & Social Services', 'Finance, Real Estate & Insurance']

class Survey extends React.Component 
{
	constructor(props) 
	{
		super(props)
		this.state = 
		{
			stepIndex: 0,
			comDataSource: [], // company autocomplete array
      posDataSource: [], // position autocomplete array
      locDataSource: [], // location autocomplete array
      surveyData: {      // User survey data
        companyName: '',
        positionName: '',
        major: '',
        classYear: '',
        relatedField: '',
        year: '',
        apply: '',
        throughPrinceton: false,
        princetonProgram: '',
        interview: '',
        interviewAvailable: false,
        numberOfInterviews: '',
        questions: '',
        howDidYouPrepare: '',
        recommendations: '',
        location: '',
        duration: '',
        classesToPrepare: '',
        averageDay: '',
        overallExperience: '',
        salary: '',
        advice: '',
        anythingElse: '',
        rating: 5,
        color: Color.hsl(123, 46, 34)
      },
      waitTime: '', // Time for waiting period, displayed on top of survey
      surveySubmitted: false, // If the survey is submitted/redirected
      surveyRedirect: false,

      // If the pages are submitted correctly
      submitted0: false,
      submitted1: false,
      submitted2: false,
      submitted3: false,
      submitted4: false,

      // Showing warning if invalid answers
      showWarning: false,
		};
		this.handleSurveyComAutoComplete = this.handleSurveyComAutoComplete.bind(this);
		this.handleCompanyAutoComplete = this.handleCompanyAutoComplete.bind(this);

		this.handleSurveyPosAutoComplete = this.handleSurveyPosAutoComplete.bind(this);
		this.handlePositionAutoComplete = this.handlePositionAutoComplete.bind(this);

		this.handleSurveyLocAutoComplete = this.handleSurveyLocAutoComplete.bind(this);
		this.handleLocationAutoComplete = this.handleLocationAutoComplete.bind(this);

		this.handleSurveyChange = this.handleSurveyChange.bind(this);
		this.handleSubmit0 = this.handleSubmit0.bind(this);
		this.handleSubmit1 = this.handleSubmit1.bind(this);
		this.handleSubmit2 = this.handleSubmit2.bind(this);
		this.handleSubmit3 = this.handleSubmit3.bind(this);
		this.handleSubmit4 = this.handleSubmit4.bind(this);

		this.handleOnClick = this.handleOnClick.bind(this);
    this.changeRating = this.changeRating.bind(this);
		
	}

  /* Return the occurence of the most common element in words. */
  mostCommonWordCount(words) {
    var frequency = {};  // array of frequency.
    var max = 0;  // holds the max frequency.
    for(var word in words) {
      frequency[words[word]]=(frequency[words[word]] || 0)+1; // increment frequency.
      if(frequency[words[word]] > max) { // is this frequency > max so far ?
              max = frequency[words[word]];  // update max.
      }
    }
    return max;
  }

  // After rendered, but before displaying to user
  componentDidMount() {
    /* Custom validation rule to check for multiple words. */
    ValidatorForm.addValidationRule('hasMultipleWords', (value) => {
      var words = value.split(" ");
      if (words.length < 10) {
          return false;
      }

      if (this.mostCommonWordCount(words) > 20) {
        return false;
      }

      return true;
    });
  }

  // Changing the color of the rating based on user selection
  changeRating(newRating) {
    var badgeColor = colorAt(newRating);

    var surveyData = this.state.surveyData;
    surveyData["rating"] = newRating;
    surveyData["color"] = badgeColor;
    this.setState({ surveyData });
  }

	// Returns options in the menu based on current year. 
  menuClassYears(classYear) {
    var classYears = [];
    for (var i = 0; i < 4; i++) {
      classYears[i] = new Date().getFullYear() + i + "";
    }
    return classYears.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={classYear && classYear.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in the menu based on the related field
  menuRelatedField(relatedField) {
    return relatedFields.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={relatedField && relatedField.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in the menu based on the major
	menuMajors(maj) {
    return majors.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={maj && maj.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in the menu based on the year 
  menuTimes(year) {
    return years.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={year && year.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in the menu based on the application method
	menuApply(apply) {
    const applyMethods = ['Online', 'Career Fair', 'Handshake', 'Princeton Program', 'Other']
    return applyMethods.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={apply && apply.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in the menu based on the princeton program type
  menuPrincetonProgram(princetonProgram) {
    return princetonProgramAns.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={princetonProgram && princetonProgram.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in teh menu based on the Interview yes/no
  menuInterview(interview) {
    return interviewAns.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={interview && interview.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  // Returns options in teh menu based on the number of interviews
  menuNumberOfInterviews(numberOfInterviews) {
    return numberOfInterviewsAns.map((name) => (
      <MenuItem
        key={name}
        insetChildren={true}
        checked={numberOfInterviews && numberOfInterviews.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

	/* Handle change for survey input. */
  handleSurveyChange(event) {
    var surveyData = this.state.surveyData;
    surveyData[event.target.name] = event.target.value;
    this.setState({ surveyData });
  }

  /* Handle class year selection for survey. Changes the surveyData state */
  handleSurveyClassChange = (event, index, classYear) => {
    var surveyData = this.state.surveyData;
    surveyData["classYear"] = classYear;
    this.setState({ surveyData });
  }

  /* Handle industry selection for survey. Changes the surveyData state */
  handleSurveyRelatedFieldChange = (event, index, relatedField) => {
    var surveyData = this.state.surveyData;
    surveyData["relatedField"] = relatedField;
    this.setState({ surveyData });
  }

  /* handle internship year selection for survey. Changes the surveyData state */
  handleSurveyYearChange = (event, index, year) => {
    var surveyData = this.state.surveyData;
    surveyData["year"] = year;
    this.setState({ surveyData });
  }

  /* Handle major selection for survey. Changes the surveyData state */
  handleSurveyMajorChange = (event, index, major) => {
    var surveyData = this.state.surveyData;
    surveyData["major"] = major;
    this.setState({ surveyData });
  }

  /* Handle application method selection for survey. Changes the surveyData state */
  handleSurveyApplyChange = (event, index, apply) => {
    var surveyData = this.state.surveyData;
    surveyData["apply"] = apply;
    this.setState({ surveyData });
    if (index === 3) {
      surveyData["throughPrinceton"] = true;
    }
    else {
      surveyData["throughPrinceton"] = false;
    }
    this.setState({ surveyData });
  }

  /* Handle selection of Princeton program on survey. Changes the surveyData state */
  handleSurveyPrincetonProgram = (event, index, princetonProgram) => {
    var surveyData = this.state.surveyData;
    surveyData["princetonProgram"] = princetonProgram;
    this.setState({ surveyData });
  }

  /* Handle selection for whether person interviewed or not in survey. Changes the surveyData state */
  handleSurveyInterviewChange = (event, index, interview) => {
    var surveyData = this.state.surveyData;
    surveyData["interview"] = interview;
    if (index === 0) {
      surveyData["interviewAvailable"] = true;
    }
    else {
      surveyData["interviewAvailable"] = false;
    }
    this.setState({ surveyData });
  }

  /* Get autocomplete results for "Company Name" search from database given the searchText*/
  handleCompanyAutoComplete(searchText) {
    const json = {companyName: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({comDataSource: data}));
  }

  /* Handle autocomplete for survey for "Company Name" with the searchText */
  handleSurveyComAutoComplete(searchText) {
    var surveyData = this.state.surveyData;
    surveyData["companyName"] = searchText;
    this.setState({ surveyData });
    this.handleCompanyAutoComplete(searchText);
  }

  /* Get autocomplete results for "Position Name" search from database given the searchText*/
  handlePositionAutoComplete(searchText) {
    const json = {positionName: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({posDataSource: data}));
  }

	/* Handle autocomplete for survey for "Position Name" with the searchText*/
  handleSurveyPosAutoComplete(searchText) {
    var surveyData = this.state.surveyData;
    surveyData["positionName"] = searchText;
    this.setState({ surveyData });
    this.handlePositionAutoComplete(searchText);
  }

	/* Get autocomplete results for "Location" search from database given the searchText */
  handleLocationAutoComplete(searchText) {
    const json = {location: searchText}
    fetch("/autocomplete", {
      method: "POST",
      body: JSON.stringify(json),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json())
      .then(data => this.setState({locDataSource: data}));
  }

	/* Handle autocomplete for survey for "Location" with the searchText */
  handleSurveyLocAutoComplete(searchText) {
    var surveyData = this.state.surveyData;
    surveyData["location"] = searchText;
    this.setState({ surveyData });
    this.handleLocationAutoComplete(searchText);
  }

  /* Handle application method selection for survey. Changes the surveyData state*/
  handleSurveyApplyChange = (event, index, apply) => {
    var surveyData = this.state.surveyData;
    surveyData["apply"] = apply;
    this.setState({ surveyData });
    if (index === 3) {
      surveyData["throughPrinceton"] = true;
    }
    else {
      surveyData["throughPrinceton"] = false;
      surveyData["princetonProgram"] = "";
    }
    this.setState({ surveyData });
  }

  /* Handle selection for number of interview rounds on survey. Changes the surveyData state*/
  handleSurveyNumberofInterviewsChange = (event, index, numberOfInterviews) => {
    var surveyData = this.state.surveyData;
    surveyData["numberOfInterviews"] = numberOfInterviews;
    this.setState({ surveyData });
  }


  // handling the submit of the survey
  handleSurveySubmit() {
    // fetch code to insert survey data
    var surveyData = this.state.surveyData;
    const json = {"companyName": surveyData.companyName, "positionName": surveyData.positionName, "major": surveyData.major,
                  "classYear": surveyData.classYear, "year": surveyData.year, "apply": surveyData.apply, "relatedField": surveyData.relatedField,
                  "princetonProgram": surveyData.princetonProgram, "interview": surveyData.interview,
                  "numberOfInterviews": surveyData.numberOfInterviews, "questions": surveyData.questions,
                  "howDidYouPrepare": surveyData.howDidYouPrepare, "recommendations": surveyData.recommendations,
                  "location": surveyData.location, "duration": surveyData.duration, "classesToPrepare": surveyData.classesToPrepare,
                  "averageDay": surveyData.averageDay, "overallExperience": surveyData.overallExperience,
                  "salary": surveyData.salary, "advice": surveyData.advice, "anythingElse": surveyData.anythingElse, "rating": surveyData.rating};
    if (!this.state.surveySubmitted) {
      fetch("/survey", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json())
        .then(data => {
          if (data.res === "true") {
            this.setState({surveyRedirect: true});
            this.setState({surveySubmitted: true});
          }
          /* If a valid response has been submitted, do not allow further submission. */
          else {
            this.setState({showWarning: true});
          }
        });
    }
  }

  // Determining the state of the snackbar
  handleRequestErrClose = () =>
  {
    this.setState({showWarning: false});
  }

  // Returning the snackbar for invalid inputs
  renderSnack()
  {
    var message = "We have detected one or more errors in your submission. Please ensure that all your answers are correct and contain no inappropriate content.";
    return(<Snackbar
            open={this.state.showWarning}
            message={message}
            bodyStyle={{height: 'auto', lineHeight: '23px'}}
            onRequestClose={this.handleRequestErrClose}
            />
          );
  }

  // Button to submit, appears only on last page
  renderSubmit()
  {
  	if (this.state.stepIndex === 4)
  	{
  		return(
  			<RaisedButton
		  		label="Submit"
		      primary={true}
		      onClick={this.handleSurveySubmit}
		     />);
  	}
  }

	/* Render question about which Princeton program for survey if user did a Princeton program. */
  renderPrincetonProgramQuestion() {
    if (this.state.surveyData.throughPrinceton) {
      return (<div id="princetonProgram">
        <SelectValidator
          name="princetonProgram"
          floatingLabelText="What Princeton program did you work through?"
          value={this.state.surveyData.princetonProgram}
          onChange={this.handleSurveyPrincetonProgram}
          style={{width: 500}}
          validators={['required']}
          errorMessages={['This field is required']}
        >
          {this.menuPrincetonProgram(this.state.surveyData.princetonProgram)}
        </SelectValidator><br />
        </div>
        );
    }
  }

  /* Render questions about interview for survey if user did interview for position. */
  renderSurveyInterviewQuestions() {
    if(this.state.surveyData.interviewAvailable) {
      return (<div id="surveyInterviewQuestions">
        <SelectValidator
          name="numberOfInterviews"
          floatingLabelText="Number of interview rounds?"
          value={this.state.surveyData.numberOfInterviews}
          onChange={this.handleSurveyNumberofInterviewsChange}
          validators={['required']}
          errorMessages={['This field is required']}
          style = {{textColor :'#ffffff'}}
        >
          {this.menuNumberOfInterviews(this.state.surveyData.numberOfInterviews)}
        </SelectValidator><br />
        <TextValidator
          name="questions"
          floatingLabelText="What questions were you asked during your interview(s)? (Please write at least 1-2 sentences, or N/A if not applicable.)"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.questions}
          fullWidth={true}
          multiLine={true}
          validators={['required']}
          errorMessages={['This field is required']}
        /><br />
        <TextValidator
          name="howDidYouPrepare"
          floatingLabelText="What materials did you find helpful in preparing for the interview(s)? (Please write at least 1-2 sentences, or or N/A if not applicable.)"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.howDidYouPrepare}
          fullWidth={true}
          multiLine={true}
          validators={['required']}
          errorMessages={['This field is required']}
        /><br />
        <TextValidator
          name="recommendations"
          floatingLabelText="Do you have any recommendations for preparing for the interview(s)? (Please write at least 1-2 sentences, or N/A if not applicable.)"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.recommendations}
          fullWidth={true}
          multiLine={true}
          validators={['required']}
          errorMessages={['This field is required']}
        /><br />
        </div>
      );
    }
  }


  // first page code when submitting, move the stepindex
  handleSubmit0() {
  	this.setState({submitted0: true})
    const {stepIndex} = this.state;
    this.setState({stepIndex: stepIndex + 1});
  }

  // Returning first page personal information
  renderPersonal()
  {
  	return (
  		<ValidatorForm
        ref="form"
        onSubmit={this.handleSubmit0}
        onError={errors => console.log(errors)}
       >
				<SelectValidator
			    name="major"
			    floatingLabelText="What major are you?"
			    value={this.state.surveyData.major}
			    onChange={this.handleSurveyMajorChange}
			    maxHeight={230}
			    validators={['required']}
			    errorMessages={['This field is required']}
			  >
			    {this.menuMajors(this.state.surveyData.major)}
			  </SelectValidator><br />
			  <SelectValidator
			    name="classYear"
			    floatingLabelText="What class year are you?"
			    value={this.state.surveyData.classYear}
			    onChange={this.handleSurveyClassChange}
			    validators={['required']}
			    errorMessages={['This field is required']}
			  >
			    {this.menuClassYears(this.state.surveyData.classYear)}
			  </SelectValidator><br />
			  <SelectValidator
			    name="year"
			    floatingLabelText="When did the internship occur?"
			    value={this.state.surveyData.year}
			    onChange={this.handleSurveyYearChange}
			    validators={['required']}
			    errorMessages={['This field is required']}
			  >
			    {this.menuTimes(this.state.surveyData.year)}
			  </SelectValidator><br /><br />
			  <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onClick={this.handlePrev}
          style={{marginRight: 12}}
        />
			  <RaisedButton
          label="Next"
          type="submit"
          primary={true}
          onSubmit={this.handleSubmit0}
        />
			 </ValidatorForm>
			 );
  }


  // second page code when submitting, move the stepindex
  handleSubmit1() {
  	this.setState({submitted1: true})
    const {stepIndex} = this.state;
    this.setState({stepIndex: stepIndex + 1});
  }

  // return second page basic information
  renderBasic()
  {
  	return (
  		<ValidatorForm
        ref="form"
        onSubmit={this.handleSubmit1}
        onError={errors => console.log(errors)}
       >
				<AutoCompleteValidator
          name="companyName"
          floatingLabelText="What company/program did you intern at?"
          filter={AutoComplete.fuzzyFilter}
          dataSource={this.state.comDataSource}
          onUpdateInput={this.handleSurveyComAutoComplete}
          value={this.state.surveyData.companyName}
          searchText={this.state.surveyData.companyName}
          maxSearchResults={5}
          fullWidth={true}
          validators={['required', 'maxStringLength:100']}
          errorMessages={['This field is required', 'Please write less than 100 characters.']}
        /><br />
        <AutoCompleteValidator
          name="positionName"
          floatingLabelText="What was the name of the position/role?"
          filter={AutoComplete.fuzzyFilter}
          dataSource={this.state.posDataSource}
          onUpdateInput={this.handleSurveyPosAutoComplete}
          value={this.state.surveyData.positionName}
          searchText={this.state.surveyData.positionName}
          maxSearchResults={5}
          fullWidth={true}
          validators={['required', 'maxStringLength:100']}
          errorMessages={['This field is required', 'Please write less than 100 characters.']}
        /><br />
        <SelectValidator
          name="apply"
          floatingLabelText="How did you apply?"
          value={this.state.surveyData.apply}
          onChange={this.handleSurveyApplyChange}
          validators={['required']}
          errorMessages={['This field is required']}
        >
          {this.menuApply(this.state.surveyData.apply)}
        </SelectValidator><br />
        {this.renderPrincetonProgramQuestion()}
        <SelectValidator
          name="relatedField"
          floatingLabelText="What industry is your position (not company) in?"
          value={this.state.surveyData.relatedField}
          onChange={this.handleSurveyRelatedFieldChange}
          style={{width: 600}}
          validators={['required']}
          errorMessages={['This field is required']}
        >
          {this.menuRelatedField(this.state.surveyData.relatedField)}
        </SelectValidator><br />
        <TextValidator
          name="salary"
          floatingLabelText="What was your total salary in USD? (Please N/A if not applicable.)"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.salary}
          validators={['required', 'maxStringLength:100']}
          fullWidth={true}
          errorMessages={['This field is required', 'Please write less than 100 characters.']}
        /><br /><br />
			  <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onClick={this.handlePrev}
          style={{marginRight: 12}}
        />
			  <RaisedButton
          label="Next"
          type="submit"
          primary={true}
          onSubmit={this.handleSubmit1}
        />
			 </ValidatorForm>);
  }

	//third page code when submitting, move the stepindex
  handleSubmit2() {
  	this.setState({submitted2: true})
    const {stepIndex} = this.state;
    this.setState({stepIndex: stepIndex + 1});

  }

  // return the third page interview qustions
  renderInterview()
  {
  	return (
  		<ValidatorForm
        ref="form"
        onSubmit={this.handleSubmit2}
        onError={errors => console.log(errors)}
       >
				<SelectValidator
          name="interview"
          floatingLabelText="Did you interview?"
          value={this.state.surveyData.interview}
          onChange={this.handleSurveyInterviewChange}
          validators={['required']}
          errorMessages={['This field is required']}
        >
          {this.menuInterview(this.state.surveyData.interview)}
        </SelectValidator><br />
        {this.renderSurveyInterviewQuestions()}<br />
        <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onClick={this.handlePrev}
          style={{marginRight: 12}}
        />
			  <RaisedButton
          label="Next"
          type="submit"
          primary={true}
          onSubmit={this.handleSubmit2}
        />
			 </ValidatorForm>);
  }

	//fourth page code when submitting, move the stepindex
  handleSubmit3() {
  	this.setState({submitted3: true})
    const {stepIndex} = this.state;
    this.setState({stepIndex: stepIndex + 1});

  }

  // return the fourth page internship questions
  renderInternship()
  {
  	return (
  		<ValidatorForm
        ref="form"
        onSubmit={this.handleSubmit3}
        onError={errors => console.log(errors)}
       >
				<TextValidator
          name="duration"
          floatingLabelText="How long was the internship (in number of weeks)?"
          fullWidth={true}
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.duration}
          validators={['required', 'isNumber', 'maxNumber:52']}
          errorMessages={['This field is required', 'The value you entered is not a number', 'Please enter a valid response']}
        /><br />
        <AutoCompleteValidator
          name="location"
          floatingLabelText="Where was the internship (city, state, country)?"
          filter={AutoComplete.fuzzyFilter}
          dataSource={this.state.locDataSource}
          onUpdateInput={this.handleSurveyLocAutoComplete}
          value={this.state.surveyData.location}
          searchText={this.state.surveyData.location}
          fullWidth={true}
          maxSearchResults={5}
          validators={['required', 'maxStringLength:100']}
          errorMessages={['This field is required', 'Please write less than 100 characters.']}
        /><br />
        <TextValidator
          name="classesToPrepare"
          floatingLabelText="What classes did you find useful in preparing for the experience? (Please N/A if not applicable.)"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.classesToPrepare}
          fullWidth={true}
          multiLine={true}
          validators={['required', 'maxStringLength:3000']}
          errorMessages={['This field is required', 'Please write less than 3000 characters.']}
        /><br />
        <TextValidator
          name="averageDay"
          floatingLabelText="What was an average day at the internship like?"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.averageDay}
          fullWidth={true}
          multiLine={true}
          validators={['required', 'minStringLength:300', 'maxStringLength:3000', 'hasMultipleWords']}
          errorMessages={['This field is required', 'Please write at least 300 characters.', 'Please write less than 3000 characters.', 'Please enter a valid response.']}
        /><br /><br />
        <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onClick={this.handlePrev}
          style={{marginRight: 12}}
        />
        <RaisedButton
          label="Next"
          type="submit"
          primary={true}
          onSubmit={this.handleSubmit3}
        />
			 </ValidatorForm>);
  }

  // fifth page code when submitting, move the stepindex
  handleSubmit4() {
  	this.setState({submitted4: true});
  	this.handleSurveySubmit();
  	const {stepIndex} = this.state;
    this.setState({stepIndex: stepIndex + 1});
  }

  // Return the closing questions page questions
  renderClosing()
  {
  	return (
  		<ValidatorForm
        ref="form"
        onSubmit={this.handleSubmit4}
        onError={errors => console.log(errors)}
       >
        <TextValidator
          name="advice"
          floatingLabelText="What advice do you have for future interns?"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.advice}
          fullWidth={true}
          multiLine={true}
          validators={['required', 'minStringLength:300', 'maxStringLength:3000', 'hasMultipleWords']}
          errorMessages={['This field is required', 'Please write at least 300 characters.', 'Please write less than 3000 characters.', 'Please enter a valid response.']}
        /><br />
        <TextValidator
          name="overallExperience"
          floatingLabelText="What was the overall internship experience like?"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.overallExperience}
          fullWidth={true}
          multiLine={true}
          validators={['required', 'minStringLength:300', 'maxStringLength:3000', 'hasMultipleWords']}
          errorMessages={['This field is required', 'Please write at least 300 characters.', 'Please write less than 3000 characters.', 'Please enter a valid response.']}
        /><br />
        <TextValidator
          name="anythingElse"
          floatingLabelText="Is there anything else you'd like to add about your internship experience?"
          onChange={this.handleSurveyChange}
          value={this.state.surveyData.anythingElse}
          fullWidth={true}
          multiLine={true}
          validators={['maxStringLength:3000']}
          errorMessages={['Please write less than 3000 characters.']}
        /><br /><br />
        <p style={{fontWeight:"bold", fontSize:16, color:myMuiTheme.palette.disabledColor}} >
        How would you rate your overall experience? &emsp;
        <StarRatings 
          rating={this.state.surveyData.rating}
          numberOfStars={5}
          starDimension={24}
          starSpacing={4}
          starHoverColor={this.state.surveyData.color}
          starRatedColor={this.state.surveyData.color}
          changeRating ={this.changeRating}
          />
        </p>
        <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onClick={this.handlePrev}
          style={{marginRight: 12}}
        />
			  <RaisedButton
          label="Submit"
          type="submit"
          primary={true}
          onSubmit={this.handleSubmit4}
        />
			 </ValidatorForm>);
  }	

  // Setting the redirection for the survey
  handleOnClick() {
    if (this.state.surveyRedirect) {
  	  this.props.sendSurveyStatus(true);
    }
  }

  // Rendering the last page thank you information
  renderThank()
  {
  	return (
  		<div>
  		<h3 style={{color:myMuiTheme.palette.primary1Color}}>Thanks for filling out our survey! Click the button below to proceed to our main website.  </h3><br/>
        <RaisedButton label="Main Page" secondary={true} labelColor={myMuiTheme.palette.labelColor} 
        onClick={this.handleOnClick}
        />
      </div>
  		)
  }

  // Rendering the disabledness of the previous button
  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };

  // For stepper object, returns which page depending on stepIndex
  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return this.renderPersonal();
      case 1:
        return this.renderBasic();
      case 2:
        return this.renderInterview();
      case 3:
      	return this.renderInternship();
      case 4: 
      	return this.renderClosing();
      case 5:
      	return this.renderThank();
      default:
        return 'Error';
    }
  }

  // Render the survey
  render() 
  {
    const {stepIndex} = this.state;
    const headerStyle = {fontSize:18};
    return (
      <div>
    	<Grid fluid={false}>
      <Row>
      <Col xs="12">
      <Paper style={{padding:"20px 20px 35px 20px"}}>
          {this.renderSnack()}
	        <Stepper activeStep={stepIndex} orientation="vertical" >
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 0})}>
                <span style={headerStyle} >Background Information</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 1})}>
	              <span style={headerStyle}>Basic Internship Info</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 2})}>
	              <span style={headerStyle} >Interview Questions</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 3})}>
	              <span style={headerStyle} >Internship Questions</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 4})}>
	              <span style={headerStyle} >Closing Questions</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	          <Step>
	            <StepButton onClick={() => this.setState({stepIndex: 5})}>
	              <span style={headerStyle} >Finished!</span>
	            </StepButton>
              <StepContent>{this.getStepContent(stepIndex)}
              </StepContent>
	          </Step>
	        </Stepper>
          </Paper>

	      </Col>
        </Row>
        </Grid>
        </div>
		);
	}
}

export default Survey;