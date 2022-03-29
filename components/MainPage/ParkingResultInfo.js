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

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getPrimaryDarkerColor} from '../../config/themeConfig';
import {getIn} from "../../utils";
import ModalityIconImg from "./ModalityIconImg";
import WheelChair from "material-ui/svg-icons/action/accessible";


class ParkingResultInfo extends Component {

    render() {
        const {result, formatMessage} = this.props;
        const primaryDarker = getPrimaryDarkerColor();

        const hasWheelchairAccess =
            getIn(
                result,
                ['accessibilityAssessment', 'limitations', 'wheelchairAccess'],
                null
            ) === 'TRUE';

        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 0
                    }}
                >
                    <div style={{fontSize: 28, fontWeight: 600}}>{result.name}</div>
                    <ModalityIconImg type={result.parkingType}/>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', marginLeft: 10}}>
                    <div style={{fontSize: 14}}>{result.id}</div>
                </div>
                {hasWheelchairAccess
                    ? <div
                        style={{
                            display: 'flex',
                            marginLeft: 5,
                            alignItems: 'center',
                            fontSize: 12
                        }}
                    >
                        <WheelChair color={primaryDarker}/>
                        <span style={{marginLeft: 5}}>
                {formatMessage({id: 'wheelchairAccess'})}
              </span>
                    </div>
                    : null}
            </div>
        );
    }
}

ParkingResultInfo.propTypes = {
    result: PropTypes.object.isRequired,
    formatMessage: PropTypes.func.isRequired
};

export default ParkingResultInfo;
