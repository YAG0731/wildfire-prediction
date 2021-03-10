import React from 'react';
import '../css/reactPaginationStyle.css';
import { MDBDataTable } from 'mdbreact';
// import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl, Marker, Popup, GeoJSON, FeatureGroup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Plot from 'react-plotly.js';
import FilterDiv from '../Components/FilterDiv';
import counties from '../counties.json';
import BlueDot from '../images/blueDot.svg';

const devUrl = '';
const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

const myIcon = L.icon({
    iconUrl: BlueDot,
    iconSize: [28,28],
});

class WeatherDataCollection extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'WRCC',
            lat: props.lat,
            lon: props.lon,
            currentCounty: 'Alameda',
            noaaData: null,
            currentView: 'Table View',
            currentMarker: null,
            weatherStationData: null,
            currentWeatherStation: null,
            weatherStationFeatures: ['datacoverage', 'elevation', 'elevationUnit', 'id', 'latitude', 'longitude', 'maxdate', 'mindate', 'name'],
            startDate: null,
            endDate: null,
            day: null,
            month: null,
            year: null,
            wrcc_station: 'cald',
            wrccData: null,

        }

        this.getData = this.getData.bind(this);
        this.getNOAAdata = this.getNOAAdata.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleWeatherStationChange = this.handleWeatherStationChange.bind(this);
        this.onCountyMouseout = this.onCountyMouseout.bind(this);
        this.onCountyMouseover = this.onCountyMouseover.bind(this);
        this.onEachCounty = this.onEachCounty.bind(this);
        this.getNoaaFeatureData = this.getNoaaFeatureData.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.handleWrccStationChange = this.handleWrccStationChange.bind(this);
        this.getWrccData = this.getWrccData.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.prevDay = this.prevDay.bind(this);
        this.getWrccFeatureData = this.getWrccFeatureData.bind(this);
        this.makeWrccStationMarkers = this.makeWrccStationMarkers.bind(this);
    }

    componentDidMount(){
        var today = new Date();
        // console.log(today)
        // console.log(today.getDate())
        // console.log(today.getMonth())
        // console.log(today.getFullYear())

        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();

        var temp_month = month
        temp_month += 1
        if(temp_month < 10){
            temp_month = '0' + temp_month
        }

        this.setState({
            day: day,
            month: temp_month,
            year: (year % 2000)
        })

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

        this.setState({
            startDate: monthAgo,
            endDate: today,
        }, ()=>{this.getData()})

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
        // var startDate = document.getElementById('startDateInput').value;
        // var endDate = document.getElementById('endDateInput').value;
        var startDate = this.state.startDate;
        var endDate = this.state.endDate;

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

        if(this.state.source == 'NOAA'){
            this.getNOAAdata(startDate, endDate);
        }
        else if(this.state.source == 'WRCC'){
            this.getWrccData();
        }
    }

    getWrccData(){
        console.log('getting data from WRCC')
        var wrcc_url = 'https://wrcc.dri.edu/cgi-bin/wea_daysum2.pl?stn='+this.state.wrcc_station+'&day='+this.state.day+'&mon='+this.state.month+'&yea='+this.state.year+'&unit=E'

        // console.log('date: '+this.state.day+'/'+this.state.month+'/'+this.state.year)

        fetch('/api/getWrccData', {
            method: 'POST',
            body: JSON.stringify({
                url: wrcc_url,
            })
        })
        .then(res => res.json())
        .then(response => {
            // console.log(response)
            var rows = response['rows']

            var columnNames = [
                'Hour','Total Solar Rad','Ave. mph', 'Wind V. Dir. Deg','Max mph','Air Temp Mean Deg. F','Fuel Temp Mean Deg. F.','Fuel Moisture Mean Percent','Relative Humidity Mean Percent','Dew Point Deg','Wet Buld F.','Total Percip. inches'
            ]

            var temp = [];
            for(var i = 0; i<rows.length; i++){
                var row = rows[i]
                var newRowEntry = {}
                for(var j = 0; j<columnNames.length; j++){
                    var text = row[j].replace(/(\r\n|\n|\r)/gm, "");
                    if(text == ''){
                        text = ' '
                    }
                    newRowEntry[columnNames[j]] = text
                }
                temp.push(newRowEntry)
            }

            var cols = [];
            for(var i=0; i<columnNames.length; i++){
                var newColEntry = {
                    label: columnNames[i],
                    field: columnNames[i],
                    sort: 'asc',
                    width: 150,
                }
                cols.push(newColEntry);
            }

            var data = {
                columns: cols,
                rows: temp,
            }

            this.setState({
                wrccData: data,
            })

        })
    }

    getNOAAdata(start, end){
        console.log('getting data from NOAA')
        this.setState({
            noaaData: null,
        })

        fetch(prodUrl + '/api/getNOAAdata', {
            method:'POST',
            body: JSON.stringify({
                startDate: start,
                endDate: end,
                county: this.state.currentCounty,
            })
        })
        .then(res => res.json())
        .then(response => {
            var rawData = response['rawData'];
            var weatherStationData = response['weatherStationData']
            weatherStationData = JSON.parse(weatherStationData)
            weatherStationData = weatherStationData['results'];

            this.setState({
                weatherStationData: weatherStationData,
            })

            var parsedData = JSON.parse(rawData);

            var cols = [];
            var rows = [];
        
            for(const key in parsedData){
                var newColEntry = {
                    label: key,
                    field: key,
                    sort: 'asc',
                    width: 150,
                }
                cols.push(newColEntry);
            }

            // console.log(parsedData);
            if(parsedData['DATE'] != null){
                for(var i=0; i<Object.keys(parsedData['DATE']).length; i++){      
                    var newRowEntry = {}
                    for(const key in parsedData){
                        var val = parsedData[key][i];
                        if (val == null){
                            val = ''
                        }
                        newRowEntry[key] = val
                    }
                    rows.push(newRowEntry);
                }
            }

            var data = {
                columns: cols,
                rows: rows,
            }

            this.setState({
                noaaData: data,
            })
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

    handleViewChange(event){
        // console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    handleWeatherStationChange(newWeatherStation){
        this.setState({
            currentWeatherStation: newWeatherStation,
        })
    }

    onCountyMouseover(event){
        event.target.setStyle({
            fillOpacity: 0.9,
        });
    }

    onCountyMouseout(event){
        event.target.setStyle({
            fillOpacity: 0.3,
        });
    }

    onEachCounty(county, layer){
        var countyName = county.properties.name;
        layer.bindPopup(countyName);

        layer.on({
            mouseover: this.onCountyMouseover,
            mouseout: this.onCountyMouseout,
        })
    }

    getNoaaFeatureData(feature){
        var data = [];
        var temp = {};
        for(var row of this.state.noaaData['rows']){
            if(!(row['STATION'] in temp)){
                temp[row['STATION']] = {
                    'x': [],
                    'y': [],
                    type: 'line',
                    name: row['STATION'],
                }
            }
            temp[row['STATION']]['x'].push(row['DATE']);
            temp[row['STATION']]['y'].push(row[feature]);
        }
        for(var station of Object.keys(temp)){
            data.push(temp[station]);
        }
        return data;
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

    handleSourceChange(newSource){
        this.setState({
            source: newSource,
        }, () => {
            this.getData();
        })
    }

    handleWrccStationChange(newStation){
        this.setState({
            wrcc_station: newStation,
        }, ()=>{this.getWrccData()})
    }

    nextDay(){
        var currentDate = '20'+this.state.year + '-' + parseInt(this.state.month) + '-' + parseInt(this.state.day)
        var d = new Date(currentDate)

        d.setDate(d.getDate() + 1);

        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate()

        var temp_month = month
        temp_month += 1
        if(temp_month < 10){
            temp_month = '0' + temp_month
        }

        this.setState({
            day: day,
            month: temp_month,
            year: (year % 2000)
        }, ()=>{this.getWrccData()})

    }

    prevDay(){
        var currentDate = '20'+this.state.year + '-' + parseInt(this.state.month) + '-' + parseInt(this.state.day)
        var d = new Date(currentDate)

        d.setDate(d.getDate() - 1);

        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();

        var temp_month = month
        temp_month += 1
        if(temp_month < 10){
            temp_month = '0' + temp_month
        }

        this.setState({
            day: day,
            month: temp_month,
            year: (year % 2000)
        }, ()=>{this.getWrccData()})
    }

    getWrccFeatureData(feature){
        var data = [{
            'x': [],
            'y': [],
            type: 'line'
        }]
        for(var i=0; i<this.state.wrccData.rows.length; i++){
            data[0]['y'].push(parseFloat(this.state.wrccData.rows[i][feature]))
            data[0]['x'].push(this.state.wrccData.rows[i]['Hour'])
        }
        return data
    }

    makeWrccStationMarkers(){
        var markers = []
        for (const [key, value] of Object.entries(wrcc_station_locations)) {
            var pos = [wrcc_station_locations[key]['lat'], wrcc_station_locations[key]['lon']]

            markers.push(
                <Marker position={pos} key={key} onClick={this.handleWrccStationChange.bind(this, key)} icon={myIcon}>

                </Marker>
            )
        }
        return markers
    }

    render(){

        var countyStyle = {
            color: '#4a83ec',
            weight: 1,
            fillColor: "#AED7FF",
            fillOpacity: 0.3,
        }

        var wrccStationMarkers = this.makeWrccStationMarkers()

        var tavg = null;
        var tmin = null;
        var tmax = null;
        if(this.state.noaaData != null){
            tavg = this.getNoaaFeatureData('TAVG');
            tmin = this.getNoaaFeatureData('TMIN');
            tmax = this.getNoaaFeatureData('TMAX');
        }

        var wrcc_mph = null;
        var wrcc_temp = null;
        var wrcc_precip = null;
        if(this.state.wrccData != null){
            wrcc_mph = this.getWrccFeatureData('Ave. mph');
            wrcc_temp = this.getWrccFeatureData('Air Temp Mean Deg. F')
            wrcc_precip = this.getWrccFeatureData('Total Percip. inches')
        }
        // console.log(wrcc_temp)

        var wrcc_url = 'https://wrcc.dri.edu/cgi-bin/wea_daysum2.pl?stn='+this.state.wrcc_station+'&day='+this.state.day+'&mon='+this.state.month+'&yea='+this.state.year+'&unit=E'

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv 
                    pageType='dataCollection'
                    dataType='weather'
                    getData={this.getData}
                    changeCounty={this.changeCounty}
                    toggleFilterDiv={this.toggleFilterDiv}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    handleStartDateChange={this.handleStartDateChange}
                    handleEndDateChange={this.handleEndDateChange}
                    handleSourceChange = {this.handleSourceChange}
                    handleWrccStationChange = {this.handleWrccStationChange}
                />
                {
                    this.state.source != 'WRCC'?
                    <p>
                        <strong>Data for: </strong>{this.state.currentCounty} County ({this.state.startDate} to {this.state.endDate})
                    </p>
                    :
                    <div></div>
                }
                <div>
                    {/* {
                        this.state.currentView === 'Table View'? */}
                        <div>
                            {
                                this.state.source == 'NOAA'?
                                <div>
                                    {
                                        !this.state.noaaData?
                                        <div>Getting data...</div>
                                        :
                                        <div>
                                            <MDBDataTable responsive
                                            striped
                                            bordered
                                            data={this.state.noaaData}
                                            />
                                            <br/>
                                            <hr/>

                                            <h4>Graphs</h4>
                                            <br/>
                                            <Plot
                                                style = {{height:'400px'}}
                                                data = {tavg}
                                                layout = {{showlegend: true, title:'TAVG over time'}}
                                                config = {{responsive:true }}
                                            />
                                            <br/>
                                            <Plot
                                                style = {{ height:'400px'}}
                                                data = {tmin}
                                                layout = {{showlegend:true, title: 'TMIN over time' }}
                                                config = {{responsive:true }}
                                            />
                                            <br/>
                                            <Plot
                                                style = {{height:'400px'}}
                                                data = {tmax}
                                                layout = {{showlegend:true, title:'TMAX over time' }}
                                                config = {{responsive:true }}
                                            />
                                        </div>
                                    }
                                </div>
                                :
                                this.state.source == 'WRCC'?
                                <div>
                                    {/* <iframe src={wrcc_url} height='500px' width='100%' /> */}
                                    {
                                        !this.state.wrccData?
                                        <div>Getting data...</div>
                                        :
                                        <div>
                                            <h5>{wrccStations[this.state.wrcc_station]} - {this.state.day}/{this.state.month}/{this.state.year} <span style={{color:'grey'}}>(d/m/y)</span></h5>
                                            <br/>

                                            {
                                                this.state.currentView == 'Map View'?
                                                <div>
                                                    <Map style={{height:'300px', width:'calc(100vw - 600px)', border:'1px solid black', float:'left'}} zoom={5} center={[this.state.lat, this.state.lon]}>
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


                                                            <LayersControl.Overlay name="Show Markers" checked>
                                                                <FeatureGroup>
                                                                    {wrccStationMarkers}
                                                                </FeatureGroup>
                                                            </LayersControl.Overlay>

                                                        </LayersControl>

                                                    </Map>
                                                    <div style={{width:'240px', float:'right'}}>
                                                        <h4>Station details</h4>
                                                        Name: {wrcc_station_locations[this.state.wrcc_station]['name']} <br/>
                                                        Lat: {wrcc_station_locations[this.state.wrcc_station]['lat']} <br/>
                                                        Lon: {wrcc_station_locations[this.state.wrcc_station]['lon']} <br/>
                                                        Elevation: {wrcc_station_locations[this.state.wrcc_station]['elevation']} <br/>
                                                    </div>
                                                    <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
                                                    <hr/>
                                                </div>
                                                :
                                                <div></div>
                                            }

                                            <div style={{width:"100%", height:'60px'}}>
                                                <button className='btn btn-light' style={{float:'left', width:'15%'}} onClick={this.prevDay}>Prev day</button>

                                                <button className='btn btn-light' style={{float:'right', width:"15%"}} onClick={this.nextDay}>Next day</button>
                                            </div>
                                            <div style={{width:'100%'}}>
                                                <MDBDataTable 
                                                responsive
                                                paging={false}
                                                searching={false}
                                                striped
                                                bordered
                                                data={this.state.wrccData}
                                                />

                                                <br/>
                                                <hr/>

                                                <h4>Graphs</h4>
                                                <br/>
                                                <Plot
                                                    style = {{height:'400px'}}
                                                    data = {wrcc_mph}
                                                    layout = {{showlegend: true, title:'Ave. mph'}}
                                                    config = {{responsive:true }}
                                                />
                                                <br/>
                                                <Plot
                                                    style = {{ height:'400px'}}
                                                    data = {wrcc_temp}
                                                    layout = {{showlegend:true, title: 'Air Temp Mean Deg. F'}}
                                                    config = {{responsive:true }}
                                                />
                                                <br/>
                                                <Plot
                                                    style = {{height:'400px'}}
                                                    data = {wrcc_precip}
                                                    layout = {{showlegend:true, title:'Total Percip. inches' }}
                                                    config = {{responsive:true }}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                        {/* :
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

                                    <LayersControl.Overlay name="Show Counties" >
                                        <GeoJSON data={counties.features}  style={countyStyle} onEachFeature={this.onEachCounty}/>
                                    </LayersControl.Overlay>

                                </LayersControl>


                                <MarkerClusterGroup>
                                    {
                                        this.state.weatherStationData == null?
                                        <div>Waiting for data to load...</div>
                                        :
                                        this.state.weatherStationData.map(
                                            marker => {
                                                return (
                                                    <Marker position={[marker['latitude'], marker['longitude']]} key={marker['id']} onclick={() => this.handleWeatherStationChange(marker)}>
                                                        <Popup>
                                                            <p>ID: {marker['id']}</p>
                                                            <p>Lat: {marker['latitude']}</p>
                                                            <p>Lon: {marker['longitude']}</p>
                                                        </Popup>
                                                    </Marker>
                                                )
                                            }
                                        )
                                    }
                                </MarkerClusterGroup>
                            </Map>
                            <div style={{float:'right', padding:'6px', width:'230px'}}>
                            {
                                this.state.currentWeatherStation == null?
                                <h3>Select a weather station for more info.</h3>
                                :
                                <div>
                                    <h3>Station info.</h3>
                                    <hr/>
                                    {
                                        this.state.weatherStationFeatures.map(
                                            feature => {
                                                return (
                                                <div key={feature}>
                                                    <strong>{feature}: </strong>{this.state.currentWeatherStation[feature]}
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
                    } */}
                </div>
            </div>
        );
    }
}

export default WeatherDataCollection;

var wrccStations = {
    'cald':'Alder Spring',
    'casc':'Ash Creek',
    'catl':'Atlas Peak',
    'cbac':'Backbone',
    'cbal':'Bald Mtn Loc',
    'cbat':'Batterson',
    'cbbr':'Big Bar',
    'cben':'Benton',
    'cbir':'Big Rock',
    'cbld':'Blue Door',
    'cblm':'Blacks Mountain',
    'cblw':'Blue Ridge (KNF)',
    'cbml':'Blue Mountain Lookout',
    'cbmo':'Blue Mountain',
    'cbmt':'Brush Mountain',
    'cbnr':'Banner Road'
}

var wrcc_station_locations = {
    'cald': {
        'name': 'Alder Springs',
        'lat': 39.651389,
        'lon': -122.723611,
        'elevation': 4300
    },
    'casc': {
        'name': 'Ash Creek',
        'lat': 41.276944,
        'lon': -121.979444,
        'elevation': 3200
    },
    'catl': {
        'name': 'Atlas Peak',
        'lat': 38.474444,
        'lon': -122.264722,
        'elevation': 1934
    },
    'cbac': {
        'name': 'Backbone',
        'lat': 40.889167,
        'lon': -123.142222,
        'elevation': 4700
    },
    'cbal': {
        'name': 'Bald Mtn Loc',
        'lat': 38.905556,
        'lon': -120.697222,
        'elevation': 4680
    },
    'cbat': {
        'name': 'Batterson',
        'lat': 37.231944,
        'lon': -119.508333,
        'elevation': 3160
    },
    'cbbr': {
        'name': 'Big Bar',
        'lat': 40.733333,
        'lon': -123.233333,
        'elevation': 1500
    },
    'cben': {
        'name': 'Benton',
        'lat': 37.843056,
        'lon': -118.477778,
        'elevation': 5450
    },
    'cbir': {
        'name': 'Big Rock',
        'lat': 38.039444,
        'lon': -122.57,
        'elevation': 1500
    },
    'cbld': {
        'name': 'Blue Door',
        'lat': 41.054722,
        'lon': -120.3375,
        'elevation': 5615
    },
    'cblm': {
        'name': 'Blacks Mountain',
        'lat': 40.77,
        'lon': -121.168056,
        'elevation': 7050
    },
    'cbml': {
        'name': 'Blue Mountain Lookout',
        'lat': 41.829722,
        'lon': -120.865833,
        'elevation': 5740
    },
    'cbmt': {
        'name': 'Brush Mountain',
        'lat': 40.915556,
        'lon': -123.668611,
        'elevation': 3988
    },
    'cbnr': {
        'name': 'Atlas Peak',
        'lat': 38.284444,
        'lon': -120.489722,
        'elevation': 2803
    }
}