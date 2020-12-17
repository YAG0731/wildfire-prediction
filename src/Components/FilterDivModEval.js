import React from 'react';
import CountySelector from './CountySelector';

class FilterDivModEval extends React.Component{

    constructor(props){
        super(props);

        this.changeStartDate = this.changeStartDate.bind(this);
        this.changeEndDate = this.changeEndDate.bind(this);
    }

    changeStartDate(event){
        this.props.handleStartDateChange(event.target.value);
    }

    changeEndDate(event){
        this.props.handleEndDateChange(event.target.value);
    }
    
    render(){
        return(
            <div>
                <div style={{width:'100%', height:'50px'}}>
                    <h4 style={{padding:'0 10px 0 0', float:'left', padding:'12px 0 0 0'}}>
                        {
                            this.props.dataType === 'fireDetection'?
                            'Fire Detection'
                            :
                            this.props.dataType === 'fireRiskPrediction'?
                            'Fire Risk Prediction'
                            :
                            this.props.dataType === 'fireProgression'?
                            'Fire Progression'
                            :
                            <div></div>
                        }
                    </h4>

                    {
                        this.props.pageType === 'dataCollection'?
                            this.props.currentView === 'Table View'?
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Map View</button>
                            :
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Table View</button>
                        :
                        this.props.pageType === 'dataAnalysis'?
                            this.props.currentView === 'Statistic View'?
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Graph View</button>
                            :
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Statistic View</button>
                        :
                        this.props.pageType === 'actualPrediction'?
                            this.props.currentView === 'Actual'?
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Prediction</button>
                            :
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Actual</button>
                        :
                        <div></div>
                    }

                    <button className='btn btn-dark' style={{float:'right'}} onClick={this.props.toggleFilterDivModEval}>
                        Select 
                        &nbsp;
                        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-filter" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                </div>
                <hr/>

                <div style={{display:'none', height:'auto'}} id='filterDivModEval'>
                    <div style={{width:'100%'}}>
                        <div style={{float:'left'}}>
                            Source: &nbsp;&nbsp;
                            {
                                this.props.dataType === 'fireDetection'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='Landsat 8'>Landsat 8</option>
                                    <option value='GOES 16/17'>GOES 16/17</option>
                                    <option value='MODIS/TERRA'>MODIS/TERRA</option>
                                </select>
                                :
                                this.props.dataType === 'fireRiskPrediction'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='Weather Fire-History'>Weather Fire-History</option>
                                    <option value='Remote-Sensing Fire-History'>Remote-Sensing Fire-History</option>
                                </select>
                                :
                                this.props.dataType === 'fireProgression'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='Fire History'>Fire History</option>
                                    <option value='Remote Sensing'>Remote Sensing</option>
                                    <option value='Land Cover'>Land Cover</option>
                                    <option value='Waeather'>Weather</option>
                                </select>
                                :
                                <div></div>
                            }
                        </div>
                        <div style={{float:'right'}}>
                            Location:&nbsp;
                            {
                                this.props.dataType === 'fireDetection'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='San Diego 8/8/2018'>San Diego 8/8/2018</option>
                                    <option value='Sonoma 2017'>Sonoma 2017</option>
                                    <option value='SCU Lightning 2020'>SCU Lightning 2020</option>
                                    <option value='August Complex 2020'>August Complex 2020</option>
                                </select>
                                :
                                this.props.dataType === 'fireRiskPrediction'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='San Diego 8/8/2018'>San Diego 8/8/2018</option>
                                    <option value='Sonoma 2017'>Sonoma 2017</option>
                                    <option value='SCU Lightning 2020'>SCU Lightning 2020</option>
                                    <option value='August Complex 2020'>August Complex 2020</option>
                                </select>
                                :
                                this.props.dataType === 'fireProgression'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='San Diego 8/8/2018'>San Diego 8/8/2018</option>
                                    <option value='Sonoma 2017'>Sonoma 2017</option>
                                    <option value='SCU Lightning 2020'>SCU Lightning 2020</option>
                                    <option value='August Complex 2020'>August Complex 2020</option>
                                </select>
                                :
                                <div></div>
                            }
                            &nbsp;&nbsp;&nbsp;&nbsp;
                        </div>
                        <br/>
                        <br/>
                        <br/>
                    </div>
                    <div style={{width:'100%'}}>
                        <div style={{float:'left'}}>
                            Model: &nbsp;&nbsp;&nbsp;&nbsp;
                            {
                                this.props.dataType === 'fireDetection'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='Faster RCNN'>Faster RCNN</option>
                                    <option value='Efficient Net'>Efficient Net</option>
                                    <option value='Retina Net'>Retina Net</option>
                                </select>
                                :
                                this.props.dataType === 'fireRiskPrediction'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='SVM'>SVM</option>
                                    <option value='XGBoost'>XGBoost</option>
                                    <option value='Random Forest'>Random Forest</option>
                                    <option value='Multi Layer Perceptron'>Multi Layer Perceptron</option>
                                    <option value='CNN'>CNN</option>
                                </select>
                                :
                                this.props.dataType === 'fireProgression'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='Value Iteration'>Value Iteration</option>
                                    <option value='DQN'>DQN</option>
                                    <option value='Policy Gradient'>Policy Gradient</option>
                                </select>
                                :
                                <div></div>
                            }
                        </div>
                        <button className='btn btn-primary' onClick={this.props.getData2} style={{float:'right', marginRight:'16px'}}>Evaluate Model</button>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <hr/>
                </div>
            </div>
        )
    }
}

export default FilterDivModEval;
