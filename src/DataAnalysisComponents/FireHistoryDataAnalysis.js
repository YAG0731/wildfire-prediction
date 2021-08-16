import React from 'react';
import '../css/reactPaginationStyle.css';
import { MDBDataTable } from 'mdbreact';
// import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl, Marker, GeoJSON, Circle} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Plot from 'react-plotly.js';
import FilterDiv from '../Components/FilterDiv';
import counties from '../counties.json';
import RealisticFireIcon from '../images/realistic_fire.png'

const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

// var myIcon = L.icon({
//     iconUrl: RealisticFireIcon,
//     iconSize: [30,40],
// });

var markerColors = {
    '2013': '#5e5758',
    '2014': '#db8851',
    '2015': '#c2af04',
    '2016': '#68a331',
    '2017': '#2f6e9e',
    '2018': '#3142a3',
    '2019': '#682eb0',
    '2020': '#ad2da3',
    '2021': '#eb4d60'
}

class FireHistoryDataAnalysis extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'USDA',
            currentCounty: 'Alameda',
            lat: props.lat,
            lon: props.lon,
            data: null,
            currentView: 'Statistic View',
            startDate: null,
            endDate: null,
            features: ['OBJECTID', 'FIRE_NAME', 'STATE_NAME', 'COUNTY_NAME', 'DISCOVER_YEAR', 'POO_LATITUDE', 'POO_LONGITUDE', 'FIRE_SIZE_CLASS', 'TOTAL_ACRES_BURNED', 'STATION_NAME' ],
            summaryData: {
                'Avg fires per year': '8',
                'Biggest fire': '2,600 acres',
                'Smallest fire': '20 acres',
                
            },
            gotBurnAreaVsYearPlot: false,
            errorGettingBurnAreaVsYearPlot: false,
            firesByYear: null,
            fireYearToggles: {},
            show_2013_fires: false,
            show_2014_fires: false,
            show_2015_fires: false,
            show_2016_fires: false,
            show_2017_fires: false,
            show_2018_fires: false,
            show_2019_fires: false,
            show_2020_fires: false,
            show_2021_fires: true,
            selectedFire: null,
        }

        this.formatDate = this.formatDate.bind(this);
        this.getData = this.getData.bind(this);
        this.getUSDAFireData = this.getUSDAFireData.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.getBurnAreaVsYearPlot = this.getBurnAreaVsYearPlot.bind(this);
        this.getFireIncidentByYear = this.getFireIncidentByYear.bind(this);
        this.fireYearToggles = this.fireYearToggles.bind(this);
        this.setCurrentFire = this.setCurrentFire.bind(this);
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

        year = parseInt(year)-1;

        var yearAgo = year+'-'+month+'-'+day;

        this.setState({
            startDate: yearAgo,
            endDate: today,
        })

        // this.getUSDAFireData(yearAgo, today);
        this.getBurnAreaVsYearPlot();
        this.getFireIncidentByYear();
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

        if(this.state.source === 'USDA'){
            this.getUSDAFireData(startDate, endDate);
        }

    }

    getBurnAreaVsYearPlot(){
        fetch('/api/get_burn_area_vs_year_plot', {
            method: 'POST',
            body: JSON.stringify({
                test: 'test',
            })
        })
        .then(res => res.json())
        .then(response => {
            if(response['result'] == 'success'){
                this.setState({
                    gotBurnAreaVsYearPlot: true,
                    errorGettingBurnAreaVsYearPlot: false,
                })
            }
            else{
                this.setState({
                    gotBurnAreaVsYearPlot: true,
                    errorGettingBurnAreaVsYearPlot: true,
                })
            }
        })
    }

    getFireIncidentByYear(){
        fetch('/api/get_fire_incident_by_year')
        .then(res => res.json())
        .then(response => {
            this.setState({
                firesByYear: response['result']
            })
        })
    }


    getUSDAFireData(start, end){
        var lat = this.state.lat;
        var lon = this.state.lon;

        // var startYear = start.slice(0, 4);
        // var endYear = end.slice(0, 4);

        // var features = ['OBJECTID', 'FIRE_NAME', 'STATE_NAME', 'COUNTY_NAME', 'DISCOVER_YEAR', 'POO_LATITUDE', 'POO_LONGITUDE', 'FIRE_SIZE_CLASS', 'TOTAL_ACRES_BURNED', 'STATION_NAME' ]

        fetch(prodUrl + '/api/getUSDAFireData', {
            method: "POST",
            body: JSON.stringify({
                startDate: start,
                endDate: end,
                county: this.state.currentCounty,
            })
        })
        .then(res => res.json())
        .then(resData => {
            var rawData = resData['data'];

            var cols = [];
            var rows = [];
    
            for(const feature of this.state.features){
                var newColEntry = {
                    label: feature,
                    field: feature,
                    sort: 'asc',
                    width: 150,
                }
                cols.push(newColEntry);
            }

            if(rawData['features'] != null){
                var i = 0;
                for(i=0; i < rawData['features'].length; i++){
                    var newRowEntry = {}
                    for(var feature of this.state.features){
                        var val = rawData['features'][i]['attributes'][feature];
                        if(val == null){
                            val = ''
                        }
                        newRowEntry[feature] = val;
                    }
                    rows.push(newRowEntry);
                }
            }

            var data = {
                columns: cols,
                rows: rows,
            }

            this.setState({
                data: data,
            })

        })
    }

    handleViewChange(event){
        console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
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

    changeCounty(childData){
        this.setState({
            currentCounty: childData,
        })
    }

    handleStartDateChange(newStartDate){
        this.setState({
            startDate: newStartDate,
        })
    }

    handleEndDateChange(newEndDate){
        this.setState({
            endDate: newEndDate,
        })
    }

    fireYearToggles(){
        return(
            <div style={{border:'1px solid grey', padding:'10px'}}>
                <div style={{background: markerColors['2013'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2013 &nbsp;
                <input type='checkbox' checked={this.state.show_2013_fires} onChange={(e) => {this.setState({show_2013_fires: !this.state.show_2013_fires})}}/>
                <br/>

                <div style={{background: markerColors['2014'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2014 &nbsp;
                <input type='checkbox' checked={this.state.show_2014_fires} onChange={(e) => {this.setState({show_2014_fires: !this.state.show_2014_fires})}}/>
                <br/>

                <div style={{background: markerColors['2015'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2015 &nbsp;
                <input type='checkbox' checked={this.state.show_2015_fires} onChange={(e) => {this.setState({show_2015_fires: !this.state.show_2015_fires})}}/>
                <br/>

                <div style={{background: markerColors['2016'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2016 &nbsp;
                <input type='checkbox' checked={this.state.show_2016_fires} onChange={(e) => {this.setState({show_2016_fires: !this.state.show_2016_fires})}}/>
                <br/>

                <div style={{background: markerColors['2017'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2017 &nbsp;
                <input type='checkbox' checked={this.state.show_2017_fires} onChange={(e) => {this.setState({show_2017_fires: !this.state.show_2017_fires})}}/>
                <br/>

                <div style={{background: markerColors['2018'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2018 &nbsp;
                <input type='checkbox' checked={this.state.show_2018_fires} onChange={(e) => {this.setState({show_2018_fires: !this.state.show_2018_fires})}}/>
                <br/>

                <div style={{background: markerColors['2019'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2019 &nbsp;
                <input type='checkbox' checked={this.state.show_2019_fires} onChange={(e) => {this.setState({show_2019_fires: !this.state.show_2019_fires})}}/>
                <br/>

                <div style={{background: markerColors['2020'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2020 &nbsp;
                <input type='checkbox' checked={this.state.show_2020_fires} onChange={(e) => {this.setState({show_2020_fires: !this.state.show_2020_fires})}}/>
                <br/>

                <div style={{background: markerColors['2021'], borderRadius:'50%', width:'12px', height:'12px', display:'inline-block'}}></div>&nbsp;
                2021 &nbsp;
                <input type='checkbox' checked={this.state.show_2021_fires} onChange={(e) => {this.setState({show_2021_fires: !this.state.show_2021_fires})}}/>
                <br/>

            </div>
        )
    }

    makeMarkers(year, color){
        var markers = []
        var data = this.state.firesByYear[year]

        var radius_scaling = 50;
        for(var i=0; i<data.length; i++){
            var fire = data[i]
            markers.push(
                // <Marker position={[fire['incident_latitude'], fire['incident_longitude']]} key={i} onClick={this.setCurrentFire.bind(this, fire)} icon={myIcon} />
                <Circle center={[fire['incident_latitude'], fire['incident_longitude']]} color={color} fillColor={color} radius={Math.sqrt(fire['incident_acres_burned']) * radius_scaling} key={i} onClick={this.setCurrentFire.bind(this, fire)} />
            )
        }
        return markers
    }

    setCurrentFire(fire){
        this.setState({
            selectedFire: fire
        })
    }


    render(){
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        });

        var countyStyle = {
            color: '#4a83ec',
            weight: 1,
            fillColor: "#AED7FF",
            fillOpacity: 0.3,
        }

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>

                <FilterDiv 
                    pageType='dataAnalysis'
                    dataType='fireHistory'
                    getData={this.getData}
                    changeCounty={this.changeCounty}
                    toggleFilterDiv={this.toggleFilterDiv}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    handleStartDateChange={this.handleStartDateChange}
                    handleEndDateChange={this.handleEndDateChange}
                />

                {/* <p>
                    <strong>Data for: </strong>{this.state.currentCounty} County ({this.state.startDate} to {this.state.endDate})
                </p>
                <hr/> */}
                <div>
                    {
                        this.state.currentView === 'Statistic View'?
                        <div>
                            <h4>Incident Burn Area vs Year</h4>
                            {
                                this.state.gotBurnAreaVsYearPlot?
                                this.state.errorGettingBurnAreaVsYearPlot?
                                <p style={{color:'red'}}>Something went wrong.</p>
                                :
                                <img src={'/api/'+(Math.floor(Math.random()*1000000))+'/burn_area_vs_year_plot.png'} width='60%' />
                                :
                                <div>Loading...</div>
                            }
                        </div>
                        :
                        <div>
                            <Map style={{height:'calc(100vh - 200px)', width:'calc(100vw - 600px)', border:'1px solid black', float:'left'}} zoom={8} center={[this.state.lat, this.state.lon]}>
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

                                    <LayersControl.Overlay name="Show Counties" >
                                        <GeoJSON data={counties.features}  style={countyStyle} onEachFeature={this.onEachCounty}/>
                                    </LayersControl.Overlay>

                                    {
                                        this.state.show_2013_fires?
                                        this.makeMarkers('2013', markerColors['2013'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2014_fires?
                                        this.makeMarkers('2014', markerColors['2014'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2015_fires?
                                        this.makeMarkers('2015', markerColors['2015'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2016_fires?
                                        this.makeMarkers('2016', markerColors['2016'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2017_fires?
                                        this.makeMarkers('2017', markerColors['2017'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2018_fires?
                                        this.makeMarkers('2018', markerColors['2018'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2019_fires?
                                        this.makeMarkers('2019', markerColors['2019'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2020_fires?
                                        this.makeMarkers('2020', markerColors['2020'])
                                        :
                                        <div></div>
                                    }
                                    {
                                        this.state.show_2021_fires?
                                        this.makeMarkers('2021', markerColors['2021'])
                                        :
                                        <div></div>
                                    }

                                </LayersControl>
                            </Map>

                            <div style={{float:'right', padding:'6px', width:'230px'}}>
                            {
                                this.state.firesByYear == null?
                                <div>Loading...</div>
                                :
                                <div>
                                    {this.fireYearToggles()}
                                    <hr/>
                                    {
                                        this.state.selectedFire == null?
                                        <div></div>
                                        :
                                        <div>
                                            <strong>Name: </strong>{this.state.selectedFire['incident_name']}
                                            <br/>
                                            <strong>County: </strong>{this.state.selectedFire['incident_county']}
                                            <br/>
                                            <strong>Date: </strong>{this.state.selectedFire['incident_date_created']}
                                            <br/>
                                            <strong>Lat: </strong>{this.state.selectedFire['incident_latitude']}
                                            <br/>
                                            <strong>Lon: </strong>{this.state.selectedFire['incident_longitude']}
                                            <br/>
                                            <strong>Acres burned: </strong>{this.state.selectedFire['incident_acres_burned']}
                                            <br/>
                                        </div>
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

export default FireHistoryDataAnalysis;