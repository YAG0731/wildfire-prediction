import React from 'react';
import MyNavbar from './Components/MyNavbar';

import WeatherDataCollection from './DataCollectionComponents/WeatherDataCollection';
import SatelliteDataCollection from './DataCollectionComponents/SatelliteDataCollection';
import FireHistoryDataCollection from './DataCollectionComponents/FireHistoryDataCollection';
import VegetationDataCollection from './DataCollectionComponents/VegetationDataCollection';
import LightningDataCollection from './DataCollectionComponents/LightningDataCollection';
import PowerlinesDataCollection from './DataCollectionComponents/PowerlinesDataCollection';

class DataCollection extends React.Component{

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
            lightningComponent: null,
            powerlinesComponent: null,
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
            weatherComponent: <WeatherDataCollection lat={this.state.lat} lon={this.state.lon} />,
            satelliteComponent: <SatelliteDataCollection lat={this.state.lat} lon={this.state.lon} />,
            fireHistoryComponent: <FireHistoryDataCollection lat={this.state.lat} lon={this.state.lon} />,
            vegetationComponent: <VegetationDataCollection lat={this.state.lat} lon={this.state.lon} />,
            lightningComponent: <LightningDataCollection lat={this.state.lat} lon={this.state.lon} />,
            powerlinesComponent: <PowerlinesDataCollection lat={this.state.lat} lon={this.state.lon} />
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
        var styles = {
            buttonGroupButton: {
                width: '12%',
                backgroundColor: '#f0f0f0', 
                border: '1px solid grey',
                padding: '6px 10px', 
                float: 'left',
                margin:'0 10px 0 0',
                borderRadius: '20px',
                color:'black',
                outline:'none'
            },
            buttonGroupButtonActive: {
                width: '12%',
                backgroundColor: '#1580fb', 
                border: '1px solid #1580fb',
                color: 'white', 
                padding: '6px 10px', 
                float: 'left',
                margin:'0 10px 0 0',
                borderRadius:'20px',
                outline:'none'
            }
        }

        return(
            <div>
                <MyNavbar/>

                <div style={{marginLeft:'15rem'}}>

                    <div style={{position:'fixed', backgroundColor:'#f8f9fa', height:"72px", width:"100%",  borderLeft:'1px solid #d9dadb', borderBottom:"1px solid #d9dadb", paddingLeft:"20px"}}>
                        <h1 className='mt-2'>Data Collection</h1>
                    </div>

                    <div style={{wdith:'60vw', position:'absolute', marginTop:'72px', zIndex:'-100'}}>
                        
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
                                    this.state.currentMode === 'Lightning'?
                                    <button style={styles.buttonGroupButtonActive}>Lightning</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Lightning</button>
                                }
                                {
                                    this.state.currentMode === 'Powerlines'?
                                    <button style={styles.buttonGroupButtonActive}>Powerlines</button>
                                    :
                                    <button style={styles.buttonGroupButton} onClick={this.handleModeChange}>Powerlines</button>
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
                                this.state.currentMode === 'Lightning'?
                                this.state.lightningComponent
                                :
                                <div></div>
                            }
                            {
                                this.state.currentMode === 'Powerlines'?
                                this.state.powerlinesComponent
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

export default DataCollection;