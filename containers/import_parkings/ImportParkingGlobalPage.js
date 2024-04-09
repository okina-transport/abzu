import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import ImportParkingPage from './ImportParkingPage';
import { Grid, Typography } from '@material-ui/core';
import ImportBikeParkingPage from './ImportBikeParkingPage';
import ImportRentalBikePage from './ImportRentalBikePage';
import ImportParkingNetexPage from './ImportParkingNetexPage';


class ImportParkingGlobalPage extends Component{
  render(){
    return(
      <div>
        <Grid container spacing={6} style={{ marginTop: 5 }}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format Netex</Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            <ImportParkingNetexPage />
          </Grid>
        </Grid>
        <hr/>
        <Grid container spacing={6} style={{ marginTop: '50px' }}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format CSV</Typography>
          </Grid>
          <Grid item md={6} xs={12}>
            <ImportParkingPage />
          </Grid>
          <Grid item md={6} xs={12}>
            <ImportBikeParkingPage />
          </Grid>
          <Grid item md={6} xs={12}>
            <ImportRentalBikePage />
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


