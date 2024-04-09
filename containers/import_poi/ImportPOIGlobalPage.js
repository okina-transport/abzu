import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import { Grid, Typography } from '@material-ui/core';
import ImportPOINetexPage from './ImportPOINetexPage';
import ImportPOIPage from './ImportPOIPage';


class ImportPOIGlobalPage extends Component{
  render(){
    return(
      <div>
        <Grid container spacing={6} style={{ marginTop: 5 }}>
          <Grid item md={6} xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format Netex</Typography>
            <ImportPOINetexPage />
          </Grid>
          <Grid item md={6} xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h4">Imports au format CSV</Typography>
            <ImportPOIPage />
          </Grid>
        </Grid>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportPOIGlobalPage)));


