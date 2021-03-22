import React from 'react';
import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import FilterDiv from '../Components/FilterDiv'

// import usgs images
import usgs_img1 from './USGS_NDVI_images/2021-03-02 to 2021-03-08.jpg';
import usgs_img2 from './USGS_NDVI_images/2021-02-23 to 2021-03-01.jpg';
import usgs_img3 from './USGS_NDVI_images/2021-02-16 to 2021-02-22.jpg';
import usgs_img4 from './USGS_NDVI_images/2021-02-09 to 2021-02-15.jpg';
import usgs_img5 from './USGS_NDVI_images/2021-02-02 to 2021-02-08.jpg';
import usgs_img6 from './USGS_NDVI_images/2021-01-26 to 2021-02-01.jpg';

// import ncei images
import ncei_img1 from './NCEI_NDVI_images/2021-01-01.png'
import ncei_img2 from './NCEI_NDVI_images/2020-12-31.png'
import ncei_img3 from './NCEI_NDVI_images/2020-12-30.png'
import ncei_img4 from './NCEI_NDVI_images/2020-12-26.png'
import ncei_img5 from './NCEI_NDVI_images/2020-12-25.png'
import ncei_img6 from './NCEI_NDVI_images/2020-12-23.png'

const usgs_ndvi_images = {
    '2021-03-02 to 2021-03-08': usgs_img1,
    '2021-02-23 to 2021-03-01': usgs_img2,
    '2021-02-16 to 2021-02-22': usgs_img3,
    '2021-02-09 to 2021-02-15': usgs_img4,
    '2021-02-02 to 2021-02-08': usgs_img5,
    '2021-01-26 to 2021-02-01': usgs_img6
}

const ncei_ndvi_images = {
    '2021-01-01': ncei_img1,
    '2020-12-31': ncei_img2,
    '2020-12-30': ncei_img3,
    '2020-12-26': ncei_img4,
    '2020-12-25': ncei_img5,
    '2020-12-23': ncei_img6
}

class VegetationDataCollection extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'NCEI',
            lat: props.lat,
            lon: props.lon,
            currentCounty: 'Alameda',
            // data: null,
            currentView: 'Table View',
            currentMarker: null,
            nceiDate: '2021-01-01',
            usgsDateRange: '2021-03-02 to 2021-03-08',
        }

        this.formatDate = this.formatDate.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.handleNceiDateChange = this.handleNceiDateChange.bind(this);
        this.handleUsgsDateChange = this.handleUsgsDateChange.bind(this);
    }

    componentDidMount(){
        var today = new Date();

        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();

        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if(month < 10){
            month = "0" + month;
        }
        if(day < 10){
            day = "0" + day;
        }

        var monthAgo = year+'-'+month+'-'+day;

    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }


    getData(){
        var startDate = document.getElementById('startDateInput').value;
        var endDate = document.getElementById('endDateInput').value;

        var today = new Date();
        today = this.formatDate(today);

        if(startDate > today || startDate > today || endDate > today || endDate > today){
            alert("Can't pick future dates.");
            return;
        }

        if(startDate > endDate){
            alert('Start date must be before end date.');
            return;
        }

        if(startDate === '' || endDate === ''){
            alert('Please select a start and end date');
            return;
        }

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

    changeCounty(childData){
        this.setState({
            currentCounty: childData,
        })
    }

    handleViewChange(event){
        console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    handleSourceChange(newSource){
        this.setState({
            source: newSource
        })
    }

    handleNceiDateChange(newDate){
        this.setState({
            nceiDate: newDate
        })
    }

    handleUsgsDateChange(newDate){
        this.setState({
            usgsDateRange: newDate
        })
    }

    render(){

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        });

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv
                    pageType='dataCollection' 
                    dataType='vegetation'
                    changeCounty={this.changeCounty}
                    toggleFilterDiv={this.toggleFilterDiv}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    dataSource = {this.state.source}
                    handleSourceChange = {this.handleSourceChange}
                    handleNceiDateChange = {this.handleNceiDateChange}
                    handleUsgsDateChange = {this.handleUsgsDateChange}
                />
                <div>
                    {
                        this.state.currentView === 'Table View'?
                        <div>
                            {
                                this.state.source == 'NCEI'?
                                <div>
                                    NDVI:
                                    <br/>
                                    <br/>
                                    <img src={ncei_ndvi_images[this.state.nceiDate]} width='75%' style={{border:'1px solid black'}} />
                                </div>
                                :
                                this.state.source == 'USGS'?
                                <div>
                                    NDVI: 
                                    <br/>
                                    <br/>
                                    <img src={usgs_ndvi_images[this.state.usgsDateRange]} width='75%' style={{border:'1px solid black'}}/>
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                        :
                        <div>
                            <Map style={{height:'calc(100vh - 200px)', width:'calc(100vw - 600px)', border:'1px solid black', float:'left'}} zoom={6} center={[this.state.lat, this.state.lon]}>
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

                                </LayersControl>

                                <MarkerClusterGroup>
                                    {
                                        this.state.data == null?
                                        <div>Waiting for data to load...</div>
                                        :
                                        <div></div>
                                    }
                                </MarkerClusterGroup>
                            </Map>
                            <div style={{float:'right', padding:'6px', width:'230px'}}>
                            {
                                this.state.currentMarker == null?
                                <h3>Select a marker for more info.</h3>
                                :
                                <div>
                                    <h3>Marker Information</h3>
                                    <hr/>
                                    {
                                        this.state.features.map(
                                            feature => {
                                                return (
                                                <div>
                                                    <strong>{feature}: </strong>{this.state.currentMarker[feature]}
                                                    <br/>
                                                    </div>
                                                )
                                            }
                                        )
                                    }
                                </div>
                            }
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default VegetationDataCollection;