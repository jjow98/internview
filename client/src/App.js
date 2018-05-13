import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SearchForm from './Search';
import myMuiTheme from './myMuiTheme';

const muiTheme = getMuiTheme(myMuiTheme);

const App = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <SearchForm />
  </MuiThemeProvider>
);

export default App;