import * as Colors from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

var palette = {
    primary1Color: Colors.blueGrey800,
    primary2Color: Colors.blueGrey500,
    accent1Color: Colors.lightBlue200,
    pickerHeaderColor: Colors.blueGrey800,
    primary3Color: Colors.blueGrey200,
    accent2Color: Colors.cyan100,
    accent3Color: Colors.blueGrey800,
    textColor: Colors.darkBlack,
    secondaryTextColor: fade(Colors.darkBlack, 0.54),
    alternateTextColor: Colors.white,
    canvasColor: '#fafcff',
    borderColor: Colors.grey300,
    disabledColor: fade(Colors.darkBlack, 0.3),
    clockCircleColor: fade(Colors.darkBlack, 0.07),
    shadowColor: Colors.fullBlack,
    offWhite: "#e8f0f6",
    warning: Colors.red300,
    metrics: Colors.tealA400
  }

export default {
  spacing: spacing,
  borderRadius: 2,
  palette: palette,
  textField: {
    underlineColor: palette.accent1Color,
    focusColor: palette.accent1Color,
    borderColor: palette.accent1Color,
  },
  drawer: {
    color: palette.canvasColor
  },
  fontIcon: {color : palette.accent1Color},
  dialog: {color: palette.offWhite},
};