import {Tab, Tabs} from "material-ui/Tabs";
import {Chip, Grid, Paper} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import {ticketFacilities} from "../../models/ticketFacility";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import {ticketFacilityServices} from "../../models/ticketFacilityService";
import React, {useState, useEffect } from "react";
import {injectIntl} from "react-intl";
import {makeStyles} from "@material-ui/core/styles";
import TextField from "material-ui/TextField";
import TimePicker from "material-ui/TimePicker";
import days from "../../models/days";



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

const PointOfInterestScheduleField = (props) => {
    const {
        intl: {formatMessage},
        pointOfInterest,
        locale,
    } = props;

    const facilities = ["Journée", "Demi journée", ""];

    const classes = useStyles();

    const [dayStates, setDayStates] = useState({});

    const mapOpeningHours = (initialOpeningHours) => {
        const mappedOpeningHours = {};

        if (initialOpeningHours && initialOpeningHours.dayType) {
            initialOpeningHours.dayType.forEach((dayType) => {
                const { dayOfWeek, timeBand } = dayType;

                if (Array.isArray(timeBand) && timeBand.length === 1) {
                    const timeBandDay = timeBand[0];
                    const startTime = new Date(timeBandDay.startTime);
                    const endTime = new Date(timeBandDay.endTime);

                    mappedOpeningHours[dayOfWeek] = {
                        facility: "Journée",
                        startTime,
                        endTime,
                    };
                } else if (Array.isArray(timeBand) && timeBand.length === 2) {
                    const timeBandAm = timeBand[0];
                    const startTimeAm = new Date(timeBandAm.startTime);
                    const endTimeAm = new Date(timeBandAm.endTime);

                    const timeBandPm = timeBand[1];
                    const startTimePm = new Date(timeBandPm.startTime);
                    const endTimePm = new Date(timeBandPm.endTime);
                    mappedOpeningHours[dayOfWeek] = {
                        facility: "Demi journée",
                        startTimeAm,
                        endTimeAm,
                        startTimePm,
                        endTimePm,
                    };
                }
            });
        }
        return mappedOpeningHours;
    };

    const [pointOfInterestOpeningHours, setPointOfInterestOpeningHours] = useState(mapOpeningHours(pointOfInterest.pointOfInterestOpeningHours));

    useEffect(() => {
        debugger;;
        const mappedOpeningHours = mapOpeningHours(pointOfInterest.pointOfInterestOpeningHours);
        setPointOfInterestOpeningHours(mappedOpeningHours);
    }, [pointOfInterest.id]);


    const handleFacilitiesChange = (day, facility) => {
        if (facility === "Journée") {
            const updatedPointOfInterestOpeningHours = {
                ...pointOfInterestOpeningHours,
                [day]: {
                    facility,
                    startTime: "",
                    endTime: "",
                },
            };
            setPointOfInterestOpeningHours(updatedPointOfInterestOpeningHours);
        } else if (facility === "Demi journée"){
            const updatedPointOfInterestOpeningHours = {
                ...pointOfInterestOpeningHours,
                [day]: {
                    facility,
                    startTimeAm: "",
                    endTimeAm: "",
                    startTimePm: "",
                    endTimePm: "",
                },
            };
            setPointOfInterestOpeningHours(updatedPointOfInterestOpeningHours);
        }else if (facility === ""){
            const updatedPointOfInterestOpeningHours = {
                ...pointOfInterestOpeningHours,
                [day]: {
                    facility,
                    startTimeAm: "",
                    endTimeAm: "",
                    startTimePm: "",
                    endTimePm: "",
                    startTime: "",
                    endTime: "",
                },
            };
            setPointOfInterestOpeningHours(updatedPointOfInterestOpeningHours);

            const updatedPointOfInterest = {
                ...pointOfInterest,
                pointOfInterestOpeningHours: updatedPointOfInterestOpeningHours,
            };

            props.updatePointOfInterest(updatedPointOfInterest);
        } else {
            const { [day]: omit, ...updatedPointOfInterestOpeningHours } = pointOfInterestOpeningHours;
            setPointOfInterestOpeningHours(updatedPointOfInterestOpeningHours);
        }

        setDayStates((prevState) => ({
            ...prevState,
            [day]: facility,
        }));
    };

    const handleScheduleChange = (day, facility, type, value) => {
        const selectedTime = new Date();
        selectedTime.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
        let updatedPointOfInterestOpeningHours = {
            ...pointOfInterestOpeningHours,
            [day]: {
                ...pointOfInterestOpeningHours[day],
                facility,
                [type]: selectedTime,
            },
        };

        setPointOfInterestOpeningHours(updatedPointOfInterestOpeningHours);

        const updatedPointOfInterest = {
            ...pointOfInterest,
            pointOfInterestOpeningHours: updatedPointOfInterestOpeningHours,
        };

        // Mettre à jour l'objet pointOfInterest dans le composant parent
        props.updatePointOfInterest(updatedPointOfInterest);
    };

    function getInputLabelName(day) {
        if (pointOfInterestOpeningHours && pointOfInterestOpeningHours[day.value]) {
            const timeBand = pointOfInterestOpeningHours[day.value];

            if (timeBand.facility === "Journée" && timeBand.startTime && timeBand.endTime) {
                const { startTime, endTime } = timeBand;
                return `${day.name} (${startTime.getHours()}:${startTime.getMinutes()} - ${endTime.getHours()}:${endTime.getMinutes()})`;

            } else if (timeBand.facility === "Demi journée"  && timeBand.startTimeAm && timeBand.endTimeAm  && timeBand.startTimePm && timeBand.endTimePm) {
                const { startTimeAm, endTimeAm, startTimePm, endTimePm } = timeBand;
                return `${day.name} (am : ${startTimeAm.getHours()}:${startTimeAm.getMinutes()} - ${endTimeAm.getHours()}:${endTimeAm.getMinutes()} \n pm : ${startTimePm.getHours()}:${startTimePm.getMinutes()} - ${endTimePm.getHours()}:${endTimePm.getMinutes()})`;

            }
        }
        return `${day.name}`;
    }

    return (
        <div>
        {days[locale].map((day) =>
        <Grid item className={classes.gridItemMargin} key={day.value}>
            <InputLabel htmlFor={`select-schedule-facility-${day.value}`}>
                {getInputLabelName(day)}
            </InputLabel>
            <Select
                value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].facility ? pointOfInterestOpeningHours[day.value].facility : ''}
                onChange={(event) => handleFacilitiesChange(day.value, event.target.value)}
                input={<Input className={classes.selectInput} id={`select-schedule-facility-${day.value}`}/>}
            >
                {facilities.map((facility) => (
                    <MenuItem key={facility} value={facility}>
                        {facility}
                    </MenuItem>
                ))}
            </Select>
            {pointOfInterestOpeningHours[day.value] && dayStates[day.value] === 'Journée' && (
                <div>
                    <InputLabel htmlFor={`select-time-${day.value}`}>Saisir horaires</InputLabel>
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].startTime ? pointOfInterestOpeningHours[day.value].startTime : ""}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'startTime', value)}
                        hintText="Heure de début"
                    />
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].startTime ? pointOfInterestOpeningHours[day.value].endTime : ""}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'endTime', value)}
                        hintText="Heure de fin"
                    />
                </div>
            )}
            {pointOfInterestOpeningHours[day.value] && dayStates[day.value] === 'Demi journée' && (
                <div>
                    <InputLabel htmlFor={`select-time-am-${day.value}`}>Saisir temps (matin)</InputLabel>
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].startTimeAm ? pointOfInterestOpeningHours[day.value].startTimeAm : null}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'startTimeAm', value)}
                        hintText="Heure de début (AM)"
                    />
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].endTimeAm ? pointOfInterestOpeningHours[day.value].endTimeAm : null}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'endTimeAm', value)}
                        hintText="Heure de fin (AM)"
                    />
                    <InputLabel htmlFor={`select-time-pm-${day.value}`}>Saisir temps (après-midi)</InputLabel>
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].startTimePm ? pointOfInterestOpeningHours[day.value].startTimePm : null}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'startTimePm', value)}
                        hintText="Heure de début (PM)"
                    />
                    <TimePicker
                        value={pointOfInterestOpeningHours[day.value] && pointOfInterestOpeningHours[day.value].endTimePm ? pointOfInterestOpeningHours[day.value].endTimePm : null}
                        onChange={(event, value) => handleScheduleChange(day.value, pointOfInterestOpeningHours[day.value].facility, 'endTimePm', value)}
                        hintText="Heure de fin (PM)"
                    />
                </div>
            )}
        </Grid>
            )}
        </div>
    );
}

export default injectIntl(PointOfInterestScheduleField);