
import {withApollo} from "react-apollo";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import React, {Component} from 'react';

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
            const url = tiamatBaseUrl + "parking/parking_import_list";


            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const jsonData = await response.json();
            this.setState(prevState => {

                if (jsonData == null || jsonData.length == 0){
                    return { emptyResult: true, loading: false };
                }else if (JSON.stringify(prevState.data) !== JSON.stringify(jsonData)) {
                    return { data: jsonData, loading: false , emptyResult: false};
                }
                return null;
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