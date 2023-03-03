import React from 'react';
import CountySelector from '../Components/CountySelector';
import { MDBDataTable } from 'mdbreact';
import {Map, TileLayer, LayersControl, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import FilterDiv from '../Components/FilterDiv';

import FireIcon from '../images/realistic_fire.png';

// const devUrl = '';
// const prodUrl = 'https://wildfire-ml-flask.herokuapp.com';

var base_url = '';
if(process.env.REACT_APP_ENVIRONMENT === 'prod'){
    base_url = 'https://wildfire-ml-flask.herokuapp.com'
}

class LightningDataCollection extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            source: 'GOES',
            lat: props.lat,
            lon: props.lon,

            gotGoesImage: false,
            goesResult: 'failure',
            goesUrlRand: null,
            goesYear: '2021',
            goesMonth: '04',
            goesDay: '16',
            goesHour: '16',
            goesMinute: '00'

        }

        this.toggleFilterDiv = this.toggleFilterDiv.bind(this);
        this.getGoesData = this.getGoesData.bind(this);
        this.handleGoesDateChange = this.handleGoesDateChange.bind(this);
        this.handleGoesTimeChange = this.handleGoesTimeChange.bind(this);
    
    }

    componentDidMount(){
        this.getGoesData()
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

    getGoesData(){
        this.setState({
            gotGoesImage: false,
        })

        fetch(base_url + '/api/get_goes_16_lightning_data', {
            method: 'POST',
            body: JSON.stringify({
                year: this.state.goesYear,
                month: this.state.goesMonth,
                day: this.state.goesDay,
                hour: this.state.goesHour,
                minute: this.state.goesMinute
            })
        })
        .then(res => res.json())
        .then(response => {
            if(response['result'] == 'failure'){
                this.setState({
                    gotGoesImage: true,
                    goesResult: 'failure'
                })
            }
            else{
                this.setState({
                    gotGoesImage: true,
                    goesResult: 'success',
                    goesUrlRand: Math.floor(Math.random() * 1000000)
                })
            }
        })
    }

    handleGoesDateChange(newDate){
        var dateComponents = newDate.split('-')
        this.setState({
            goesYear: dateComponents[0],
            goesMonth: dateComponents[1],
            goesDay: dateComponents[2]
        })
    }

    handleGoesTimeChange(newTime){
        var timeComponents = newTime.split(':')
        this.setState({
            goesHour: timeComponents[0],
            goesMinute: timeComponents[1]
        })
    }

    render(){

        return(
            <div className="jumbotron" style={{margin:'10px 0 50px 0', paddingTop:'20px', overflow:'auto'}}>
                <FilterDiv
                    pageType='dataCollection' 
                    dataType='elevation'
                    toggleFilterDiv={this.toggleFilterDiv}
                    dataSource={this.state.source}
                    handleGoesDateChange={this.handleGoesDateChange}
                    handleGoesTimeChange={this.handleGoesTimeChange}
                    getGoesLightningData={this.getGoesData}
                />
                <div>
                    {
                        this.state.source == 'GOES'?
                        <div>
                            GOES-16 image for: {this.state.goesDay}/{this.state.goesMonth}/{this.state.goesYear}, {this.state.goesHour}:{this.state.goesMinute}
                            <br/>
                            <br/>

                            {
                                this.state.gotGoesImage == false?
                                <p>Loading...</p>
                                :
                                this.state.goesResult == 'failure'?
                                <p style={{color:'red'}}>No image.</p>
                                :
                                <div>
                                    <img src={'/api/'+this.state.goesUrlRand+'/goes_16_lightning.png'}width='600px' style={{border:'1px solid black'}} />
                                </div>
                            }

                        </div>
                        :
                        <div>
                        </div>
                    }
                    
                </div>
            </div>

        );
    }
}

export default LightningDataCollection;