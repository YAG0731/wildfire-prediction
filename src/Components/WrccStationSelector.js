import React from 'react';

class WrccStationSelector extends React.Component{

    constructor(props){
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event){
        this.props.handleChange(event.target.value);
    }


    render(){
        return(
            <div>
                &nbsp;&nbsp;
                Station: &nbsp;
                <select style={{padding:'14px'}} onChange={this.handleChange}>
                    <option value='cald'>Alder Spring</option>
                    <option value='casc'>Ash Creek </option>
                    <option value='catl'>Atlas Peak</option>
                    <option value='cbac'>Backbone</option>
                    <option value='cbal'>Bald Mtn Loc </option>
                    <option value='cbat'>Batterson</option>
                    <option value='cbbr'>Big Bar</option>
                    <option value='cben'>Benton</option>
                    <option value='cbir'>Big Rock</option>
                    <option value='cbld'>Blue Door</option>
                    <option value='cblm'>Blacks Mountain</option>
                    <option value='cblq'>Blue Ridge (KNF)</option>
                    <option value='cbml'>Blue Mountain Lookout</option>
                    <option value='cbmo'>Blue Mountain</option>
                    <option value='cbmt'>Brush Mountain</option>
                    <option value='cbnr'>Banner Road</option>
                </select>
            </div>

        );
    }
}

export default WrccStationSelector;