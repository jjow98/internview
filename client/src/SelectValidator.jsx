/* Taken from https://github.com/NewOldMax/react-material-ui-form-validator.
   This is in our source code due to this issue: http://bit.ly/2tRViJ9. */

/* eslint-disable */
import React from 'react';
import SelectField from 'material-ui/SelectField';
/* eslint-enable */
import ValidatorComponent from './ValidatorComponent.jsx';

export default class SelectValidator extends ValidatorComponent {

    render() {
        // eslint-disable-next-line
        const { errorMessages, validators, requiredError, errorText, validatorListener, ...rest } = this.props;
        const { isValid } = this.state;
        return (
            <SelectField
                {...rest}
                ref={(r) => { this.input = r; }}
                errorText={(!isValid && this.getErrorMessage()) || errorText}
            />
        );
    }
}
