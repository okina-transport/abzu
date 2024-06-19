import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import {httpCall} from '../../utils/httpCall';
import RaisedButton from "material-ui/RaisedButton";
import { Grid, Input, Typography } from '@material-ui/core';
import {getIn} from "../../utils";
import Box from '@material-ui/core/Box';
import Select from "@material-ui/core/Select";
import {ticketFacilities} from "../../models/ticketFacility";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";



class ImportParkingPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            file: "",
            errors :[],
            result : "",
            parkingType: "parkingZone",
            parkingLayout : "undefined",
            parkAndRideDetection : false

        };
        this.fileReader = new FileReader();
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.handleParkingTypeSelectChange = this.handleParkingTypeSelectChange.bind(this);
        this.handleParkingLayoutSelectChange = this.handleParkingLayoutSelectChange.bind(this);
        this.handleParkAndRideDetectionSelectChange = this.handleParkAndRideDetectionSelectChange.bind(this);

    }

     handleOnChange(e){
        this.setState({["file"]:e.target.files[0]});
    }

    handleParkingTypeSelectChange = (event) => {
        this.setState({ parkingType: event.target.value });
    };

    handleParkingLayoutSelectChange = (event) => {
        this.setState({ parkingLayout: event.target.value });
    };

    handleParkAndRideDetectionSelectChange = (event) => {
        this.setState({ parkAndRideDetection: event.target.value });
    };

    handleOnSubmit(e){
        e.preventDefault();



        if(this.state.file !== ""){
            this.fileReader.onload = (event) => {
                const csvOutput = event.target.result;
                const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
                const url = tiamatBaseUrl + "parkings_import_csv";

                const bodyFormData = new FormData();

                bodyFormData.append('file', csvOutput);

                bodyFormData.append('file_name',this.state.file.name);

                bodyFormData.append('parking_type', this.state.parkingType);
                bodyFormData.append('parking_layout', this.state.parkingLayout);
                bodyFormData.append('park_and_ride_detection', this.state.parkAndRideDetection);
                debugger;;

                const username = getIn(this.props.kc, ['tokenParsed', 'preferred_username'], '');
                bodyFormData.append('user', username);

                httpCall(
                    url,
                    {
                        method: 'post',
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt"),
                            "Content-Type": "multipart/form-data; charset=utf-8"
                        },
                        data: bodyFormData
                    }).then(response=>{
                        console.log("response =>", response)
                        this.setState({result:"file uploaded"});
                    }).catch(error =>{
                        this.setState({errors:error});
                    });
            };
            this.fileReader.readAsText(this.state.file);
        }
    }


    render(){

        const {intl:{formatMessage}} = this.props;
        const isSubmitDisabled = this.state.file === "";

        const labelStyle = {
            width: '350px',
            textAlign: 'left',
            marginRight: '10px'
        };

        const selectStyle = {
            minWidth: '400px',
            padding: '10px'
        };

        return(
            <div>
              <Grid container spacing={2} style={{ padding: 20 }}>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <Typography variant="h4">Parkings</Typography>
                </Grid>
                <Grid item md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                  <Input
                      id={"upload_csv_parking"}
                      type={"file"}
                      accept={".csv"}
                      onChange={this.handleOnChange}
                  />
                </Grid>
                <Grid item md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                  <RaisedButton
                      style={{marginTop: 10, marginLeft: 5, transform: 'scale(0.9)'}}
                      label={formatMessage({id: 'upload_parkings_file_submit'})}
                      onClick={(event) => {
                          this.handleOnSubmit(event);
                      }}
                      primary={true}
                      disabled={isSubmitDisabled}
                  />
                  {isSubmitDisabled ?
                    <Box style={{ marginTop: 10 }}>
                      <Typography style={{ color: 'orangered' }}>Un fichier doit être chargé pour l'import</Typography>
                    </Box>
                    : null
                  }
                </Grid>
                  <Grid item md={12} xs={12} style={{margin: 'auto', textAlign: 'center'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <label htmlFor="parkingType"  style={labelStyle}>ParkingType:</label>
                          <select
                              id="parkingType"
                              value={this.state.parkingType}
                              onChange={this.handleParkingTypeSelectChange}
                              style={selectStyle}
                          >
                              <option value="parkingZone"> parkingZone:Zone de parking</option>
                              <option value="parkAndRide">parkAndRide:P+R</option>
                              <option value="liftShareParking">liftShareParking:Parking pour covoiturage</option>
                              <option value="urbanParking">urbanParking:Parking urbain</option>
                              <option value="airportParking">airportParking:Parking d’aéroport</option>
                              <option value="trainStationParking">trainStationParking:Parking de gare</option>
                              <option value="exhibitionCentreParking">exhibitionCentreParking:Parking de parc d’exposition</option>
                              <option value="rentalCarParking">rentalCarParking:Parking pour loueur</option>
                              <option value="shoppingCentreParking">shoppingCentreParking:Parking de centre comercial</option>
                              <option value="motorwayParking">motorwayParking:Parking d’autoroute</option>
                              <option value="roadside">roadside:Parking en voirie</option>
                              <option value="undefined">undefined:Type non précisé</option>
                              <option value="cycleRental">cycleRental:Parking de location de vélo/trotinettes/etc.</option>
                          </select>
                      </div>
                  </Grid>


                  <Grid item md={12} xs={12} style={{margin: 'auto', textAlign: 'center'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <label htmlFor="parkingLayout"  style={labelStyle}>ParkingLayout:</label>
                          <select
                              id="parkingLayout"
                              value={this.state.parkingLayout}
                              onChange={this.handleParkingLayoutSelectChange}
                              style={selectStyle}
                          >
                              <option value="undefined">undefined:non précisé</option>
                              <option value="covered">covered:couvert</option>
                              <option value="openSpace">openSpace:espace ouvert</option>
                              <option value="multistorey">multistorey:à plusieurs étages/niveaux</option>
                              <option value="underground">underground:sous terrain</option>
                              <option value="roadside">roadside:bord de route</option>
                              <option value="cycleHire">cycleHire:location de cycle et trotinettes, inclus les vehicules partagés</option>
                          </select>
                      </div>
                  </Grid>

                  <Grid item md={12} xs={12} style={{margin: 'auto', textAlign: 'center'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <label htmlFor="parkAndRideDetection"  style={labelStyle}>Détection automatique du parkAndRide:</label>
                          <select
                              id="parkAndRideDetection"
                              value={this.state.parkAndRideDetection}
                              onChange={this.handleParkAndRideDetectionSelectChange}
                              style={selectStyle}
                          >
                              <option value="false">désactivé</option>
                              <option value="true">active</option>
                          </select>
                      </div>
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

export default withApollo(connect(mapStateToProps)(injectIntl(ImportParkingPage)));


