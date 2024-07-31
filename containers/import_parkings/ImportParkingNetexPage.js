import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import {httpCall} from '../../utils/httpCall';
import RaisedButton from "material-ui/RaisedButton";
import { Grid, Input, Typography } from '@material-ui/core';
import {getIn} from "../../utils";
import Box from '@material-ui/core/Box';
import { CircularProgress } from 'material-ui';


class ImportParkingNetexPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
          file: "",
          errors: [],
          result: "",
          fileError: "",
          loading: false
        };
        this.fileReader = new FileReader();
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

     handleOnChange(e){
       const file = e.target.files[0];
       const isXmlFile = file && file.name.endsWith('.xml');
       this.setState({
         file: isXmlFile ? file : "",
         fileError: isXmlFile ? "" : formatMessage({id: 'import_file_extension_help_text'})
       });
    }

    handleOnSubmit(e){
        e.preventDefault();

        if(this.state.file !== ""){
          this.setState({ loading: true });
            this.fileReader.onload = (event) => {
                const csvOutput = event.target.result;
                const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
                const url = tiamatBaseUrl + "netex_parking/parking_async_import_netex";

                const bodyFormData = new FormData();

                bodyFormData.append('file', csvOutput);

                bodyFormData.append('file_name',this.state.file.name);

                const username = getIn(this.props.kc, ['tokenParsed', 'preferred_username'], '');
                bodyFormData.append('provider', username);
                bodyFormData.append('folder', "");

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
                        this.setState({result:"import démarré", loading: false});
                    }).catch(error =>{
                        this.setState({errors:error, loading: false});
                    });
            };
            this.fileReader.readAsText(this.state.file);
        }
    }


    render(){
        const {intl:{formatMessage}} = this.props;
        const isSubmitDisabled = this.state.file === "";

        return(
            <div>
              <Grid container spacing={2} style={{ padding: 20 }}>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <Typography variant="h4">{formatMessage({id: 'import_parking_netex'})}</Typography>
                </Grid>
                <Grid item md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                  <Input
                      id={"upload_csv_parkings_netex"}
                      type={"file"}
                      accept={".xml"}
                      onChange={this.handleOnChange}
                  />
                  {this.state.fileError && (
                    <Box style={{ marginTop: 10 }}>
                      <Typography style={{ color: 'orangered' }}>{this.state.fileError}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item md={6} xs={12} style={{ margin: 'auto', textAlign: 'center' }}>
                  <RaisedButton
                      style={{marginTop: 10, marginLeft: 5, transform: 'scale(0.9)'}}
                      label={formatMessage({id: 'upload_parkings_file_submit'})}
                      onClick={(event) => {
                          this.handleOnSubmit(event);
                      }}
                      primary={true}
                      disabled={isSubmitDisabled || this.state.isLoading}
                  />
                  {this.state.loading && (
                    <Box>
                      <CircularProgress size={24} style={{ marginRight: 10 }} />
                      <Typography>{ formatMessage({ id: 'import_progress_message' }) }</Typography>
                    </Box>
                  )}
                  {isSubmitDisabled ?
                    <Box style={{ marginTop: 10 }}>
                      <Typography style={{ color: 'orangered' }}>{formatMessage({id: 'is_missing_file_for_import'})}</Typography>
                    </Box>
                    : null
                  }
                </Grid>
              </Grid>

              {this.state.errors.length>0 && this.state.errors.map(error => alert(error.message))}

              {this.state.result.length>0 && alert(this.state.result)}
            </div>
        );
    }
}


const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportParkingNetexPage)));


