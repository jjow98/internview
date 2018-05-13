import React, {PureComponent} from 'react';
import FlatButton from 'material-ui/FlatButton';

export default class CompanyPinInfo extends PureComponent {

  /* Send clicked result information to the Search component so that the correct information
     can be displayed. */
  handleClick(data, index) {
    this.props.sendRelatedSearch(data[index].companyName, data[index].results[0].positionName,
      data[index].results[0].location);
  }

  /* Render button with company name and position name of the selected result. */
  render() {
    const {info} = this.props;
    const data = info[0];
    const index = info[1];
    const label = data[index].companyName + " - " + data[index].results[0].positionName;
    return (
      <div>
        <div>
          <FlatButton label={label} primary={true} onClick={() => this.handleClick(data, index)} />
        </div>
      </div>
    );
  }
}