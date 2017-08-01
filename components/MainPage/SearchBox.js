import { connect } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import AutoComplete from 'material-ui/AutoComplete';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { StopPlaceActions, UserActions } from '../../actions/';
import SearchBoxDetails from './SearchBoxDetails';
import cfgreader from '../../config/readConfig';
import NewStopPlace from './CreateNewStop';
import { injectIntl } from 'react-intl';
import MenuItem from 'material-ui/MenuItem';
import ModalityIcon from './ModalityIcon';
import SearchIcon from 'material-ui/svg-icons/action/search';
import FavoriteManager from '../../singletons/FavoriteManager';
import CoordinatesDialog from '../Dialogs/CoordinatesDialog';
import { findStop, topopGraphicalPlacesQuery } from '../../graphql/Queries';
import { withApollo } from 'react-apollo';
import FavoritePopover from './FavoritePopover';
import ModalityFilter from '../EditStopPage/ModalityFilter';
import FavoriteNameDialog from '../Dialogs/FavoriteNameDialog';
import TopographicalFilter from './TopographicalFilter';
import Divider from 'material-ui/Divider';
import debounce from 'lodash.debounce';
import { getIn } from '../../utils/';
import { enturPrimaryDarker } from '../../config/enturTheme';
import MdLocationSearching from 'material-ui/svg-icons/device/location-searching';

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreFilterOptions: false,
      coordinatesDialogOpen: false,
    };

    const searchStop = (searchText, dataSource, params, filter) => {
      if (!searchText || !searchText.length) {
        this.props.dispatch(UserActions.clearSearchResults());
      } else if (searchText.indexOf('(') > -1 && searchText.indexOf(')') > -1) {
        return;
      } else {
        const chips = filter ? filter.topoiChips : this.props.topoiChips;
        const stopPlaceTypes = filter
          ? filter.stopType
          : this.props.stopTypeFilter;

        this.props.client.query({
          query: findStop,
          fetchPolicy: 'network-only',
          variables: {
            query: searchText,
            stopPlaceType: stopPlaceTypes,
            municipalityReference: chips
              .filter(topos => topos.type === 'town')
              .map(topos => topos.value),
            countyReference: this.props.topoiChips
              .filter(topos => topos.type === 'county')
              .map(topos => topos.value),
          },
        });
        this.props.dispatch(UserActions.setSearchText(searchText));
      }
    };
    this.handleSearchUpdate = debounce(searchStop, 200);
  }

  componentDidMount() {
    cfgreader.readConfig(
      function(config) {
        window.config = config;
        this.refs.searchText.focus();
      }.bind(this),
    );
  }

  handleEdit(id) {
    this.props.dispatch(UserActions.navigateTo('/edit/', id));
  }

  handleSaveAsFavorite() {
    this.props.dispatch(UserActions.openFavoriteNameDialog());
  }

  removeFiltersAndSearch() {
    this.props.dispatch(UserActions.removeAllFilters());
    this.handleSearchUpdate(this.props.searchText, null, null, {
      topoiChips: [], stopTypeFilter: []
    });
  }

  handleRetrieveFilter(filter) {
    this.props.dispatch(UserActions.loadFavoriteSearch(filter));
    this.handleSearchUpdate(filter.searchText, null, null, filter);

    this.refs.searchText.setState({
      open: true,
      anchorEl: ReactDOM.findDOMNode(this.refs.searchText),
    });
  }

  handlePopoverDismiss(filters) {
    this.props.dispatch(UserActions.applyStopTypeSearchFilter(filters));
  }

  handleTopographicalPlaceInput(searchText) {
    this.props.client.query({
      query: topopGraphicalPlacesQuery,
      fetchPolicy: 'network-only',
      variables: {
        query: searchText,
      },
    });
  }

  handleNewRequest(result) {
    if (typeof result.element !== 'undefined') {
      this.props.dispatch(StopPlaceActions.setMarkerOnMap(result.element));
    }
  }

  handleOpenCoordinatesDialog() {
    this.setState({
      coordinatesDialogOpen: true,
    });
  }

  handleOpenLookupCoordinatesDialog() {
    this.props.dispatch(UserActions.openLookupCoordinatesDialog());
  }

  handleCloseLookupCoordinatesDialog() {
    this.props.dispatch(UserActions.closeLookupCoordinatesDialog());
  }

  handleApplyFilters(filters) {
    this.props.dispatch(UserActions.applyStopTypeSearchFilter(filters));
  }

  handleSubmitCoordinates(position) {
    this.props.dispatch(StopPlaceActions.changeMapCenter(position, 11));
    this.props.dispatch(
      UserActions.setMissingCoordinates(position, this.props.chosenResult.id),
    );

    this.setState({
      coordinatesDialogOpen: false,
    });
  }

  handleAddChip({ text, type, id }) {
    this.props.dispatch(
      UserActions.addToposChip({ text: text, type: type, value: id }),
    );
    this.refs.topoFilter.setState({
      searchText: '',
    });
  }
  handleNewStop() {
    this.props.dispatch(UserActions.toggleIsCreatingNewStop());
  }

  handleLookupCoordinates(position) {
    this.props.dispatch(UserActions.lookupCoordinates(position, false));
    this.handleCloseLookupCoordinatesDialog();
  }

  handleClearSearch() {
    this.refs.searchText.setState({
      searchText: '',
    });
    this.props.dispatch(UserActions.setSearchText(''));
  }

  handleToggleFilter(value) {
    this.setState({
      showMoreFilterOptions: value,
    });
  }

  getTopographicalNames(topographicalPlace) {
    let name = topographicalPlace.name.value;

    if (
      topographicalPlace.topographicPlaceType === 'town' &&
      topographicalPlace.parentTopographicPlace
    ) {
      name += `, ${topographicalPlace.parentTopographicPlace.name.value}`;
    }
    return name;
  }

  componentWillUpdate(nextProps) {
    const { dataSource = [], topoiChips, stopTypeFilter } = nextProps;
    const { formatMessage } = nextProps.intl;

    // do not map menuItems if source is the same
    if (
      JSON.stringify(this.props.dataSource) ===
      JSON.stringify(nextProps.dataSource)
    ) {
      return;
    }

    if (dataSource.length) {
      this._menuItems = dataSource.map(element => ({
        element: element,
        text: element.name,
        value: (
          <MenuItem
            style={{ marginTop: 3, paddingRight: 5, width: 'auto' }}
            key={element.id}
            innerDivStyle={{ minWidth: 300, padding: '0px 16px 0px 0px' }}
            primaryText={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9em' }}>{element.name}</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'grey',
                    fontSize: '0.7em',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{ marginBottom: 0 }}
                  >{`${element.topographicPlace}, ${element.parentTopographicPlace}`}</div>
                  <div style={{ marginTop: -30 }}>{element.id}</div>
                </div>
              </div>
            }
            leftIcon={
              <ModalityIcon
                svgStyle={{ marginRight: 10 }}
                style={{ display: 'inline-block', position: 'relative' }}
                type={element.stopPlaceType}
                submode={element.submode}
              />
            }
          />
        ),
      }));
    } else {
      this._menuItems = [
        {
          text: '',
          value: (
            <MenuItem
              style={{ paddingRight: 10, width: 'auto' }}
              primaryText={
                <div style={{ fontWeight: 600, fontSize: '0.8em' }}>
                  {formatMessage({ id: 'no_results_found' })}
                </div>
              }
            />
          ),
        },
      ];
    }

    if (stopTypeFilter.length || topoiChips.length) {

      const filterNotification = {
        text: '',
        value: (
          <MenuItem
            style={{ paddingRight: 10, width: 'auto', paddingTop: 2, paddingBottom: 2}}
            disabled={true}
            primaryText={
              <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000'}}>
                <span style={{ fontSize: '0.8em', color: '#777' }}>
                  { formatMessage({id: 'filters_are_applied'}) }
                </span>
                <span
                  onClick={() => this.removeFiltersAndSearch()}
                  style={{ fontSize: '0.8em', color: enturPrimaryDarker, marginRight: 5, cursor: 'pointer'}}
                >
                  { formatMessage({id: 'remove'})}
                </span>
              </div>
            }
          />
        ),
      };

      if (this._menuItems.length > 6) {
        this._menuItems[6] = filterNotification;
      } else {
        this._menuItems.push(filterNotification);
      }
    }

  }

  render() {
    const {
      chosenResult,
      isCreatingNewStop,
      favorited,
      missingCoordinatesMap,
      intl,
      stopTypeFilter,
      topoiChips,
      topographicalPlaces,
      canEdit,
      isGuest,
      lookupCoordinatesOpen,
    } = this.props;
    const { coordinatesDialogOpen, showMoreFilterOptions } = this.state;
    const { formatMessage, locale } = intl;

    const topographicalPlacesDataSource = topographicalPlaces
      .filter(
        place =>
          place.topographicPlaceType === 'county' ||
          place.topographicPlaceType === 'town',
      )
      .filter(
        place => topoiChips.map(chip => chip.value).indexOf(place.id) == -1,
      )
      .map(place => {
        let name = this.getTopographicalNames(place);
        return {
          text: name,
          id: place.id,
          value: (
            <MenuItem
              primaryText={name}
              secondaryText={formatMessage({ id: place.topographicPlaceType })}
            />
          ),
          type: place.topographicPlaceType,
        };
      });

    const newStopText = {
      headerText: formatMessage({ id: 'making_stop_place_title' }),
      bodyText: formatMessage({ id: 'making_stop_place_hint' }),
    };

    let favoriteText = {
      title: formatMessage({ id: 'favorites_title' }),
      noFavoritesFoundText: formatMessage({ id: 'no_favorites_found' }),
    };

    const text = {
      emptyDescription: formatMessage({ id: 'empty_description' }),
      edit: formatMessage({ id: 'edit' }),
      view: formatMessage({ id: 'view' }),
    };

    const searchBoxWrapperStyle = {
      top: 70,
      background: 'white',
      height: 'auto',
      width: 460,
      margin: 10,
      position: 'absolute',
      zIndex: 999,
      padding: 10,
      border: '1px solid rgb(81, 30, 18)',
    };

    return (
      <div>
        <CoordinatesDialog
          open={lookupCoordinatesOpen}
          handleClose={this.handleCloseLookupCoordinatesDialog.bind(this)}
          handleConfirm={this.handleLookupCoordinates.bind(this)}
          titleId={'lookup_coordinates'}
          intl={intl}
        />
        <CoordinatesDialog
          open={coordinatesDialogOpen}
          handleClose={() => this.setState({ coordinatesDialogOpen: false })}
          handleConfirm={this.handleSubmitCoordinates.bind(this)}
          intl={intl}
        />
        <FavoriteNameDialog />
        <div style={searchBoxWrapperStyle}>
          <div key="search-name-wrapper">
            <FavoritePopover
              caption={formatMessage({ id: 'favorites' })}
              items={[]}
              filter={stopTypeFilter}
              onItemClick={this.handleRetrieveFilter.bind(this)}
              onDismiss={this.handlePopoverDismiss.bind(this)}
              text={favoriteText}
            />
            <div
              style={{
                width: '100%',
                margin: 'auto',
                border: '1px solid hsla(182, 53%, 51%, 0.1)',
              }}
            >
              <ModalityFilter
                locale={locale}
                stopTypeFilter={stopTypeFilter}
                handleApplyFilters={this.handleApplyFilters.bind(this)}
              />
              {showMoreFilterOptions
                ? <div>
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <FlatButton
                        onClick={() => this.handleToggleFilter(false)}
                        style={{ fontSize: 12 }}
                      >
                        {formatMessage({ id: 'filters_less' })}
                      </FlatButton>
                    </div>
                    <AutoComplete
                      floatingLabelText={formatMessage({ id: 'filter_by_topography' })}
                      hintText={formatMessage({ id: 'filter_by_topography' })}
                      dataSource={topographicalPlacesDataSource}
                      onUpdateInput={this.handleTopographicalPlaceInput.bind(
                        this,
                      )}
                      filter={AutoComplete.caseInsensitiveFilter}
                      style={{
                        margin: 'auto',
                        width: '100%',
                        textAlign: 'center',
                        marginTop: -10,
                      }}
                      maxSearchResults={5}
                      fullWidth={true}
                      ref="topoFilter"
                      onNewRequest={this.handleAddChip.bind(this)}
                    />
                    <TopographicalFilter
                      topoiChips={topoiChips}
                      handleDeleteChip={chipId =>
                        this.props.dispatch(UserActions.deleteChip(chipId))}
                    />
                  </div>
                : <div style={{ width: '100%', textAlign: 'center' }}>
                    <FlatButton
                      style={{ fontSize: 12 }}
                      onClick={() => this.handleToggleFilter(true)}
                    >
                      {formatMessage({ id: 'filters_more' })}
                    </FlatButton>
                  </div>}
            </div>
            <SearchIcon
              style={{
                verticalAlign: 'middle',
                marginRight: 5,
                height: 22,
                width: 22,
              }}
            />
            <AutoComplete
              textFieldStyle={{ width: 380 }}
              animated={false}
              openOnFocus
              hintText={formatMessage({ id: 'filter_by_name' })}
              dataSource={this._menuItems || []}
              filter={(searchText, key) => searchText !== ''}
              onUpdateInput={this.handleSearchUpdate.bind(this)}
              maxSearchResults={7}
              searchText={this.props.searchText}
              ref="searchText"
              onNewRequest={this.handleNewRequest.bind(this)}
              listStyle={{ width: 'auto' }}
            />
            <div style={{ float: 'right' }}>
              <IconButton
                style={{ verticalAlign: 'middle' }}
                iconStyle={{ fontSize: 22 }}
                onClick={this.handleClearSearch.bind(this)}
                iconClassName="material-icons"
              >
                clear
              </IconButton>
            </div>
            <Divider />
          </div>
          <div
            style={{ marginBottom: 15, textAlign: 'right', marginRight: 10 }}
          >
            <FlatButton
              style={{ marginLeft: 10, fontSize: 12 }}
              disabled={!!favorited}
              secondary={true}
              onClick={() => {
                this.handleSaveAsFavorite(!!favorited);
              }}
            >
              {formatMessage({ id: 'filter_save_favorite' })}
            </FlatButton>
          </div>
          <div key="searchbox-edit">
            {chosenResult
              ? <SearchBoxDetails
                  handleEdit={this.handleEdit.bind(this)}
                  result={chosenResult}
                  handleChangeCoordinates={this.handleOpenCoordinatesDialog.bind(
                    this,
                  )}
                  userSuppliedCoordinates={
                    missingCoordinatesMap &&
                    missingCoordinatesMap[chosenResult.id]
                  }
                  text={text}
                  canEdit={canEdit}
                  formatMessage={formatMessage}
                />
              : null}
            { !isGuest && <div style={{ marginTop: 30 }}>
              {isCreatingNewStop
                ? <NewStopPlace text={newStopText} />
                : <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <RaisedButton
                    onClick={this.handleOpenLookupCoordinatesDialog.bind(this)}
                    icon={<MdLocationSearching style={{width: 20, height: 20}} />}
                    primary={false}
                    labelStyle={{fontSize: 11}}
                    label={formatMessage({ id: 'lookup_coordinates' })}
                  />
                    <RaisedButton
                      onClick={this.handleNewStop.bind(this)}
                      icon={<ContentAdd style={{width: 20, height: 20}} />}
                      primary={true}
                      labelStyle={{fontSize: 11}}
                      label={formatMessage({ id: 'new_stop' })}
                    />
                </div>

                  }
            </div>}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const favoriteManager = new FavoriteManager();
  const { stopType, topoiChips, text } = state.user.searchFilters;
  const favoriteContent = favoriteManager.createSavableContent(
    '',
    text,
    stopType,
    topoiChips,
  );
  const favorited = favoriteManager.isFavoriteAlreadyStored(favoriteContent);

  return {
    chosenResult: state.stopPlace.activeSearchResult,
    dataSource: state.stopPlace.searchResults,
    isCreatingNewStop: state.user.isCreatingNewStop,
    stopTypeFilter: state.user.searchFilters.stopType,
    topoiChips: state.user.searchFilters.topoiChips,
    favorited: favorited,
    missingCoordinatesMap: state.user.missingCoordsMap,
    searchText: state.user.searchFilters.text,
    topographicalPlaces: state.stopPlace.topographicalPlaces || [],
    canEdit: getIn(state.roles, ['allowanceInfoSearchResult', 'canEdit'], false),
    isGuest: state.roles.isGuest,
    lookupCoordinatesOpen: state.user.lookupCoordinatesOpen
  };
};

export default withApollo(injectIntl(connect(mapStateToProps)(SearchBox)));