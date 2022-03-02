import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import React, { Component } from 'react';
import {injectIntl} from "react-intl";




class ImportParkingPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            file: ""
        };
        this.fileReader = new FileReader();
        this.handleOnChange = this.handleOnChange.bind(this);

        this.handleOnSubmit = this.handleOnSubmit.bind(this);


    }

     handleOnChange(e){
        debugger
        //const {state} = this;
        console.log(this);

        console.log(this.state)

        console.log("Avant le changement", this.state.file);
        this.setState({["file"]:e.target.files[0]});
        console.log("Après le changement",this.state.file);
    }

    handleOnSubmit(e){
        debugger
        e.preventDefault();

        if(this.state.file != ""){
            this.fileReader.onload = function(event){
                const csvOutput = event.target.result;
                console.log(csvOutput);
            };
            console.log(this.state.file);

            this.fileReader.readAsText(this.state.file);
        }
    }

    render(){



        return(
            <div>
                <h1>Hellooooo FROM IMPORT CSV PAGE</h1>
                <form>
                    <input type={"file"} accept={".csv"} onChange={this.handleOnChange}/>
                    {/*<button onSubmit={this.handleOnSubmit.bind(this)}>IMPORT CSV</button>*/}
                    *<button onClick={(event)=>{
                            this.handleOnSubmit(event);
                }}>
                    IMPORT CSV</button>
                </form>

            </div>
        );
    }
}


const mapStateToProps = ({}) => ({

});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportParkingPage)));


