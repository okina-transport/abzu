
import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import React, {Component} from 'react';

const ERROR_TYPE_MESSAGE_IDS = {
    "TEMPLATE": "import_error_type_template",
    "ENCODING": "import_error_type_encoding",
    "MISSING_DATA": "import_error_type_missing_data",
    "DUPLICATE_ID_FILE": "import_error_type_duplicate_id_file",
    "INVALID_FORMAT_NUMBER": "import_error_type_invalid_format_number",
    "INVALID_FORMAT_COORDINATE": "import_error_type_invalid_format_coordinate",
    "INVALID_FORMAT_ENUM": "import_error_type_invalid_format_enum",
    "NO_DATA_ROWS": "import_error_type_no_data_rows_poi"
};

class ImportPOIStats extends Component{

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            error: null,
            emptyResult: false
        };
        this.fetchData = this.fetchData.bind(this);
    }

    async fetchData() {
        try {

            const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
            const url = tiamatBaseUrl + "poi/poi_import_list";



            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("ABZU::jwt"),
                }
            });


            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            this.setState(prevState => {
                if (jsonData == null || jsonData.length == 0){
                    return { emptyResult: true, loading: false };
                }else if (JSON.stringify(prevState.data) !== JSON.stringify(jsonData)) {
                    return { data: jsonData, loading: false , emptyResult: false };
                }
            });
        } catch (error) {
            this.setState({ error, loading: false });
        }
    }

    componentDidMount() {
        this.fetchData();
        //call data recovery every 15s
        this.intervalId = setInterval(this.fetchData, 15000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Clear interval on component unmount
    }

    formatError(err, formatMessage) {
        if (err.code === 'MISSING_DATA' && err.params && err.params.field) {
            return formatMessage({id: 'import_error_missing_data_detail'}, err.params);
        }
        const message = ERROR_TYPE_MESSAGE_IDS[err.code] ? formatMessage({id: ERROR_TYPE_MESSAGE_IDS[err.code]}, err.params) : err.code;
        if (err.code !== 'TEMPLATE') {
            return message;
        }
        const { unExpectedColumns, missingColumns, orderIssue } = err.params || {};
        const hasDetails = unExpectedColumns || missingColumns || orderIssue === 'true';
        return (
            <React.Fragment>
                <div>{message}</div>
                {!hasDetails ? <div>{formatMessage({id: 'import_error_template_expected_columns_poi'})}</div> : null}
                {unExpectedColumns ? <div>{formatMessage({id: 'import_error_template_unexpected_columns'}, {columns: unExpectedColumns})}</div> : null}
                {missingColumns ? <div>{formatMessage({id: 'import_error_template_missing_columns'}, {columns: missingColumns})}</div> : null}
                {orderIssue === 'true' ? <div>{formatMessage({id: 'import_error_template_order_issue'})}</div> : null}
            </React.Fragment>
        );
    }

    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString(); // Format date as a readable string
    }

    getStatusStyle(status) {
        switch (status) {
            case 'FINISHED':
                return styles.statusFinished;
            case 'FAILED':
                return styles.statusFailed;
            case 'PROCESSING':
                return styles.statusProcessing;
            default:
                return {};
        }
    }





    render(){

        const { data, loading, error, emptyResult } = this.state;
        const { intl: { formatMessage } } = this.props;

        if (emptyResult) {
            return <div>Aucun import effectué</div>;
        }
        if (loading) {
            return <div>Chargement de l'historique des imports...</div>;
        }

        if (error) {
            return <div>Error: {error.message}</div>;
        }

        return (
            <div>
                <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Filename</th>
                        <th style={styles.th}>Started</th>
                        <th style={styles.th}>Finished</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Error detail</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(item => (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.id}</td>
                            <td style={styles.td}>{item.fileName}</td>
                            <td style={styles.td}>{this.formatDate(item.started)}</td>
                            <td style={styles.td}>{this.formatDate(item.finished)}</td>
                            <td
                                style={{
                                    ...styles.td,
                                    ...this.getStatusStyle(item.status)
                                }}
                            >
                                {item.status}
                            </td>
                            <td style={styles.td}>
                                {item.errors && item.errors.length > 0
                                    ? item.errors.map((err, index) => (
                                        <div key={index}>
                                            {this.formatError(err, formatMessage)}
                                        </div>
                                    ))
                                    : null}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        );
    }

}

const styles = {
    table: {
        width: '90%',
        borderCollapse: 'collapse',
        marginTop: '30px'
    },
    tableWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 30,
    },
    statusFinished: {
        backgroundColor: 'lightgreen',
        color: 'black',
    },
    statusFailed: {
        backgroundColor: 'lightcoral',
        color: 'black',
    },
    statusProcessing: {
        backgroundColor: 'lightblue',
        color: 'black',
    },
    th: {
        border: '1px solid black',
        padding: '8px',
        textAlign: 'center',
        backgroundColor: '#f2f2f2'
    },
    td: {
        border: '1px solid black',
        padding: '8px',
        textAlign: 'center'
    }
};

const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default withApollo(connect(mapStateToProps)(injectIntl(ImportPOIStats)));