import React from 'react';
import FilterDiv from '../Components/FilterDiv';
import {Map, TileLayer, LayersControl, GeoJSON, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// import powerlines from '../California_Electric_Transmission_Lines.json';
import counties from '../counties.json';
import powerlines_by_county from '../powerlines_by_county.json'

// import powerlines from '../San_Diego.json'


class PowerlinesDataCollection extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            lat: props.lat,
            lon: props.lon,
            source:'HIFLD',
            // kV_0_100: [],
            // kV_101_250: [],
            // kV_251_500: [],
            current_powerline: null,
            current_county: 'Alameda',
            geojson_key_1: 1,
            geojson_key_2: 2,
            geojson_key_3: 3,
            show_v_0_100: true,
            show_v_101_250: true,
            show_v_251_500: true,
        }

        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.separatePowerlinesByVoltages = this.separatePowerlinesByVoltages.bind(this);
        this.onEachPowerline = this.onEachPowerline.bind(this);
        this.onPowerlineClick = this.onPowerlineClick.bind(this);
        this.handleCountyChange = this.handleCountyChange.bind(this);
    }

    componentDidMount(){
        // this.separatePowerlinesByVoltages();
    }

    separatePowerlinesByVoltages(powerlines){
        var all_powerlines = powerlines.features;
        var v_0_100 = []
        var v_101_250 = []
        var v_251_500 = []
        for(var i = 0; i < all_powerlines.length; i++){
            var line = all_powerlines[i];
            var voltage = line['properties']['VOLTAGE']
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
        // this.setState({
        //     kV_0_100: v_0_100,
        //     kV_101_250: v_101_250,
        //     kV_251_500: v_251_500
        // })
        return [v_0_100, v_101_250, v_251_500]
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

    handleCountyChange(newCounty){
        this.setState({
            current_county: newCounty,
            geojson_key_1: Math.floor(Math.random() * 1000000),
            geojson_key_2: Math.floor(Math.random() * 1000000),
            geojson_key_3: Math.floor(Math.random() * 1000000)
        })
    }

    render(){
        // var cec_powerlines_webpage = 'https://cecgis-caenergy.opendata.arcgis.com/apps/CAEnergy::california-electric-infrastructure-app/explore'

        // var hifld_powerlines_webpage = 'https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::electric-power-transmission-lines/explore?location=38.090095%2C-120.553450%2C7.54'

        var styles = {
            powerline: {
                color: '#000000',
                weight: 2,
            },
            v_0_100: {
                color: '#00e038',
                weight: 2,
            },
            v_101_250: {
                color: '#e07b00',
                weight: 2.5,
            },
            v_251_500: {
                color: '#db0d5c',
                weight: 3,
            },
            countyStyle: {
                color: '#4a83ec',
                weight: 1,
                fillOpacity: 0,
            }
        }

        var powerlines = powerlines_by_county[this.state.current_county]
        var v_0_100 = null;
        var v_101_250 = null;
        var v_251_500 = null;
        if(powerlines == null){
            console.log(this.state.current_county)
            powerlines = {}
            powerlines['features'] = []
        }
        else{
            var separated_powerlines = this.separatePowerlinesByVoltages(powerlines);
            v_0_100 = separated_powerlines[0]
            v_101_250 = separated_powerlines[1]
            v_251_500 = separated_powerlines[2]
        }
        // console.log(v_0_100.length)

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv 
                    pageType='dataCollection'
                    dataType='powerlines'
                    handleSourceChange={this.handleSourceChange}
                    toggleFilterDiv={this.toggleFilterDiv}
                    changeCounty={this.handleCountyChange}
                />

                <div>
                    {
                        this.state.source === 'HIFLD'?
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

                                    <LayersControl.Overlay name='Counties' checked>
                                        <GeoJSON data={counties.features} style={styles.countyStyle} />
                                    </LayersControl.Overlay>

                                    {/* <LayersControl.Overlay name="Voltage: 0-100" checked>
                                        <GeoJSON data={v_0_100}  style={styles.v_0_100} onEachFeature={this.onEachPowerline} key={this.state.geojson_key} />
                                    </LayersControl.Overlay>

                                    <LayersControl.Overlay name="Voltage: 101-250" >
                                        <GeoJSON data={v_101_250}  style={styles.v_101_250} onEachFeature={this.onEachPowerline} key={this.state.geojson_key} />
                                    </LayersControl.Overlay>

                                    <LayersControl.Overlay name="Voltage: 251-500" >
                                        <GeoJSON data={v_251_500}  style={styles.v_251_500} onEachFeature={this.onEachPowerline} key={this.state.geojson_key} />
                                    </LayersControl.Overlay>  */}

                                    {
                                        this.state.show_v_0_100?
                                        <GeoJSON data={v_0_100} style={styles.v_0_100} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_1} />
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_v_101_250?
                                        <GeoJSON data={v_101_250} style={styles.v_101_250} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_2} />
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_v_251_500?
                                        <GeoJSON data={v_251_500} style={styles.v_251_500} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_3} />
                                        :
                                        <div></div>
                                    }

                                    {/* <GeoJSON data={v_0_100} style={styles.v_0_100} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_1} /> */}
                                    {/* <GeoJSON data={v_101_250} style={styles.v_101_250} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_2} />
                                    <GeoJSON data={v_251_500} style={styles.v_251_500} onEachFeature={this.onEachPowerline} key={this.state.geojson_key_3} /> */}

                                    {/* <GeoJSON data={powerlines.features} style={styles.powerline} onEachFeature={this.onEachPowerline} key={this.state.geojson_key} /> */}

                                </LayersControl>

                            </Map>
                            <div style={{width:'230px', float:'right', position:'relative'}}>
                                <div style={{border:'1px solid grey', padding:'10px'}}>
                                    Legend
                                    <hr />
                                    <div style={{background:'#00e038', borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>
                                    &nbsp;: 0-100 Volts &nbsp;
                                    <input type='checkbox' checked={this.state.show_v_0_100} onChange={(e) => {this.setState({show_v_0_100: !this.state.show_v_0_100})}}/>
                                    <br/>

                                    <div style={{background:'#e07b00', borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>
                                    &nbsp;: 101-250 Volts &nbsp;
                                    <input type='checkbox' checked={this.state.show_v_101_250} onChange={(e) => {this.setState({show_v_101_250: !this.state.show_v_101_250})}}/>
                                    <br/>

                                    <div style={{background:'#db0d5c', borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>
                                    &nbsp;: 251-500 Volts &nbsp;
                                    <input type='checkbox' checked={this.state.show_v_251_500} onChange={(e) => {this.setState({show_v_251_500: !this.state.show_v_251_500})}}/>
                                </div>
                                <br/>
                                <br/>
                                <div>
                                    <h4>{this.state.current_county} County</h4>
                                    Powerline Info.
                                    <hr/>
                                    {
                                        this.state.current_powerline == null?
                                        <div>Select a powerline for more info.</div>
                                        :
                                        <div>
                                            <strong>ID: </strong>{this.state.current_powerline['ID']}
                                            <br/>
                                            <strong>Owner: </strong>{this.state.current_powerline['OWNER']}
                                            <br/>
                                            <strong>Voltage: </strong>{this.state.current_powerline['VOLTAGE']}
                                            <br/>
                                            <strong>Status: </strong>{this.state.current_powerline['STATUS']}
                                            <br/>
                                        </div>
                                    } 
                                </div>
                            </div>
                        </div>
                        :
                        <div></div>
                    }
                    
                </div>
            </div>
        )
    }
}


export default PowerlinesDataCollection;