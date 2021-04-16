import React from 'react';
import CountySelector from './CountySelector';
import WrccStationSelector from './WrccStationSelector';

class FilterDiv extends React.Component{

    constructor(props){
        super(props);

        this.changeStartDate = this.changeStartDate.bind(this);
        this.changeEndDate = this.changeEndDate.bind(this);
        this.changeSource = this.changeSource.bind(this);
        this.changeWrccStation = this.changeWrccStation.bind(this);
        this.changeNasaDate = this.changeNasaDate.bind(this);
        this.changeNasaArea = this.changeNasaArea.bind(this);
        this.changeNasaColor = this.changeNasaColor.bind(this);
        this.changeNceiDate = this.changeNceiDate.bind(this);
        this.changeUsgsDate = this.changeUsgsDate.bind(this);
        this.changeLandsatDate = this.changeLandsatDate.bind(this);
        this.changeLandsatPath = this.changeLandsatPath.bind(this);
        this.changeLandsatRow = this.changeLandsatRow.bind(this);
    }

    changeStartDate(event){
        this.props.handleStartDateChange(event.target.value);
    }

    changeEndDate(event){
        this.props.handleEndDateChange(event.target.value);
    }

    changeSource(event){
        this.props.handleSourceChange(event.target.value);
    }

    changeWrccStation(station){
        this.props.handleWrccStationChange(station);
    }

    changeNasaArea(event){
        this.props.handleNasaAreaChange(event.target.value)
    }

    changeNasaColor(event){
        this.props.handleNasaColorChange(event.target.value)
    }

    changeNasaDate(event){
        this.props.handleNasaDateChange(event.target.value)
    }

    changeNceiDate(event){
        this.props.handleNceiDateChange(event.target.value)
    }

    changeUsgsDate(event){
        this.props.handleUsgsDateChange(event.target.value)
    }

    changeLandsatDate(event){
        this.props.handleLandsatDateChange(event.target.value)
    }

    changeLandsatPath(event){
        this.props.handleLandsatPathChange(event.target.value)
    }

    changeLandsatRow(event){
        this.props.handleLandsatRowChange(event.target.value)
    }
    
    render(){
        return(
            <div>
                <div style={{width:'100%', height:'50px'}}>
                    <h4 style={{padding:'0 10px 0 0', float:'left', padding:'12px 0 0 0'}}>
                        {
                            this.props.dataType === 'weather'?
                            'Weather'
                            :
                            this.props.dataType === 'fireHistory'?
                            'Fire History'
                            :
                            this.props.dataType === 'vegetation'?
                            'Vegetation'
                            :
                            this.props.dataType === 'satellite'?
                            'Satellite'
                            :
                            <div></div>
                        }
                    </h4>

                    {
                        this.props.pageType === 'dataCollection' && this.props.dataType != 'vegetation'?
                            this.props.currentView === 'Table View'?
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Map View</button>
                            :
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Table View</button>
                        :
                        this.props.pageType === 'dataAnalysis'?
                            this.props.currentView === 'Statistic View'?
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Map View</button>
                            :
                            <button className='btn btn-success' onClick={this.props.handleViewChange} style={{float:'right', margin:'0 0 0 10px'}} >Statistic View</button>
                        :
                        <div></div>
                    }

                    <button className='btn btn-dark' style={{float:'right'}} onClick={this.props.toggleFilterDiv}>
                        Filter 
                        &nbsp;
                        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-filter" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                </div>
                <hr/>

                <div style={{display:'none', height:'auto'}} id='filterDiv'>
                    <div style={{width:'100%'}}>
                        <div style={{float:'left'}}>
                            Source: &nbsp;&nbsp;
                            {
                                this.props.dataType === 'weather'?
                                <select id="dataSourceInput" style={{padding:'14px'}} onChange={this.changeSource}>
                                    <option value='WRCC'>WRCC</option>
                                    <option value='NOAA'>NOAA</option>
                                </select>
                                :
                                this.props.dataType === 'fireHistory'?
                                <select id="dataSourceInput" style={{padding:'14px'}}>
                                    <option value='USDA'>USDA</option>
                                </select>
                                :
                                this.props.dataType === 'vegetation'?
                                <select id="dataSourceInput" style={{padding:'14px'}} onChange={this.changeSource}>
                                    <option value='Landsat'>Landsat</option>
                                    <option value='NCEI'>NCEI</option>
                                    <option value='USGS'>USGS</option>
                                </select>
                                :
                                this.props.dataType === 'satellite'?
                                <select id="dataSourceInput" style={{padding:'14px'}} onChange={this.changeSource}>
                                    <option value='NASA'>NASA</option>
                                    <option value='USGS'>USGS</option>
                                </select>
                                :
                                <div></div>
                            }
                        </div>
                        {
                            this.props.dataType == 'vegetation' && this.props.dataSource == 'NCEI'?
                            <div>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                Date:
                                &nbsp;&nbsp;
                                <select style={{padding:'14px'}} onChange={this.changeNceiDate}>
                                    <option value='2021-01-01'>2021-01-01</option>
                                    <option value='2020-12-31'>2020-12-31</option>
                                    <option value='2020-12-30'>2020-12-30</option>
                                    <option value='2020-12-26'>2020-12-26</option>
                                    <option value='2020-12-25'>2020-12-25</option>
                                    <option value='2020-12-23'>2020-12-23</option>
                                </select>
                            </div>
                            :
                            this.props.dataSource == 'USGS' && this.props.dataType == 'vegetation'?
                            <div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                Date Range: &nbsp;&nbsp;
                                {/* <input type='week' style={{padding:'10px'}} min='2021-W01' max='2021-W10'/> */}
                                <select style={{padding:'14px'}} onChange={this.changeUsgsDate}>
                                    <option value='2021-03-02 to 2021-03-08'>2021-03-02 to 2021-03-08</option>
                                    <option value='2021-02-23 to 2021-03-01'>2021-02-23 to 2021-03-01</option>
                                    <option value='2021-02-16 to 2021-02-22'>2021-02-16 to 2021-02-22</option>
                                    <option value='2021-02-09 to 2021-02-15'>2021-02-09 to 2021-02-15</option>
                                    <option value='2021-02-02 to 2021-02-08'>2021-02-02 to 2021-02-08</option>
                                    <option value='2021-01-26 to 2021-02-01'>2021-01-26 to 2021-02-01</option>
                                </select>
                            </div>
                            :
                            this.props.dataSource == 'WRCC'?
                            <div>
                                <WrccStationSelector handleChange={this.changeWrccStation}/>
                            </div>
                            :
                            this.props.dataSource == 'NASA'?
                            <div>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <select style={{padding:'14px'}} onChange={this.changeNasaArea}>
                                    <option value='North California'>North California</option>
                                    <option value='South California'>South California</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                <select style={{padding:'14px'}} onChange={this.changeNasaColor}>
                                    <option value='True Color Composite'>True Color Composite</option>
                                    <option value='False Color Composite'>False Color Composite</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                <input type='date' style={{padding:'10px'}} onChange={this.changeNasaDate}/>
                                <br/>
                            </div>
                            :
                            this.props.dataType == 'vegetation' && this.props.dataSource == 'Landsat'?
                            <div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {/* Date: &nbsp;&nbsp;
                                <select onChange={this.changeLandsatDate} style={{padding:'14px'}}>
                                    <option value='20210309_20210317'>2021-03-09</option>
                                    <option value='20210221_20210304'>2021-02-21</option>
                                    <option value='20210205_20210304'>2021-02-05</option>
                                    <option value='20201203_20201218'>2020-12-03</option>
                                    <option value='20201117_20201210'>2020-11-17</option>
                                    <option value='20201016_20201104'>2020-10-16</option>
                                    <option value='20200914_20200920'>2020-09-14</option>
                                    <option value='20200829_20200905'>2020-08-29</option>
                                    <option value='20200813_20200822'>2020-08-13</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp; */}

                                Date: &nbsp;&nbsp;
                                <input type='date' defaultValue='2021-02-21' style={{padding:'10px'}} onChange={this.changeLandsatDate}/>
                                &nbsp;&nbsp;&nbsp;&nbsp;

                                Path: &nbsp;&nbsp;
                                <input type='number' min='8' max='55' value={this.props.landsatPath} style={{padding:'14px'}} onChange={this.changeLandsatPath} />
                                &nbsp;&nbsp;&nbsp;&nbsp;

                                Row: &nbsp;&nbsp;
                                <input type='number' min='20' max='45' value={this.props.landsatRow} style={{padding:'14px'}} onChange={this.changeLandsatRow} />

                                <button className='btn btn-primary' style={{float:'right'}} onClick={this.props.getLandsatData}>Get Data</button>

                            </div>
                            :
                            <div>
                                <div style={{float:'right'}}>
                                    From:&nbsp;
                                    <input type='date' style={{padding:'10px'}} id="startDateInput" onChange={this.changeStartDate}/>
                                    &nbsp; - &nbsp;
                                    <input type='date' style={{padding:'10px'}} id='endDateInput' onChange={this.changeEndDate}/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                </div>
                                <br/>
                                <br/>
                                <br/>
                            </div>

                        }
                        {/* <div style={{float:'right'}}>
                            From:&nbsp;
                            <input type='date' style={{padding:'10px'}} id="startDateInput" onChange={this.changeStartDate}/>
                            &nbsp; - &nbsp;
                            <input type='date' style={{padding:'10px'}} id='endDateInput' onChange={this.changeEndDate}/>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                        </div>
                        <br/>
                        <br/>
                        <br/> */}
                    </div>
                    {
                        this.props.dataSource == 'WRCC' || this.props.dataSource == 'NASA' || this.props.dataSource == 'NCEI'?
                        <div></div>
                        :
                        this.props.dataSource == 'USGS' && this.props.dataType == 'vegetation'?
                        <div></div>
                        :
                        this.props.dataSource == 'Landsat' && this.props.dataType == 'vegetation'?
                        <div></div>
                        :
                        <div>
                            <div style={{width:'100%'}}>
                                <div style={{float:'left'}}>
                                    County: &nbsp;&nbsp;
                                    <CountySelector parentCallback={this.props.changeCounty}/>
                                </div>
                                <button className='btn btn-primary' onClick={this.props.getData} style={{float:'right', marginRight:'16px'}}>Get Data</button>
                            </div>
                            <br/>
                            <br/>
                        </div>
                    }
                    <hr/>
                </div>
            </div>
        )
    }
}

export default FilterDiv;
