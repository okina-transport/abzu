import React from 'react';
import TextField from "material-ui/TextField";
import {columnOptionsQuays, columnOptionsStopPlace} from "../../config/columnOptions";
import {extractQueryParamsFromUrl} from "../../utils/URLhelpers";


class OrganisationNameFilter extends React.Component{

    constructor(props){
        super(props);
    }

    render(){

        const { formatMessage,value, handleOrganisationNameChange } = this.props;
        return(
            <div style={{display: 'flex'}}>
                <TextField
                    floatingLabelText={formatMessage({
                        id: 'organisation_name'
                    })}
                    style={{width: 330}}
                    type = "text"
                    defaultValue={value}
                    onChange ={handleOrganisationNameChange}
                />
            </div>
        )
    }
}

export default OrganisationNameFilter;