import React from 'react';
import '../css/reactPaginationStyle.css';
import { MDBDataTable } from 'mdbreact';
// import CountySelector from '../Components/CountySelector';
import {Map, TileLayer, LayersControl, Marker, Popup, GeoJSON} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Plot from 'react-plotly.js';
import FilterDivModEval from '../Components/FilterDivModEval';
import counties from '../counties.json';

// const devUrl = '';
// const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

class FireDetectionModEval extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            source: 'NOAA',
            currentCounty: 'Sonoma',
            lat: props.lat,
            lon: props.lon,
            data: null,
            currentView: 'Statistic View',
            startDate: null,
            endDate: null,
            summaryData: {
                'Satellite Image Source': 'Landsat 8',
                'Tensorflow Model Version': 'YOLO-V5',
                'Fire  Detected': 'YES',
                'Confidence Level': '92%',
            },
        }

        this.formatDate = this.formatDate.bind(this);
        this.getData2 = this.getData2.bind(this);
        this.getNOAAdata = this.getNOAAdata.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.toggleFilterDivModEval = this.toggleFilterDivModEval.bind(this);
        this.changeCounty = this.changeCounty.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);

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

        this.setState({
            startDate: monthAgo,
            endDate: today,
        })

        this.getNOAAdata(monthAgo, today);

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

    getData2(){
        <div style={{width:'100%', height:'50px'}}>
            console.log("getData2")
            <img src={process.env.PUBLIC_URL + 'images/detection_yolo1.png'} alt='fire' width='60%' style={{margin:'20px 0'}}/>
        </div>
    }

    getNOAAdata(start, end){
    }

    handleViewChange(event){
        console.log('changed to: '+event.target.innerHTML);
        this.setState({
            currentView: event.target.innerHTML,
        })
    }

    toggleFilterDivModEval(){
        var filterDivModEval = document.getElementById('filterDivModEval');
        if(filterDivModEval.style.display == ''){
            filterDivModEval.style.display = 'none';
        }
        else{
            filterDivModEval.style.display = '';
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

                <FilterDivModEval 
                    pageType='dataAnalysis'
                    dataType='fireDetection'
                    getData2={this.getData2}
                    changeCounty={this.changeCounty}
                    toggleFilterDivModEval={this.toggleFilterDivModEval}
                    currentView={this.state.currentView}
                    handleViewChange={this.handleViewChange}
                    handleStartDateChange={this.handleStartDateChange}
                    handleEndDateChange={this.handleEndDateChange}
                />

                <p>
                    <strong>Fire Detection for: </strong>{this.state.currentCounty} County   date:  {this.state.endDate}
                </p>
                <hr/>
                <div>
                    {
                        this.state.currentView === 'Statistic View'?
                        <div>
                            <h3>Evaluation Results:</h3>
                            <br/>
                            <div style={{display:'flex', flexWrap:'wrap'}}>
                                {
                                    Object.keys(this.state.summaryData).map(
                                        key => {
                                            return (
                                                <div key={key} style={{margin:'6px 24px 6px 0'}}>
                                                    <strong>{key}: </strong>{this.state.summaryData[key]}
                                                </div>
                                            )
                                        }
                                    )
                                }
                            </div>
                            <hr/>

                            <img src={process.env.PUBLIC_URL + 'images/detection_yolo1.png'} alt='fire' width='45%' style={{margin:'20px 0'}}/>
           
                        </div>
                        :
                        <div>
                            <img src={process.env.PUBLIC_URL + 'images/detMod_1.png'} alt='fire2' width='70%' style={{margin:'20px 0'}} />
                            <img src={process.env.PUBLIC_URL + 'images/detMod_2.png'} alt='fire3' width='70%' style={{margin:'20px 0'}} />

                            <div style={{float:'right', padding:'6px', width:'230px'}}>
                            {
                                this.state.summaryData == null?
                                <p>Important statistics:</p>
                                :
                                <div>
                                    <p>Important statistics:</p>
                                    <hr/>
                                    <div style={{display:'flex', flexWrap:'wrap'}}>
                                        {
                                            Object.keys(this.state.summaryData).map(
                                                key => {
                                                    return (
                                                        <div key={key} style={{margin:'4px 0'}}>
                                                            <strong>{key}: </strong>{this.state.summaryData[key]}
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
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

export default FireDetectionModEval;
