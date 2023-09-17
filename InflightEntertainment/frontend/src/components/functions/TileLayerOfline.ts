import Leaflet from 'leaflet'
import {TileLayerOfflineProps} from "./index.types";


export default function MakeTileLayerOffline({map,leaflet,}: TileLayerOfflineProps): Leaflet.tileLayerOffline | undefined {
  if (!leaflet.tileLayer?.offline) return undefined

  const tileLayerOffline = leaflet.tileLayer.offline('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 13,
    maxZoom: 19,
    crossOrigin: true
  })

  tileLayerOffline.addTo(map) //add the offline layer

  // const controlSaveTiles = leaflet.control.savetiles(tileLayerOffline, {
  //   zoomlevels: [13, 14, 15, 16],
  //   confirm(layer, succescallback) {
  //     // disable line for no alert
  //     if (window.confirm(`Save ${layer._tilesforSave.length} map blocks`)) succescallback(); 
  //   },
  //   confirmRemoval(_, successCallback) {
  //     // disable line for no alert
  //     if (window.confirm('Do you want to remove the memory map from your device?')) successCallback();
  //   },
  //   saveText: 'Save',
  //   rmText: 'Exclude',
  // })

  // controlSaveTiles.addTo(map!)

  return tileLayerOffline
}