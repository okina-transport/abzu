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
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import ModalityIconSvg from '../MainPage/ModalityIconSvg';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import {
    getStopPlacesForSubmodes,
    getInverseSubmodesWhitelist
} from '../../roles/rolesParser';
import Menu from 'material-ui/Menu';

class ModalitiesParkingMenuItems extends React.Component {
    render() {
        const {
            parkingTypes,
            handleParkingTypeChange,
            parkingTypeChosen
        } = this.props;

        const chosenStyle = { fontWeight: 600 };

        return (
            <Menu>

                {parkingTypes.map((type, index) => {
                    const parkingTypeMatchingChosen = parkingTypeChosen === type.value;

                    return (
                        <MenuItem
                            key={'parking' + index}
                            value={type.value}
                            style={{ padding: '0px 10px' }}
                            primaryText={
                                <span
                                    style={
                                        parkingTypeMatchingChosen ? chosenStyle : {}
                                    }
                                >
                  {type.name}
                </span>
                            }
                            onClick={() => { handleParkingTypeChange(type.value);
                            }}
                            insetChildren={true}
                            leftIcon={
                                <ModalityIconSvg iconStyle={{ float: 'left' }} type={type.value} />
                            }
                        />
                    );
                })}
            </Menu>
        );
    }
}

const mapStateToProps = state => ({
    allowsInfo: state.roles.allowanceInfo
});

export default connect(mapStateToProps)(ModalitiesParkingMenuItems);
