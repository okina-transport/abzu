import React, { Component } from 'react';
import { withApollo } from "react-apollo";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import RaisedButton from "material-ui/RaisedButton";
import { Input, FormControlLabel, Checkbox, Grid, Tooltip, Typography } from '@material-ui/core';
import { httpCall } from '../utils/httpCall';
import { getIn } from "../utils";
import Item from "../components/EditStopPage/Item";
import Box from '@material-ui/core/Box';

class ImportAccessibilityPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: "",
            errors: [],
            result: "",
            checkedType: "", // Ajout pour gérer le type sélectionné
        };
        this.fileReader = new FileReader();
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this); // Ajout pour gérer le changement de la case à cocher
    }

    handleOnChange(e) {
        this.state.errors = [];
        this.state.result = "";
        this.setState({ ["file"]: e.target.files[0] });
    }

    handleOnSubmit(e) {
        this.state.errors = [];
        this.state.result = "";
        e.preventDefault();

        if (this.state.file !== "" && this.state.checkedType !== "") {
            this.fileReader.onload = (event) => {
                const csvOutput = event.target.result;
                const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
                let url = "";
                if (this.state.checkedType === "quay") {
                    url = tiamatBaseUrl + "accessibility_import_csv/quay";
                } else if (this.state.checkedType === "commercial") {
                    url = tiamatBaseUrl + "accessibility_import_csv/commercial";
                }
                const bodyFormData = new FormData();
                bodyFormData.append('file', csvOutput);
                bodyFormData.append('file_name', this.state.file.name);

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
                    }).then(response => {
                    this.setState({ result: "Accessibility process successfully updated" });
                }).catch(error => {
                    this.setState({ errors: error });
                });
            };
            this.fileReader.readAsText(this.state.file);
        }
    }

    // Gestion des changements des cases à cocher
    handleCheckboxChange(event) {
        this.state.errors = [];
        this.state.result = "";
        this.setState({ checkedType: event.target.value });
    }

    render() {
        const { intl: { formatMessage } } = this.props;
        const isSubmitDisabled = this.state.file === "" || this.state.checkedType === ""; // Désactive le bouton si aucune case n'est cochée ou si aucun fichier n'est sélectionné

        return (
            <div>
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <Grid item xs={3} style={{ margin: 'auto' }}>
                        <Input
                            id={"upload_csv_parking"}
                            type={"file"}
                            accept={".csv"}
                            onChange={this.handleOnChange}
                        />
                    </Grid>
                    <Grid item xs={4} style={{ textAlign: 'center', margin: 'auto' }}>
                        <Item>Choisir le type de fichier à importer *</Item>
                        <Tooltip title="Le fichier contient des identifiants d'arrêts commerciaux / stopPlaces">
                            <FormControlLabel
                                control={<Checkbox checked={this.state.checkedType === "commercial"} onChange={this.handleCheckboxChange} value="commercial" />}
                                label="Arrêts commerciaux"
                            />
                        </Tooltip>
                        <Tooltip title="Le fichier contient des identifiants de quais physique">
                            <FormControlLabel
                                control={<Checkbox checked={this.state.checkedType === "quay"} onChange={this.handleCheckboxChange} value="quay" />}
                                label="Quais physiques"
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item xs={5} style={{ margin: 'auto', textAlign: 'center' }}>
                        <RaisedButton
                            style={{ marginTop: 10, marginLeft: 5, transform: 'scale(0.9)' }}
                            label={formatMessage({ id: 'upload_parkings_file_submit' })}
                            onClick={(event) => {
                                this.handleOnSubmit(event);
                            }}
                            primary={true}
                            disabled={isSubmitDisabled}
                        />
                        {isSubmitDisabled ?
                          <Box style={{ marginTop: 10 }}>
                              <Typography style={{ color: 'orangered' }}>Attention :</Typography>
                              <Typography>Un fichier doit être chargé et un type de fichier doit être coché pour l'import</Typography>
                          </Box>
                          : null
                        }
                    </Grid>
                </Grid>

                <Grid container style={{ padding: 20 }}>
                    Le fichier à importer doit :
                    <ul>
                        <li>
                            être au format .csv
                        </li>
                        <li>
                            contenir les colonnes dans cette ordre précis :
                            <ul>
                                <li>identifiant Lumidata</li>
                                <li>nom</li>
                                <li>code INSEE</li>
                                <li>nom de la commune</li>
                                <li>identifiant de l'arrêt</li>
                                <li>direction</li>
                                <li>lignes</li>
                                <li>lignes > directions</li>
                                <li>longitude</li>
                                <li>latitude</li>
                                <li>url</li>
                                <li>wheelchair access</li>
                                <li>step free access</li>
                                <li>escalator free access</li>
                                <li>lift free access</li>
                                <li>audible signals available</li>
                                <li>visual signs available</li>
                            </ul>
                        </li>
                    </ul>
                </Grid>

                {this.state.errors && this.state.errors.length > 0 && this.state.errors.map(error => alert(error.message))}

                {this.state.result && this.state.result.length > 0 && alert(this.state.result)}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportAccessibilityPage)));
