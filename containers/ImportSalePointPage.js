import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, {Component} from 'react';
import {injectIntl} from "react-intl";
import {httpCall} from '../utils/httpCall';
import RaisedButton from "material-ui/RaisedButton";
import {Input} from '@material-ui/core';
import ReportFilterBox from "../components/ReportPage/ReportFilterBox";
import {getIn} from "../utils";


class ImportSalePointPage extends Component{

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

        if(this.state.file !== ""){

            this.fileReader.onload = (event) => {
                const csvOutput = event.target.result;
                const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
                const url = tiamatBaseUrl + "poi/shop_import_csv";



                const bodyFormData = new FormData();
                bodyFormData.append('file', csvOutput);

                bodyFormData.append('file_name',this.state.file.name);

                const username = getIn(this.props.kc, ['tokenParsed', 'preferred_username'], '');
                bodyFormData.append('user', username);

                httpCall(
                    url,
                    {
                        method: 'post',
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt"),
                             "Content-Type": "multipart/form-data"
                        },
                        data: bodyFormData
                    }).then(response => {
                        console.log("response =>", response);
                        this.setState({result:"file uploaded"});
                    }).catch(error  => {
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
                        <Input
                            id={"upload_csv_sale_point"}
                            type={"file"}
                            accept={".csv"}
                            onChange={this.handleOnChange}
                        />
                        <RaisedButton
                            style={{marginTop: 10, marginLeft: 5, transform: 'scale(0.9)'}}
                            label={formatMessage({id: 'upload_salePoint_file_submit'})}
                            onClick={(event) => {
                                this.handleOnSubmit(event);
                            }}
                            primary={true}
                        />
                </ReportFilterBox>

                {this.state.errors.length>0 && this.state.errors.map(error => alert(error.message))}

                {this.state.result.length>0 && alert(this.state.result)}


            </div>
        );
    }
}


const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportSalePointPage)));


