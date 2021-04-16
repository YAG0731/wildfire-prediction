import React from 'react';
import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import FilterDiv from '../Components/FilterDiv';
// import { SketchPicker } from 'react-color';
import ColorPicker from '../Components/ColorPicker';


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
            source: 'Landsat',
            lat: props.lat,
            lon: props.lon,
            currentCounty: 'Alameda',
            // data: null,
            currentView: 'Table View',
            currentMarker: null,
            nceiDate: '2021-01-01',
            usgsDateRange: '2021-03-02 to 2021-03-08',
            landsatDate: '20210221_20210221',
            gotLandsatNdviImage: false,
            // color1: ['4','60','48'],
            // color2: ['116', '67', '17'],
            landsatImageColors: [
                ['4','60','48'],
                ['29', '121', '113'],
                ['29', '121', '113'],
                ['108', '188', '177'],
                ['200', '234', '229'],
                ['200', '234', '229'],
                ['245', '240', '226'],
                ['231', '206', '154'],
                ['231', '206', '154'],
                ['188', '127', '56'],
                ['116', '67', '17'],
            ],

            // landsat_1: ['4','60','48'],
            // landsat_0_8: ['29', '121', '113'],
            // landsat_0_6: ['108', '188', '177'],
            // landsat_0_4: ['200', '234', '229'],
            // landsat_0_2: ['245', '240', '226'],
            // landsat_0: ['231', '206', '154'],
            // landsat_negative_0_2: ['188', '127', '56'],
            // landsat_negative_0_4: ['116', '67', '17'],
            landsatPath: '40',
            landsatRow: '37',
            landsatResult: 'success',
            landsatImageUrlRand: null,

        }

        this.formatDate = this.formatDate.bind(this);
        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleSourceChange = this.handleSourceChange.bind(this);
        this.handleNceiDateChange = this.handleNceiDateChange.bind(this);
        this.handleUsgsDateChange = this.handleUsgsDateChange.bind(this);
        this.handleLandsatDateChange = this.handleLandsatDateChange.bind(this);
        // this.handleLandsatIncrementColorChange = this.handleLandsatIncrementColorChange.bind(this);
        // this.colorToHex = this.colorToHex.bind(this);
        this.rgbToHex = this.rgbToHex.bind(this);
        this.getLandsatData = this.getLandsatData.bind(this);
        this.handleLandsatPathChange = this.handleLandsatPathChange.bind(this);
        this.handleLandsatRowChange = this.handleLandsatRowChange.bind(this);
        this.decimalToHex = this.decimalToHex.bind(this);
        this.handleLandsatImageColorChange = this.handleLandsatImageColorChange.bind(this);
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

        this.getLandsatData()

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

    handleLandsatDateChange(newDate){
        // var date = newDate.getFullYear() + '' + newDate.getMonth() + '' + newDate.getDate();
        var date = newDate.split('-');
        date = date[0] + date[1] + date[2];
        date += '_' + date
        console.log(date)
        this.setState({
            landsatDate: date
        }, ()=>{this.getLandsatData()} )
    }

    getLandsatData(){
        this.setState({
            gotLandsatNdviImage: false,
            landsatResult: 'success',
            landsatImageUrl: null,
        })

        var path = this.state.landsatPath
        if(path.length == 1){
            path = '00' + path
        }
        else{
            path = '0' + path
        }

        var row = this.state.landsatRow
        if(row.length == 1){
            row = '00' + row
        }
        else{
            row = '0' + row
        }

        var colors = []
        for(var i=0; i<this.state.landsatImageColors.length; i++){
            var color = this.state.landsatImageColors[i]
            colors.push(this.rgbToHex(color))
        }
        

        fetch('/api/get_aws_ndvi_image',{
            method: 'POST',
            body: JSON.stringify({
                date: this.state.landsatDate,
                colors: colors,
                path: path,
                row: row
            })
        })
        .then(res => res.json())
        .then(response => {
            if(response['result'] == 'failure'){
                this.setState({
                    landsatResult: 'failure'
                })
            }
            else{
                this.setState({
                    gotLandsatNdviImage: true,
                    landsatImageUrlRand: response['rand']
                })
            }
        })
    }

    handleLandsatImageColorChange(colorNumber, newColor){
        console.log('changing color: '+newColor)
        var colors = this.state.landsatImageColors
        colors[colorNumber] = [newColor.r, newColor.g, newColor.b]

        this.setState({
            landsatImageColors: colors
        })

        console.log('done')
    }

    decimalToHex(decimal){
        var hex = Number(decimal).toString(16);
        if (hex.length < 2) {
                hex = "0" + hex;
        }
        return hex;
    }

    rgbToHex(rgb) {
        return '#' + this.decimalToHex(rgb[0]) + this.decimalToHex(rgb[1]) + this.decimalToHex(rgb[2]);
      }

    handleLandsatPathChange(newPath){
        if(newPath < 8){
            newPath = 8
        }
        else if(newPath > 55){
            newPath = 55
        }
        this.setState({
            landsatPath: newPath
        })
    }

    handleLandsatRowChange(newRow){
        if(newRow < 20){
            newRow = 20
        }
        else if(newRow > 45){
            newRow = 45
        }
        this.setState({
            landsatRow: newRow
        })
    }

    render(){

        var ndvi_indices = ['-1', '-0.5', '-0.2', '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1']

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        });

        console.log(this.state.landsatImageColors)

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
                    handleLandsatDateChange = {this.handleLandsatDateChange}
                    landsatPath = {this.state.landsatPath}
                    landsatRow = {this.state.landsatRow}
                    handleLandsatPathChange = {this.handleLandsatPathChange}
                    handleLandsatRowChange = {this.handleLandsatRowChange}
                    getLandsatData = {this.getLandsatData}
                />
                <div>
                    {
                        this.state.currentView === 'Table View'?
                        <div>
                            {
                                this.state.source == 'Landsat'?
                                <div>
                                    Image for: {this.state.landsatDate.substring(0, 4)}-{this.state.landsatDate.substring(4,6)}-{this.state.landsatDate.substring(6, 8)}, Path = {this.state.landsatPath}, Row = {this.state.landsatRow}
                                    <br/>
                                    <br/>

                                    {
                                        this.state.landsatResult == 'failure'?
                                        <div>
                                            <p style={{color:'red'}}>
                                                There is no data for this date, path, and row combination.
                                            </p>
                                        </div>
                                        :
                                        this.state.gotLandsatNdviImage == false?
                                        <div>
                                            Loading...
                                        </div>
                                        :
                                        <div style={{width:'50%', float:'left'}}>
                                            <img src={'/api/'+this.state.landsatImageUrlRand+'/aws_ndvi_image.png'} alt='ndvi_image' width='100%' style={{border:'1px solid black'}}/>
                                        </div>

                                    }

                                    <div style={{border:'1px solid grey', borderRadius:'5px', float:'right', width:'300px', padding:'16px'}}>
                                        <h4>Customize NDVI colors</h4>
                                        <hr/>

                                        {
                                            this.state.landsatImageColors.map((color, index) => {
                                                return(
                                                    <div style={{width:'125px', height:'36px'}} key={index}>
                                                        <div style={{float:'left'}}>{ndvi_indices[index]}:</div>
                                                        <div style={{float:'right'}}>
                                                            <ColorPicker 
                                                                r={color[0]} 
                                                                g={color[1]} 
                                                                b={color[2]} 
                                                                colorNumber={index}
                                                                handleLandsatImageColorChange = {this.handleLandsatImageColorChange}/>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }

                                        <button className='btn btn-primary' style={{float:'right'}} onClick={this.getLandsatData}>Update</button>
                                    </div>
                                </div>
                                :
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