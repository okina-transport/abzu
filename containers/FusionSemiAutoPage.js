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


import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
    Grid,
    Typography,
    CircularProgress,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Checkbox,
    IconButton
} from '@material-ui/core';
import { httpCall } from '../utils/httpCall';

class FusionSemiAutoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            job: null,
            error: null,
            mergeScope: 'intra',
            organisation: 'all',
            providers: [],
            searchLoading: false,
            searchError: null,
            mergeableStopPlaces: null,
            selectedMerges: {},
            swappedPairs: {},
            page: 0,
            size: 100,
            launchingMerge: false,
            launchMergeError: null
        };
        this.handleMergeScopeChange = this.handleMergeScopeChange.bind(this);
        this.handleOrganisationChange = this.handleOrganisationChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleToggleMerge = this.handleToggleMerge.bind(this);
        this.handleToggleAllMerges = this.handleToggleAllMerges.bind(this);
        this.handleToggleSwitch = this.handleToggleSwitch.bind(this);
        this.handlePreviousPage = this.handlePreviousPage.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handleLaunchMerge = this.handleLaunchMerge.bind(this);
    }

    handleMergeScopeChange(event) {
        const mergeScope = event.target.value;
        this.setState({
            mergeScope,
            organisation: mergeScope === 'extra' ? 'all' : this.state.organisation
        });
    }

    handleOrganisationChange(event) {
        this.setState({ organisation: event.target.value });
    }

    handleSearch() {
        this.fetchMergeableStopPlaces(0, true);
    }

    handlePreviousPage() {
        const { page } = this.state;
        if (page > 0) {
            this.fetchMergeableStopPlaces(page - 1, false);
        }
    }

    handleNextPage() {
        const { mergeableStopPlaces, page } = this.state;
        if (mergeableStopPlaces && mergeableStopPlaces.hasMore) {
            this.fetchMergeableStopPlaces(page + 1, false);
        }
    }

    fetchMergeableStopPlaces(page, resetSelection) {
        const { mergeScope, organisation, size } = this.state;
        const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
        const mode = mergeScope === 'intra' ? 'SAME_PROVIDER' : 'MULTI_PROVIDER';

        const queryParams = new URLSearchParams({
            mode,
            page,
            size
        });
        if (organisation !== 'all') {
            queryParams.set('provider', organisation);
        }

        const url = tiamatBaseUrl + "mergeable?" + queryParams.toString();

        this.setState({ searchLoading: true, searchError: null });

        httpCall(url, {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt")
            }
        }).then(response => {
            this.setState(prevState => {
                const data = response.data;
                const selectedMerges = resetSelection ? {} : { ...prevState.selectedMerges };
                const swappedPairs = resetSelection ? {} : { ...prevState.swappedPairs };

                if (mode === 'SAME_PROVIDER' && data && Array.isArray(data.content)) {
                    data.content.forEach(pair => {
                        if (this.shouldAutoSelectPair(pair)) {
                            selectedMerges[this.getPairKey(pair)] = true;
                        }
                    });
                }

                return {
                    searchLoading: false,
                    mergeableStopPlaces: data,
                    selectedMerges,
                    swappedPairs,
                    page
                };
            });
        }).catch(error => {
            this.setState({ searchLoading: false, searchError: error });
        });
    }

    roundCoordinate(value) {
        return Math.round(value * 1e5) / 1e5;
    }

    shouldAutoSelectPair(pair) {
        const { base, candidate } = pair;
        return base.modality === candidate.modality
            && this.roundCoordinate(base.latitude) === this.roundCoordinate(candidate.latitude)
            && this.roundCoordinate(base.longitude) === this.roundCoordinate(candidate.longitude);
    }

    getPairKey(pair) {
        return pair.base.netexId + '|' + pair.candidate.netexId;
    }

    getEffectivePair(pair, swapped) {
        return swapped ? { base: pair.candidate, candidate: pair.base } : pair;
    }

    getStopPlaceUrl(netexId) {
        return window.config.endpointBase + 'stop_place/' + netexId;
    }

    handleToggleMerge(pairKey) {
        this.setState(prevState => ({
            selectedMerges: {
                ...prevState.selectedMerges,
                [pairKey]: !prevState.selectedMerges[pairKey]
            }
        }));
    }

    handleToggleAllMerges(checked) {
        const { mergeableStopPlaces } = this.state;
        if (!mergeableStopPlaces || !Array.isArray(mergeableStopPlaces.content)) {
            return;
        }

        this.setState(prevState => {
            const selectedMerges = { ...prevState.selectedMerges };
            mergeableStopPlaces.content.forEach(pair => {
                const swapped = !!prevState.swappedPairs[this.getPairKey(pair)];
                const effectivePair = this.getEffectivePair(pair, swapped);
                selectedMerges[this.getPairKey(effectivePair)] = checked;
            });
            return { selectedMerges };
        });
    }

    handleToggleSwitch(pair) {
        const rawKey = this.getPairKey(pair);
        this.setState(prevState => {
            const swapped = !!prevState.swappedPairs[rawKey];
            const newSwapped = !swapped;
            const oldEffectiveKey = this.getPairKey(this.getEffectivePair(pair, swapped));
            const newEffectiveKey = this.getPairKey(this.getEffectivePair(pair, newSwapped));

            const selectedMerges = { ...prevState.selectedMerges };
            const wasSelected = !!selectedMerges[oldEffectiveKey];
            delete selectedMerges[oldEffectiveKey];
            selectedMerges[newEffectiveKey] = wasSelected;

            return {
                swappedPairs: {
                    ...prevState.swappedPairs,
                    [rawKey]: newSwapped
                },
                selectedMerges
            };
        });
    }

    getSelectedCouples() {
        const { selectedMerges } = this.state;
        return Object.keys(selectedMerges)
            .filter(pairKey => selectedMerges[pairKey])
            .map(pairKey => {
                const [target, origin] = pairKey.split('|');
                return { target, origin };
            });
    }

    handleLaunchMerge() {
        const couples = this.getSelectedCouples();
        if (couples.length === 0) {
            return;
        }

        const { mergeScope, organisation } = this.state;
        const mode = mergeScope === 'intra' ? 'SAME_PROVIDER' : 'MULTI_PROVIDER';

        const queryParams = new URLSearchParams({ mode });
        if (organisation !== 'all') {
            queryParams.set('provider', organisation);
        }

        const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
        const url = tiamatBaseUrl + "mergeable/merge?" + queryParams.toString();

        this.setState({ launchingMerge: true, launchMergeError: null });

        httpCall(url, {
            method: 'post',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt"),
                "Content-Type": "application/json"
            },
            data: couples
        }).then(() => {
            this.setState({
                launchingMerge: false,
                mergeableStopPlaces: null,
                selectedMerges: {}
            });
            this.fetchRunningJob();
        }).catch(error => {
            this.setState({ launchingMerge: false, launchMergeError: error });
        });
    }

    componentDidMount() {
        this.fetchRunningJob();
        this.fetchProviders();
    }

    componentWillUnmount() {
        if (this.reloadTimeoutId) {
            clearTimeout(this.reloadTimeoutId);
        }
    }

    fetchRunningJob() {
        const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
        const url = tiamatBaseUrl + "mergeable/merge/running";

        httpCall(url, {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt")
            }
        }).then(response => {
            const job = response.status === 204 ? null : response.data;
            this.setState({ loading: false, job, error: null });
            if (job) {
                this.reloadTimeoutId = setTimeout(() => {
                    window.location.reload();
                }, 30000);
            }
        }).catch(error => {
            this.setState({ loading: false, error });
        });
    }

    fetchProviders() {
        const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
        const url = tiamatBaseUrl + "mergeable/getAllProviders";

        httpCall(url, {
            method: 'get',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("ABZU::jwt")
            }
        }).then(response => {
            this.setState({ providers: response.data || [] });
        }).catch(error => {
            console.log("Error fetching providers => ", error);
        });
    }

    formatDate(started) {
        if (!started) return '';
        const date = new Date(started * 1000);
        return isNaN(date.getTime()) ? started : date.toLocaleString();
    }

    render() {
        const { intl: { formatMessage } } = this.props;
        const {
            loading, job, error, mergeScope, organisation, providers,
            searchLoading, searchError, mergeableStopPlaces, selectedMerges, swappedPairs, page,
            launchingMerge, launchMergeError
        } = this.state;
        const selectedCount = Object.values(selectedMerges).filter(Boolean).length;

        return (
            <div>
                <Grid container spacing={2} style={{ padding: 20 }}>
                    <Grid item xs={12}>
                        <Typography variant="h4" style={styles.titleText}>
                            {formatMessage({ id: 'fusion_semi_auto_title' })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {loading && <CircularProgress size={24} />}
                        {!loading && !error && !job && (
                            <React.Fragment>
                            <div style={styles.searchCenterWrapper}>
                                <Paper style={styles.searchPaper}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">
                                            {formatMessage({ id: 'fusion_semi_auto_scope_label' })}
                                        </FormLabel>
                                        <RadioGroup value={mergeScope} onChange={this.handleMergeScopeChange}>
                                            <FormControlLabel
                                                value="intra"
                                                control={<Radio />}
                                                label={formatMessage({ id: 'fusion_semi_auto_scope_intra' })}
                                            />
                                            <FormControlLabel
                                                value="extra"
                                                control={<Radio />}
                                                label={formatMessage({ id: 'fusion_semi_auto_scope_extra' })}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControl style={styles.organisationFormControl}>
                                        <InputLabel id="fusion-semi-auto-organisation-label">
                                            {formatMessage({ id: 'fusion_semi_auto_organisation_label' })}
                                        </InputLabel>
                                        <Select
                                            labelId="fusion-semi-auto-organisation-label"
                                            value={organisation}
                                            onChange={this.handleOrganisationChange}
                                            disabled={mergeScope === 'extra'}
                                        >
                                            <MenuItem value="all">
                                                {formatMessage({ id: 'fusion_semi_auto_organisation_all' })}
                                            </MenuItem>
                                            {providers.map(provider => (
                                                <MenuItem key={provider} value={provider}>
                                                    {provider}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button variant="contained" color="primary" onClick={this.handleSearch} style={styles.searchButton}>
                                        {formatMessage({ id: 'fusion_semi_auto_search_button' })}
                                    </Button>
                                </Paper>
                            </div>
                            {searchLoading && (
                                <div style={styles.searchLoadingWrapper}>
                                    <CircularProgress size={24} />
                                </div>
                            )}
                            {!searchLoading && searchError && (
                                <Typography style={{ color: 'orangered', textAlign: 'center' }}>
                                    {formatMessage({ id: 'fusion_semi_auto_search_error' })}
                                </Typography>
                            )}
                            {!searchLoading && !searchError && mergeableStopPlaces && (
                                <div style={styles.resultsWrapper}>
                                    <Paper style={styles.resultsPaper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow style={styles.headerRow}>
                                                    <TableCell style={styles.switchHeaderCell}>{formatMessage({ id: 'fusion_semi_auto_column_switch' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_netex_id' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_name' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_latitude' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_longitude' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_mode' })}</TableCell>
                                                    <TableCell style={styles.headerCell}>{formatMessage({ id: 'fusion_semi_auto_column_organisation' })}</TableCell>
                                                    <TableCell style={styles.mergeHeaderCell}>
                                                        <div>{formatMessage({ id: 'fusion_semi_auto_column_merge' })}</div>
                                                        <div>
                                                            <Checkbox
                                                                checked={
                                                                    mergeableStopPlaces.content.length > 0
                                                                    && mergeableStopPlaces.content.every(pair => {
                                                                        const swapped = !!swappedPairs[this.getPairKey(pair)];
                                                                        const effectivePair = this.getEffectivePair(pair, swapped);
                                                                        return !!selectedMerges[this.getPairKey(effectivePair)];
                                                                    })
                                                                }
                                                                onChange={(event) => this.handleToggleAllMerges(event.target.checked)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {mergeableStopPlaces.content.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={8} style={{ textAlign: 'center' }}>
                                                            {formatMessage({ id: 'fusion_semi_auto_no_result' })}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {mergeableStopPlaces.content.map((pair) => {
                                                    const rawKey = this.getPairKey(pair);
                                                    const swapped = !!swappedPairs[rawKey];
                                                    const effectivePair = this.getEffectivePair(pair, swapped);
                                                    const pairKey = this.getPairKey(effectivePair);
                                                    return (
                                                    <React.Fragment key={rawKey}>
                                                        <TableRow>
                                                            <TableCell rowSpan={2} style={styles.mergeCell}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => this.handleToggleSwitch(pair)}
                                                                    aria-label={formatMessage({ id: 'fusion_semi_auto_column_switch' })}
                                                                >
                                                                    <span style={styles.switchIcon}>&#8645;</span>
                                                                </IconButton>
                                                            </TableCell>
                                                            <TableCell style={styles.bodyCell}>
                                                                <a href={this.getStopPlaceUrl(effectivePair.base.netexId)} target="_blank" rel="noopener noreferrer">
                                                                    {effectivePair.base.netexId}
                                                                </a>
                                                            </TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.base.name}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.base.latitude}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.base.longitude}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.base.modality}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.base.provider}</TableCell>
                                                            <TableCell rowSpan={2} style={styles.mergeCell}>
                                                                <Checkbox
                                                                    checked={!!selectedMerges[pairKey]}
                                                                    onChange={() => this.handleToggleMerge(pairKey)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow style={styles.candidateRow}>
                                                            <TableCell style={styles.bodyCell}>
                                                                <a href={this.getStopPlaceUrl(effectivePair.candidate.netexId)} target="_blank" rel="noopener noreferrer">
                                                                    {effectivePair.candidate.netexId}
                                                                </a>
                                                            </TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.candidate.name}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.candidate.latitude}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.candidate.longitude}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.candidate.modality}</TableCell>
                                                            <TableCell style={styles.bodyCell}>{effectivePair.candidate.provider}</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                        <div style={styles.paginationWrapper}>
                                            <Button
                                                onClick={this.handlePreviousPage}
                                                disabled={searchLoading || page === 0}
                                            >
                                                {formatMessage({ id: 'fusion_semi_auto_pagination_previous' })}
                                            </Button>
                                            <Typography style={styles.paginationPageText}>
                                                {formatMessage({ id: 'fusion_semi_auto_pagination_page' }, { page: page + 1 })}
                                            </Typography>
                                            <Button
                                                onClick={this.handleNextPage}
                                                disabled={searchLoading || !mergeableStopPlaces.hasMore}
                                            >
                                                {formatMessage({ id: 'fusion_semi_auto_pagination_next' })}
                                            </Button>
                                        </div>
                                        <div style={styles.footerActionsWrapper}>
                                            <Typography style={styles.selectedCountText}>
                                                {formatMessage(
                                                    { id: 'fusion_semi_auto_selected_count' },
                                                    { count: selectedCount }
                                                )}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={this.handleLaunchMerge}
                                                disabled={launchingMerge || selectedCount === 0}
                                            >
                                                {launchingMerge
                                                    ? <CircularProgress size={20} />
                                                    : formatMessage({ id: 'fusion_semi_auto_launch_merge_button' })}
                                            </Button>
                                        </div>
                                        {!launchingMerge && launchMergeError && (
                                            <Typography style={styles.launchMergeErrorText}>
                                                {formatMessage({ id: 'fusion_semi_auto_launch_merge_error' })}
                                            </Typography>
                                        )}
                                    </Paper>
                                </div>
                            )}
                            </React.Fragment>
                        )}
                        {!loading && !error && job && (
                            <React.Fragment>
                                <div style={styles.subtitleWrapper}>
                                    <CircularProgress size={24} />
                                    <Typography variant="subtitle1" style={styles.subtitleText}>
                                        {formatMessage({ id: 'fusion_semi_auto_subtitle_running' })}
                                    </Typography>
                                </div>
                                <div style={styles.tableCenterWrapper}>
                                    <div style={styles.tableWrapper}>
                                        <Table style={styles.table}>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>{formatMessage({ id: 'fusion_semi_auto_launched_by' })}</TableCell>
                                                    <TableCell>{job.username}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{formatMessage({ id: 'fusion_semi_auto_started_at' })}</TableCell>
                                                    <TableCell>{this.formatDate(job.started)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{formatMessage({ id: 'fusion_semi_auto_progress' })}</TableCell>
                                                    <TableCell>{job.totalCount - job.remainingCount} / {job.totalCount}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {!loading && error && (
                            <Typography style={{ color: 'orangered' }}>
                                {formatMessage({ id: 'fusion_semi_auto_error' })}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

const styles = {
    titleText: {
        textAlign: 'center'
    },
    tableCenterWrapper: {
        display: 'flex',
        justifyContent: 'center'
    },
    tableWrapper: {
        display: 'inline-block',
        border: '1px solid #ccc',
        borderRadius: 4
    },
    table: {
        width: 'auto'
    },
    subtitleWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    subtitleText: {
        marginLeft: 12
    },
    searchCenterWrapper: {
        display: 'flex',
        justifyContent: 'center'
    },
    searchPaper: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24
    },
    organisationFormControl: {
        minWidth: 200
    },
    searchButton: {
        height: 36,
        marginTop: 8
    },
    searchLoadingWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 20
    },
    resultsWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 20,
        paddingLeft: '22.5rem',
        paddingRight: '22.5rem'
    },
    resultsPaper: {
        width: '100%',
        overflowX: 'auto'
    },
    candidateRow: {
        borderBottom: '2px solid #ccc'
    },
    headerRow: {
        backgroundColor: '#e0e0e0'
    },
    headerCell: {
        verticalAlign: 'top',
        textAlign: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    bodyCell: {
        textAlign: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    switchHeaderCell: {
        verticalAlign: 'top',
        textAlign: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    mergeHeaderCell: {
        textAlign: 'center',
        verticalAlign: 'top',
        paddingLeft: 16,
        paddingRight: 16
    },
    mergeCell: {
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingLeft: 16,
        paddingRight: 16
    },
    switchIcon: {
        fontSize: 20,
        lineHeight: 1
    },
    paginationWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 16
    },
    paginationPageText: {
        minWidth: 80,
        textAlign: 'center'
    },
    selectedCountText: {
        textAlign: 'left'
    },
    footerActionsWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 16px 16px'
    },
    launchMergeErrorText: {
        color: 'orangered',
        textAlign: 'center',
        paddingBottom: 16
    }
};

const mapStateToProps = state => ({
    kc: state.roles.kc
});

export default connect(mapStateToProps)(injectIntl(FusionSemiAutoPage));
