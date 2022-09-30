/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

  https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software
distributed under the Licence is distributed on an "AS IS" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and
limitations under the Licence. */

import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import {injectIntl} from 'react-intl';
import {Chip, Grid, Paper} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Tab, Tabs} from "material-ui/Tabs";
import ticketFacility, {ticketFacilities} from "../../models/ticketFacility";
import {ticketFacilityServices} from "../../models/ticketFacilityService";

const useStyles = makeStyles((theme) => ({
    mainGrid: {
        marginTop: '.5rem'
    },
    gridItemMargin: {
        marginLeft: '55px'
    },
    boxFullWidth: {
        width: '100%'
    },
    textField: {
        marginTop: -10
    },
    selectInput: {
        width: '100%'
    },
    info: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '12px',
        paddingLeft: '16px',
        width: '100%',
        marginBlockStart: 0
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        margin: 0,
    },
    chip: {
        margin: theme.spacing(0.5),
    }
}));

const pointOfInterestIconStyles = (topMargin = 15) => ({
    margin: `${topMargin}px 22px 18px 10px`
});

const hasElements = list => list && list.length > 0;

const hasValue = value => value !== null && value !== undefined;

const PointOfInterestItemExpandedFields = (props) => {
    const {
        intl: {formatMessage},
        pointOfInterest,
        handleTabOnChange,
        style,
        tabStyle,
        activeTabIndex,
        locale,
    } = props;

    const classes = useStyles();

    return (
        <div style={style} id="additional">
            <Tabs
                onChange={(_e, value) => {
                    handleTabOnChange(value);
                }}
                value={activeTabIndex}
                tabItemContainerStyle={{backgroundColor: '#fff', marginTop: -5}}
            >
                <Tab
                    style={tabStyle}
                    label={formatMessage({id: 'classifications'})}
                    value={0}
                >
                    <Grid container alignItems="stretch" direction="column" spacing={2} className={classes.mainGrid}>
                        <Grid item>
                            <Paper component="ul" className={classes.root}>
                                {pointOfInterest.classifications.map((classification) => {
                                    return (
                                        <li key={classification.id}>
                                            {classification.parent && classification.parent.name !== 'yes' &&
                                                <Chip
                                                    label={classification.parent.name}
                                                    className={classes.chip}
                                                />
                                            }
                                            {classification.name !== 'yes' &&
                                                <Chip
                                                    label={classification.name}
                                                    className={classes.chip}
                                                />
                                            }
                                        </li>
                                    );
                                })}
                            </Paper>
                        </Grid>
                    </Grid>

                </Tab>
                <Tab
                    style={tabStyle}
                    label={formatMessage({id: 'equipments'})}
                    value={1}
                >
                    <Grid container alignItems="stretch" direction="column" spacing={2} className={classes.mainGrid}>
                        <Grid item className={classes.gridItemMargin}>
                            <InputLabel htmlFor="select-ticket-facility">
                                {formatMessage({id: 'ticketFacility'})}
                            </InputLabel>
                            <Select
                                displayEmpty
                                disabled={true}
                                value={pointOfInterest.ticketFacility}
                                input={<Input className={classes.selectInput} id="select-ticket-facility"/>}
                                renderValue={selected => selected ? formatMessage({id: pointOfInterest.ticketFacility}) :
                                    <em>{formatMessage({id: 'undefined'})}</em>}
                                >
                                {ticketFacilities.map(key => (
                                    <MenuItem key={key} value={key}>
                                        <ListItemText
                                            primary={formatMessage({id: `${key}`})}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item className={classes.gridItemMargin}>
                            <InputLabel htmlFor="select-ticket-service-facility">
                                {formatMessage({id: 'ticketServiceFacility'})}
                            </InputLabel>
                            <Select
                                displayEmpty
                                disabled={true}
                                value={pointOfInterest.ticketServiceFacility}
                                renderValue={selected => selected ? formatMessage({id: pointOfInterest.ticketServiceFacility}) :
                                    <em>{formatMessage({id: 'undefined'})}</em>
                                }
                                input={<Input className={classes.selectInput} id="select-ticket-service-facility"/>}
                                >
                                {ticketFacilityServices.map(key => (
                                    <MenuItem key={key} value={key}>
                                        <ListItemText
                                            primary={formatMessage({id: `${key}`})}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </Tab>
            </Tabs>
        </div>
    );
}


export default injectIntl(PointOfInterestItemExpandedFields);