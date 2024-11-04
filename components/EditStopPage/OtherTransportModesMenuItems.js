import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import ModalityIconSvg from '../MainPage/ModalityIconSvg';
import { Grid } from '@material-ui/core';
import Menu from 'material-ui/Menu';
import otherTransportModesTypes from '../../models/otherTransportModesTypes';

class OtherTransportModesMenuItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedModes: this.props.otherTransportModesChosen || []  // Initialisation par défaut
    };
  }

  // Utiliser componentDidUpdate pour mettre à jour `selectedModes` lorsque `otherTransportModesChosen` change
  componentDidUpdate(prevProps) {
    if (prevProps.otherTransportModesChosen !== this.props.otherTransportModesChosen) {
      this.setState({ selectedModes: this.props.otherTransportModesChosen || [] });
    }
  }

  handleCheck(transportMode) {
    const { handleOtherTransportModeChange } = this.props;
    const { selectedModes } = this.state;

    // Recherche manuelle du mode pour éviter `includes`
    const modeIndex = selectedModes.findIndex(m => m === transportMode);
    const isChecked = modeIndex !== -1;

    // Nouvelle liste basée sur la présence du mode
    const newSelectedModes = isChecked
      ? [...selectedModes.slice(0, modeIndex), ...selectedModes.slice(modeIndex + 1)] // Retire le mode si déjà coché
      : [...selectedModes, transportMode]; // Ajoute le mode s'il n'est pas coché

    // Met à jour l'état local et appelle la fonction pour notifier le parent
    this.setState({ selectedModes: newSelectedModes }, () => {
      handleOtherTransportModeChange(newSelectedModes); // Passe la liste mise à jour au parent
    });
  }


  isChecked(transportMode) {
    return this.state.selectedModes.includes(transportMode);
  }

  render() {
    const { locale } = this.props;
    return (
      <Menu>
        {otherTransportModesTypes[locale]
          .filter((mode) => mode.transportMode !== undefined || mode.transportMode !== null || mode.transportMode !== '')
          .map((mode, index) => {
            const isChecked = this.isChecked(mode.transportMode);
            return (
              <MenuItem key={'submode-' + index}>
                <Grid container spacing={2}>
                  <Grid item xs={1} style={{ margin: 'auto' }}>
                    <Checkbox
                      checked={isChecked} // Utilise `isChecked` pour l'état de la case
                      onCheck={() => this.handleCheck(mode.transportMode)}
                    />
                  </Grid>
                  <Grid item xs={1} style={{ margin: 'auto' }}>
                    <ModalityIconSvg type={mode.value} submode={mode.value} />
                  </Grid>
                  <Grid item xs={10} style={{ margin: 'auto' }}>
                    <span>{mode.name}</span>
                  </Grid>
                </Grid>
              </MenuItem>
            );
          })}
      </Menu>
    )
  }
}

export default OtherTransportModesMenuItems;
