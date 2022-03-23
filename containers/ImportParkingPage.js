import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, { Component } from 'react';
import {injectIntl} from "react-intl";
import { httpCall } from '../utils/httpCall';
import RaisedButton from "material-ui/RaisedButton";
import {Input, InputLabel} from '@material-ui/core';
import ReportFilterBox from "../components/ReportPage/ReportFilterBox";


class ImportParkingPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            file: "",
            errors :[],
            result : ""
        };
        this.fileReader = new FileReader();
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

     handleOnChange(e){
        this.setState({["file"]:e.target.files[0]});
    }

    handleOnSubmit(e){

        e.preventDefault();

        if(this.state.file != ""){
            this.fileReader.onload = (event) => {
                const csvOutput = event.target.result;


                // const url = convict.get('tiamatBaseUrl')+"services/stop_places/parkings_import_csv";
                const url= "http://0.0.0.0:8484/services/stop_places/parkings_import_csv";

                const bodyFormData = new FormData();
                bodyFormData.append('file', csvOutput);

                httpCall(
                    url,
                    {
                        method: 'post',
                        headers: {
                            "Authorization": "Bearer "+localStorage.getItem("ABZU::jwt"),
                             "Content-Type": "multipart/form-data"
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

        return(
            <div>
                <ReportFilterBox style={{width: '60%'}}>
                    <div style={{marginLeft: 5, paddingTop: 5}}>
                        <div style={{fontWeight: 600, fontSize: 12, marginBottom: 10}}>{formatMessage({id: 'upload_file'})}</div>
                    </div>
                    <form>
                        <InputLabel htmlFor={"upload_csv_parking"}>
                            {formatMessage({id: 'select_csv_file_button'})}
                            <Input
                                id={"upload_csv_parking"}
                                style={{display:"none"}}
                                type={"file"}
                                accept={".csv"}
                                onChange={this.handleOnChange}/>
                        </InputLabel>


                        <RaisedButton
                            style={{marginTop: 10, marginLeft: 5, transform: 'scale(0.9)'}}
                            label={formatMessage({id: 'upload_parkings_file_submit'})}
                            onClick={(event)=>{
                                this.handleOnSubmit(event);
                            }}
                        />
                    </form>
                </ReportFilterBox>

                {this.state.errors.length>0 && this.state.errors.map(error => alert(error.message))}

                {this.state.result.length>0 && alert(this.state.result)}


            </div>
        );
    }
}


const mapStateToProps = ({}) => ({

});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportParkingPage)));


