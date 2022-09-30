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
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MdCancel from 'material-ui/svg-icons/navigation/cancel';
import MdDeleteForever from 'material-ui/svg-icons/action/delete-forever';
import { getEarliestFromDate } from '../../utils/saveDialogUtils';
import areIntlLocalesSupported from 'intl-locales-supported';
import Spinner from '../../static/icons/spinner';

let DateTimeFormat;

if (areIntlLocalesSupported(['nb'])) {
    DateTimeFormat = global.Intl.DateTimeFormat;
} else {
    const IntlPolyfill = require('intl');
    DateTimeFormat = IntlPolyfill.DateTimeFormat;
    require('intl/locale-data/jsonp/nb');
}

class TerminatePointOfInterestDialog extends React.Component {
    static propTypes = {
        open: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleConfirm: PropTypes.func.isRequired,
        warningInfo: PropTypes.object,
        intl: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.open !== nextProps.open && nextProps.open) {
            this.setState(this.getInitialState(nextProps));
        }
    }

    getConfirmIsDisabled() {
        const { pointOfInterest, isLoading } = this.props;
        const { isChildOfParent, hasExpired } = pointOfInterest;
        const { shouldHardDelete } = this.state;

        // only possible to delete poi if parking has expired
        const expiredNotDeleteCondition = hasExpired
            ? !(hasExpired && shouldHardDelete)
            : false;
        return !!isChildOfParent || isLoading || expiredNotDeleteCondition;
    }

    getInitialState(props) {
        const earliestFrom = getEarliestFromDate(
            props.previousValidBetween,
            this.props.serverTimeDiff
        );
        return {
            shouldHardDelete: false,
            shouldTerminatePermanently: false,
            date: earliestFrom,
            time: earliestFrom,
            comment: ''
        };
    }

    render() {
        const {
            open,
            intl,
            handleClose,
            handleConfirm,
            pointOfInterest,
            isLoading,
        } = this.props;
        const { formatMessage } = intl;

        const translations = {
            confirm: formatMessage({ id: 'confirm' }),
            cancel: formatMessage({ id: 'cancel' }),
            title: formatMessage({ id: 'terminate_poi_title' }),
            permanentLabel: formatMessage({ id: 'permanently_terminate_poi' }),
            deleteLabel: formatMessage({ id: 'terminate_poi_title' }),
            deleteWarning: formatMessage({ id: 'delete_poi_info' }),
            permanentWarning: formatMessage({ id: 'permanently_terminate_warning' }),
            cannotDelete: formatMessage({ id: 'delete_poi_not_allowed' }),
            comment: formatMessage({ id: 'comment' }),
            date: formatMessage({ id: 'date' }),
            time: formatMessage({ id: 'time' })
        };


        const actions = [
            <FlatButton
                label={translations.cancel}
                onClick={handleClose}
                icon={<MdCancel />}
            />,
            <FlatButton
                label={translations.confirm}
                onClick={() => handleConfirm()}
                disabled={this.getConfirmIsDisabled()}
                primary={true}
                keyboardFocused={true}
                icon={
                    isLoading ? (
                        <Spinner />
                    ) : (
                        <MdDeleteForever />
                    )
                }
            />
        ];

        return (
            <Dialog
                title={translations.title}
                actions={actions}
                modal={true}
                open={open}
                titleStyle={{ padding: '24px 24px 0px' }}
                onRequestClose={() => {
                    handleClose();
                }}
                contentStyle={{ width: '40%', minWidth: '40%', margin: 'auto' }}
            >
                <div>
                    <div style={{ marginBottom: 10, color: '#000' }}>
            <span style={{ fontWeight: 600 }}>{`${pointOfInterest.name} (${
                pointOfInterest.id
            })`}</span>
                    </div>
                </div>
            </Dialog>
        );
    }
}

export default TerminatePointOfInterestDialog;
