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
import {connect} from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';

class ParkingCoveredMenuItems extends React.Component {

    getNameFromValue(types, value) {
        let name = null;
        types.map((type, index) => {
            if (type.value === value) {
                name = type.name;
            }
        });
        return name;
    }

    render() {
        const {
            parkingTypesCovered,
            handleParkingCoveredChange,
            parkingCoveredChosen
        } = this.props;

        const chosenStyle = {fontWeight: 600};

        return (
            <Select
                value={parkingCoveredChosen}
                input={<Input style={{width: '100%'}} id="select-infrastructure"/>}
                renderValue={selected => selected ? this.getNameFromValue(parkingTypesCovered, parkingCoveredChosen) : "Non défini"}
                onChange={(event) => {
                    const {value} = event.target;
                    handleParkingCoveredChange(value);
                }}
            >
                {parkingTypesCovered.map((type, index) => {
                    const parkingTypeMatchingChosen = parkingCoveredChosen === type.value;

                    return (
                        <MenuItem
                            key={'parking' + index}
                            value={type.value}
                            style={{padding: '0px 10px'}}
                            primaryText={
                                <span
                                    style={
                                        parkingTypeMatchingChosen ? chosenStyle : {}
                                    }
                                >
                                    {type.name}
                                </span>
                            }   
                            insetChildren={true}
                        />
                    );
                })}
            </Select>
        );
    }
}

const mapStateToProps = state => ({
    allowsInfo: state.roles.allowanceInfo
});

export default connect(mapStateToProps)(ParkingCoveredMenuItems);
