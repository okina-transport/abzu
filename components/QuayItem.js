import React, {PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import quayTypes from './quayTypes'
import { MapActions } from '../actions/'
import { connect } from 'react-redux'
import { IconButton, FontIcon, Checkbox } from 'material-ui'
import Divider from 'material-ui/Divider';

class QuayItem extends React.Component {

  constructor(props) {
    super(props)
    this.state = { hidden: !props.quay.new }
  }

  toggleHidden() {
    const { hidden } = this.state
    this.setState({hidden : !hidden})
  }

  handleNameChange = (event) => {
    const {dispatch, index} = this.props
    dispatch(MapActions.changeQuayName(index, event.target.value))
  }

  handleTypeChange = (event, index, value) => {
    const {dispatch} = this.props
    const quayIndex = this.props.index
    dispatch(MapActions.changeQuayType(quayIndex, value))
  }

  handleDescriptionChange = (event) => {
    const {dispatch, index} = this.props
    dispatch(MapActions.changeQuayDescription(index, event.target.value))
  }

  handleWHAChange = (event) => {
    const { dispatch, index } = this.props
    dispatch(MapActions.changeWHA(index, event.target.checked))
  }

  render() {

    const { quay, index } = this.props
    const { hidden } = this.state

    quay.quayType = quay.quayType || 'other'

    const style = {
      color: "#2196F3",
      cursor: "pointer",
      marginTop: "20px"
    }

    const removeStyle = {
      verticalAlign: "middle",
      width: "10px",
      top: "-15px",
      right: "0",
    }

    return (

      <div>
        <div style={style}>
          <div style={{float: "left", width: "85%"}}>
            <span onClick={() => this.toggleHidden()}>{`${index+1} - ${quay.name}`}</span>
            { quay.new ? <span style={{color: 'red', marginLeft: '20px'}}> - unsaved</span> : null}
          </div>
          <IconButton iconClassName="material-icons" onClick={this.props.removeQuay} style={removeStyle}>delete</IconButton>
        </div>
       { hidden ? null
       : <div>
          <TextField
            hintText="Name"
            floatingLabelText="Name"
            value={quay.name}
            style={{width: "95%"}}
            onChange={e => typeof e.target.value === 'string' && this.handleNameChange(e)}
          />
          <TextField
            hintText="Description"
            floatingLabelText="Description"
            value={quay.description || ''}
            style={{width: "95%"}}
            onChange={e => typeof e.target.value === 'string' && this.handleDescriptionChange(e)}
          />
          <SelectField value={quay.quayType}
            autoWidth={true}
            onChange={this.handleTypeChange}
            floatingLabelText="Type"
            floatingLabelFixed={true}
            style={{width: "95%"}}
            >
            { quayTypes.map( (type, index) =>
                <MenuItem
                  key={'quayType' + index}
                  value={type.value}
                  primaryText={type.name}
                  />
            ) }
          </SelectField>
          <Checkbox
            defaultChecked={quay.allAreasWheelchairAccessible}
            label="All areas are wheelchair accessible"
            onCheck={this.handleWHAChange}
            style={{marginBottom: "10px", width: "95%", marginTop: "10px"}}
            />
          <Divider inset={true}/>
        </div>
        }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
  null,
  mapDispatchToProps
)(QuayItem)