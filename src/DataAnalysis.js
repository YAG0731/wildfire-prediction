import React from 'react';
import MyNavbar from './Components/MyNavbar';

import WeatherDataAnalysis from './DataAnalysisComponents/WeatherDataAnalysis';
import FireHistoryDataAnalysis from './DataAnalysisComponents/FireHistoryDataAnalysis';
import VegetationDataAnalysis from './DataAnalysisComponents/VegetationDataAnalysis';
import SatelliteDataAnalysis from './DataAnalysisComponents/SatelliteDataAnalysis';
import ElevationDataCollection from './DataCollectionComponents/ElevationDataCollection';

class DataAnalysis extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            lat: 37.334665328,
            lon: -121.875329832,
            currentMode: 'Weather',
            weatherComponent: null,
            satelliteComponent: null,
            fireHistoryComponent: null,
            vegetationComponent: null,
            elevationComponent: null,
        }

        this.getCoordinates = this.getCoordinates.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
    }

    componentDidMount(){
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.getCoordinates);
        }
        else{
            alert("Geolocation is not supported by this browser.");
        }
        this.setState({
            weatherComponent: <WeatherDataAnalysis lat={this.state.lat} lon={this.state.lon} />,
            fireHistoryComponent: <FireHistoryDataAnalysis lat={this.state.lat} lon={this.state.lon} />,
            vegetationComponent: <VegetationDataAnalysis lat={this.state.lat} lon={this.state.lon} />,
            satelliteComponent: <SatelliteDataAnalysis lat={this.state.lat} lon={this.state.lon} />,
            elevationComponent: <ElevationDataCollection lat={this.state.lat} lon={this.state.lon} />
        })
    }

    getCoordinates(position){
        this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }

    handleModeChange(event){
        this.setState({
            currentMode: event.target.innerHTML
        });
    }

    render(){
        var position = [37.334665328, -121.875329832];

        var styles = {
            buttonGroupButton: {
                width: '15%',
                backgroundColor: '#f0f0f0', 
                border: '1px solid grey',
                padding: '10px 24px', 
                float: 'left',
                margin:'0 20px 0 0',
                borderRadius: '20px',
                color:'black',
                outline:'none',
                height:'46px'
            },
            buttonGroupButtonActive: {
                width: '15%',
                backgroundColor: '#1580fb', 
                border: '1px solid #1580fb',
                color: 'white', 
                padding: '10px 24px', 
                float: 'left',
                margin:'0 20px 0 0',
                borderRadius:'20px',
                outline:'none',
                height:'46px'
            }
        }

        return(
            <div>
                <MyNavbar/>

                <div style={{marginLeft:'15rem'}}>

                    <div style={{position:'fixed', backgroundColor:'#f8f9fa', height:"72px", width:"100%",  borderLeft:'1px solid #d9dadb', borderBottom:"1px solid #d9dadb", paddingLeft:"20px"}}>
                        <h1 className='mt-2'>Data Analysis</h1>
                    </div>

                    <div style={{width:'60vw', position:'absolute', marginTop:'72px', zIndex:'-100'}}>

                        <div style={{margin:'20px 0 0 20px', width:'calc(100vw - 280px)'}}>
                            <div className="btn-group" style={{width:"100%", display:'flex', justifyContent:'center', flexWrap:'wrap'}}>
                                {
                                    this.state.currentMode === 'Weather'?
                                    <button style={styles.buttonGroupButtonActive}>Weather</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Weather</button>
                                }
                                {
                                    this.state.currentMode === 'Fire History'?
                                    <button style={styles.buttonGroupButtonActive}>Fire History</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Fire History</button>
                                }
                                {
                                    this.state.currentMode === 'Vegetation'?
                                    <button style={styles.buttonGroupButtonActive}>Vegetation</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Vegetation</button>
                                }
                                {
                                    this.state.currentMode === 'Satellite'?
                                    <button style={styles.buttonGroupButtonActive}>Satellite</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Satellite</button>
                                }
                                {
                                    this.state.currentMode === 'Elevation'?
                                    <button style={styles.buttonGroupButtonActive}>elevation</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Elevation</button>
                                }
                            </div>

                            {
                                this.state.currentMode === 'Weather'?
                                this.state.weatherComponent
                                :
                                <div></div>
                            }
                            {
                                this.state.currentMode === 'Satellite'?
                                this.state.satelliteComponent
                                :
                                <div></div>
                            }
                            {
                                this.state.currentMode === 'Fire History'?
                                this.state.fireHistoryComponent
                                :
                                <div></div>
                            }
                            {
                                this.state.currentMode === 'Vegetation'?
                                this.state.vegetationComponent
                                :
                                <div></div>
                            }
                            {
                                this.state.currentMode === 'Elevation'?
                                this.state.elevationComponent
                                :
                                <div></div>
                            }

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DataAnalysis;