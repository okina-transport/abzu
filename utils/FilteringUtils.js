



export const getFilteredStops = (stopPlaces, filterbyFullTad, filterByPartialTAD) => {
  let filteredMarkers = stopPlaces;

  if (filterByPartialTAD){
    filteredMarkers = stopPlaces.filter(stop => hasKeyValue(stop,"zonalStopPlace","partial"));
  }else if (filterbyFullTad){
    filteredMarkers = stopPlaces.filter(stop => hasKeyValue(stop,"zonalStopPlace","yes"));
  }
  return filteredMarkers;
}


export const hasKeyValue = (stopPlace, key, value) => {

  if (!Array.isArray(stopPlace.keyValues) || stopPlace.keyValues.length == 0){
    return false;
  }


  for (let i = 0; i < stopPlace.keyValues.length; i++) {
    let keyVal =  stopPlace.keyValues[i];
    if (keyVal.key = key &&  keyVal.values.includes(value)){
      return true;
    }
  }

}