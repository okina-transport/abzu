import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import {httpCall} from '../../utils/httpCall';
import RaisedButton from "material-ui/RaisedButton";
import {Grid, Input, Typography} from '@material-ui/core';
import Box from '@material-ui/core/Box';


class ImportGbfsPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: "",
            errors :[],
            result : "",
            parkingType: "CYCLE_RENTAL",
            parkingAreaType: "NONE",
        };
        this.isValidUrl = this.isValidUrl.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.handleParkingTypeSelectChange = this.handleParkingTypeSelectChange.bind(this);
        this.handleParkingAreaTypeSelectChange = this.handleParkingAreaTypeSelectChange.bind(this);

    }

    isValidUrl(input) {
        let isValid = false;
        try {
            new URL(input);
            isValid = true;
        } catch (error) {

        }
        return isValid
    }

    handleOnChange(e){
        this.setState({url: e.target.value});
    }

    handleParkingTypeSelectChange = (event) => {
        this.setState({ parkingType: event.target.value });
    };

    handleParkingAreaTypeSelectChange = (event) => {
        this.setState({ parkingAreaType: event.target.value });
    };

    handleOnSubmit(e){
        e.preventDefault();
        if (this.isValidUrl(this.state.url)) {

            const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
            const url = tiamatBaseUrl + "gbfs_parking/async_import";

            const jsonBody = {};
            jsonBody["globalUrl"] = this.state.url;
            jsonBody["parkingType"] = this.state.parkingType;
            jsonBody["parkingAreaType"] = this.state.parkingAreaType;

            httpCall(
                url,
                {
                    method: 'post',
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt"),
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    data: jsonBody
                }).then(()=> {
                this.setState({result:"Import démarré"});
            }).catch(() =>{
                this.setState({errors:[{message:"Gbfs Import failed"}]});
            });
        }
    }


    render(){

        const {intl:{formatMessage}} = this.props;
        const isSubmitDisabled = !this.isValidUrl(this.state.url);

        const labelStyle = {
            width: '350px',
            textAlign: 'right',
            marginRight: '10px',
            fontWeight: 'bold',
            color: '#1e2864'
        };

        const selectStyle = {
            minWidth: '400px',
            padding: '10px'
        };

        return(
            <div>
                <Grid container spacing={{ xs: 2, md: 4, lg: 6 }} style={{ padding: 20 }}>
                    <Grid item xs={12} style={{ textAlign: 'center', margin:'1rem' }}>
                        <Typography variant="h5">Parkings</Typography>
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                        <label style={{fontWeight: 'bold', color: '#1e2864'}} htmlFor="url_gbfs_parking">{formatMessage({id: 'import_gbfs_url_input_label'})}</label>
                        <Input
                            style={{width: "75%"}}
                            id={"url_gbfs_parking"}
                            type={"text"}
                            title={this.state.url}
                            onChange={this.handleOnChange}
                        />
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} xs={12} style={{margin: 'auto', textAlign: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <label htmlFor="parkingType"  style={labelStyle}>{formatMessage({id: 'import_gbfs_url_parking_label'})}</label>
                            <select
                                id="parkingType"
                                value={this.state.parkingType}
                                onChange={this.handleParkingTypeSelectChange}
                                style={selectStyle}
                            >
                                <option value="PARKING_ZONE">parkingZone:Zone de parking</option>
                                <option value="PARK_AND_RIDE">parkAndRide:P+R</option>
                                <option value="LIFT_SHARE_PARKING">liftShareParking:Parking pour covoiturage</option>
                                <option value="URBAN_PARKING">urbanParking:Parking urbain</option>
                                <option value="AIRPORT_PARKING">airportParking:Parking d’aéroport</option>
                                <option value="TRAIN_STATION_PARKING">trainStationParking:Parking de gare</option>
                                <option value="EXHIBITION_CENTRE_PARKING">exhibitionCentreParking:Parking de parc d’exposition</option>
                                <option value="RENTAL_CAR_PARKING">rentalCarParking:Parking pour loueur</option>
                                <option value="SHOPPING_CENTRE_PARKING">shoppingCentreParking:Parking de centre comercial</option>
                                <option value="MOTORWAY_PARKING">motorwayParking:Parking d’autoroute</option>
                                <option value="ROADSIDE">roadside:Parking en voirie</option>
                                <option value="UNDEFINED">undefined:Type non précisé</option>
                                <option value="CYCLE_RENTAL">cycleRental:Parking de location de vélo/trotinettes/etc.</option>
                            </select>
                        </div>
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} xs={12} style={{margin: 'auto', textAlign: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <label htmlFor="parkingAreaType"  style={labelStyle}>{formatMessage({id: 'import_gbfs_url_parking_area_type_label'})}</label>
                            <select
                                id="parkingAreaType"
                                value={this.state.parkingAreaType}
                                onChange={this.handleParkingAreaTypeSelectChange}
                                style={selectStyle}
                            >
                                <option value="NONE">Aucun</option>
                                <option value="CARSHARE">Autopartage</option>
                                <option value="CARPOOL">Covoiturage</option>
                            </select>
                        </div>
                    </Grid>
                    <Grid item xl={4} lg={6} md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                        <RaisedButton
                            style={{marginTop: 10, marginLeft: 5, transform: 'scale(0.9)'}}
                            label={formatMessage({id: 'import_gbfs_submit_button_label'})}
                            onClick={(event) => {
                                this.handleOnSubmit(event);
                            }}
                            primary={true}
                            disabled={isSubmitDisabled}
                        />
                        {isSubmitDisabled ?
                            <Box style={{ marginTop: 10 }}>
                                <Typography style={{ color: 'orangered' }}>{formatMessage({id: 'import_gbfs_url_input_error'})}</Typography>
                            </Box>
                            : null
                        }
                    </Grid>

                </Grid>

                {this.state.errors.length > 0 && this.state.errors.map(error => alert(error.message))}

                {this.state.result.length > 0 && alert(this.state.result)}


            </div>
        );
    }
}


const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportGbfsPage)));


