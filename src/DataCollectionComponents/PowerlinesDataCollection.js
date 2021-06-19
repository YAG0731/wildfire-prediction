import React from 'react';
import FilterDiv from '../Components/FilterDiv';
import {Map, TileLayer, LayersControl, GeoJSON, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import powerlines from '../California_Electric_Transmission_Lines.json';


class PowerlinesDataCollection extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            lat: props.lat,
            lon: props.lon,
            source:'CEC',
            kV_0_100: [],
            kV_101_250: [],
            kV_251_500: [],
            current_powerline: null,
        }

        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.separatePowerlinesByVoltages = this.separatePowerlinesByVoltages.bind(this);
        this.onEachPowerline = this.onEachPowerline.bind(this);
        this.onPowerlineClick = this.onPowerlineClick.bind(this);
    }

    componentDidMount(){
        this.separatePowerlinesByVoltages();
    }

    separatePowerlinesByVoltages(){
        var all_powerlines = powerlines.features;
        var v_0_100 = []
        var v_101_250 = []
        var v_251_500 = []
        for(var i = 0; i < all_powerlines.length; i++){
            var line = all_powerlines[i];
            var voltage = parseInt(line['properties']['kV'])
            if(voltage <= 100){
                v_0_100.push(line)
            }
            else if(voltage <= 250){
                v_101_250.push(line)
            }
            else{
                v_251_500.push(line)
            }
        }
        this.setState({
            kV_0_100: v_0_100,
            kV_101_250: v_101_250,
            kV_251_500: v_251_500
        })
    }

    handleSourceChange(newSource){
        this.setState({
            source: newSource
        })
    }

    toggleFilterDiv(){
        var filterDiv = document.getElementById('filterDiv');
        if(filterDiv.style.display == ''){
            filterDiv.style.display = 'none';
        }
        else{
            filterDiv.style.display = '';
        }
    }

    onPowerlineClick(event){
        // console.log(event.target.feature.properties)
        this.setState({
            current_powerline: event.target.feature.properties,
        })
    }

    onEachPowerline(line, layer){
        layer.on({
            click: this.onPowerlineClick,
        })
    }

    render(){
        var cec_powerlines_webpage = 'https://cecgis-caenergy.opendata.arcgis.com/apps/CAEnergy::california-electric-infrastructure-app/explore'

        var hifld_powerlines_webpage = 'https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::electric-power-transmission-lines/explore?location=38.090095%2C-120.553450%2C7.54'

        var styles = {
            kV_0_100: {
                color: '#4a83ec',
                weight: 1,
            },
            kV_101_250: {
                color: '#18a841',
                weight: 1.5,
            },
            kV_251_500: {
                color: '#c93c26',
                weight: 2,
            }
        }

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv 
                    pageType='dataCollection'
                    dataType='powerlines'
                    handleSourceChange={this.handleSourceChange}
                    toggleFilterDiv={this.toggleFilterDiv}
                />

                <div>
                    {
                        this.state.source === 'CEC'?
                        // <iframe src={cec_powerlines_webpage} title='California Electric Infrastructure App' width='100%' height='600px'/>
                        <div>
                            <Map style={{height:'calc(100vh - 240px)', width:'calc(100vw - 600px)', border:'1px solid black', float:'left'}} zoom={6} center={[this.state.lat, this.state.lon]}>

                                <LayersControl position="topright">

                                    <LayersControl.BaseLayer name="Topology" checked>
                                        <TileLayer
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="Street">
                                        <TileLayer
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="Satellite">
                                        <TileLayer
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="Terrain">
                                        <TileLayer
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.BaseLayer name="Dark">
                                        <TileLayer
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                        />
                                    </LayersControl.BaseLayer>

                                    <LayersControl.Overlay name="kV 0-100" checked>
                                        <GeoJSON data={this.state.kV_0_100}  style={styles.kV_0_100} onEachFeature={this.onEachPowerline} />
                                    </LayersControl.Overlay>

                                    <LayersControl.Overlay name="kV 101-250" >
                                        <GeoJSON data={this.state.kV_101_250}  style={styles.kV_101_250} onEachFeature={this.onEachPowerline} />
                                    </LayersControl.Overlay>

                                    <LayersControl.Overlay name="kV 251-500" >
                                        <GeoJSON data={this.state.kV_251_500}  style={styles.kV_251_500} onEachFeature={this.onEachPowerline} />
                                    </LayersControl.Overlay>

                                </LayersControl>

                            </Map>
                            <div style={{width:'230px', float:'right'}}>
                                <h4>Powerline info.</h4>
                                <hr/>
                                {
                                    this.state.current_powerline == null?
                                    <div>Select a powerline for more info.</div>
                                    :
                                    <div>
                                        <strong>Name: </strong>{this.state.current_powerline['Name']}
                                        <br/>
                                        <strong>Owner: </strong>{this.state.current_powerline['Owner']}
                                        <br/>
                                        <strong>ID: </strong>{this.state.current_powerline['OBJECTID']}
                                        <br/>
                                        <strong>kV: </strong>{this.state.current_powerline['kV']}
                                        <br/>
                                        <strong>Length (miles): </strong>{this.state.current_powerline['Length_Mile']}
                                        <br/>
                                    </div>
                                } 
                            </div>
                        </div>
                        :
                        this.state.source === 'HIFLD'?
                        <iframe src={hifld_powerlines_webpage} title='California Electric Infrastructure App' width='100%' height='600px'/>
                        :
                        <div></div>
                    }
                    
                </div>
            </div>
        )
    }
}


export default PowerlinesDataCollection;