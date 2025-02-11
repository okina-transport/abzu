import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import ImportParkingPage from './ImportParkingPage';
import ImportGbfsPage from './ImportGbfsPage';
import { Grid, Typography } from '@material-ui/core';
import ImportBikeParkingPage from './ImportBikeParkingPage';
import ImportRentalBikePage from './ImportRentalBikePage';
import ImportParkingNetexPage from './ImportParkingNetexPage';
import ImportParkingStats from "./ImportParkingStats";




class ImportParkingGlobalPage extends Component{
  render(){
    return(
      <div>
        <Grid container spacing={6} style={{ marginTop: 3 , justifyContent:"center", alignItems:"center"}}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format Netex</Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            <ImportParkingNetexPage />
          </Grid>
        </Grid>
        <hr/>
        <Grid container spacing={6} style={{ marginTop: 3 , justifyContent:"center", alignItems:"center"}}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format GBFS</Typography>
          </Grid>
          <Grid item xs={12}>
            <ImportGbfsPage />
          </Grid>
        </Grid>
        <hr/>
        <Grid container spacing={6} style={{ marginTop: '50px' }}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format CSV</Typography>
          </Grid>
          <Grid item md={6} xs={12} style={{ border: '1px solid #ccc', padding: '16px' }}>
            <ImportParkingPage />
          </Grid>
          <Grid item md={6} xs={12} style={{ border: '1px solid #ccc', padding: '16px' }}>
            <ImportBikeParkingPage />
          </Grid>
          <Grid item md={6} xs={12} style={{ border: '1px solid #ccc', padding: '16px' }}>
            <ImportRentalBikePage />
          </Grid>
          <Grid item xs={12} style={{ textAlign: 'center', marginTop: 5 }}>
            <Typography variant="h4">Historique des imports parkings</Typography>
            <ImportParkingStats />
          </Grid>
        </Grid>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportParkingGlobalPage)));


