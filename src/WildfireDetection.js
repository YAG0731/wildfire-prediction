import React from 'react';
import DetectionDetail from './DetectionComponents/DetectionDetail.js';
// import './DetectionComponents/Pages.css';
// import './DetectionComponents/WildfireDetection.css';
import './DetectionComponents/example-fire-detection.png';
import DetectionList from './DetectionComponents/DetectionList.js';
import DetectionImage from './DetectionComponents/DetectionImage.js';
import { ControlledLayer } from 'react-leaflet/lib/LayersControl';


class WildfireDetection extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      selectedFireImg: null,
      bounding_boxes: [],
      detection_scores: [],
      detection_classes: [],
      selectedFile: null,
      loading: false,
      inputFileUrl: null,
      area: 'what',
      imageColor: 'True Color Composite',
      date: null,
      gotInputImage: false,
      detectScoreCompleted: false,
      detectFireCompleted: false,
      job_id: null,
      job_done: false,
    };

    this.getFile = this.getFile.bind(this)

  }

  async componentDidMount(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    this.setState({
      date: today
    })

    setTimeout(() => { this.getFile(); }, 10);

  }

  async getFile(){
    this.setState({
      gotInputImage: false
    })
    var url = 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&&CRS=EPSG:4326&WRAP=DAY&LAYERS='    
    var height = 2000
    if(this.state.imageColor === 'True Color Composite'){
      url += 'MODIS_Terra_CorrectedReflectance_TrueColor'
    }
    else{
      url += 'MODIS_Terra_CorrectedReflectance_Bands721'
    }
    url += '&FORMAT=image/jpeg&HEIGHT='+height+'&WIDTH='+height+'&BBOX='

    if(this.state.area === 'North California'){
      url += '37,-125,42,-120&TIME='
    }
    else{
      url += '32,-122,39,-114&TIME='
    }
    url += this.state.date

    const res = await fetch(url)
    console.log(res)
    const blob = await res.blob()
    const file = new File([blob], 'image.jpg', {type: blob.type});
    console.log(file)

    this.setState({
      selectedFile: file,
      inputFileUrl: url,
      gotInputImage: true
    })
  }

  onFileChange = (event) => {
    // Update the state
    this.setState({ 
      inputFileUrl: URL.createObjectURL(event.target.files[0]),
      selectedFile: event.target.files[0]
    })
    console.log(event.target.files[0])
  }

  // on file upload (click the upload button)
  onFileUpload = () => {
    console.log('running onFileUpload')
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);  // scroll to bottom automatically

    // Request made to the backend api
    // Call to fire detection API
    this.setState({ loading: true });
    this.detectFire();
    // wait 10 seconds to allow detectFire to process
    // setTimeout(() => { this.detectScore(); }, 8000);

  }

  // Makes a call to prediction api results
  // which include detection boxes, scores, and classifications
  async detectScore() {
    console.log('running detect score')
    this.setState({
      detectScoreCompleted: false,
      // loading: true,
    })

    // Fetch request to wpp module
    fetch('https://wpp-fire-detection-ml.herokuapp.com/result', {
      method: 'POST'
    })
    .then((response) => {
      const reader = response.body.getReader();
      return new ReadableStream({
        start(controller) {
          // The following function handles each data chunk
          function push() {
            // "done" is a Boolean and value a "Uint8Array"
            reader.read().then(({ done, value }) => {
              // Is there no more data to read?
              if (done) {
                // Tell the browser that we have finished sending data
                controller.close();
                return;
              }
              // Get the data and send it to the browser via the controller
              controller.enqueue(value);
              push();
            });
          };

          push();
        }
      })

    })
    .then(stream => new Response(stream))
    .then(response => {
      response.json().then(data => ({
        data: data,
        status: response.status
      }))
      .then(res => {
        const detectionBoxes = res.data.predictions[0].detection_boxes;
        const detectionScores = res.data.predictions[0].detection_scores;
        const detectionClasses = res.data.predictions[0].detection_classes;

        this.setDetectionInfo(detectionBoxes, detectionScores, detectionClasses);
        this.setState({
          detectScoreCompleted: true
        })
      })
    })
    .catch(error => console.log("ERROR:", error));

  }

  // Set the state for the detection info
  setDetectionInfo = (boxes, scores, classes) => {
    let i = 0,
     realScores = [],
     boundingBoxes = [],
     realClasses = [];
    while(scores[i] > 0.90) {
      realScores.push(scores[i]);
      i++;
    }
    for(let j = 0; j < i; j++) {
      boundingBoxes.push(boxes[j]);
      realClasses.push(classes[j]);
    }

    this.setState({
      bounding_boxes: boundingBoxes,
      detection_scores: realScores,
      detection_classes: realClasses
    })

  }

  // Comsumes the ReadableStream from the Fetch call
  async detectFire() {
    console.log('running detect fire')
    this.setState({
      detectFireCompleted: false,
      loading: true,
    })

    const formData = new FormData();
    formData.append('file', this.state.selectedFile);

    fetch('https://wpp-fire-detection-ml.herokuapp.com/predict', {
      method: 'POST',
      body: formData,

    })
    .then(res => {
      // Start loading
      this.setState({ 
        job_done: false,
       });

      res.text().then(body => {
        console.log(body)
        this.setState({
          job_id: body
        }, () => {
          this.checkJobStatus();
          this.timerId = setInterval(() => this.checkJobStatus(), 1000)
        })

        // fetch('https://wpp-fire-detection-ml.herokuapp.com/status/' + body)
        // .then(res => res.json())
        // .then(response => {
        //   console.log(response)
        //   this.setState({
        //     job_done: true,
        //   })
        // })
      });

      // const reader = res.body.getReader();
      // if(!res.ok) {
      //   throw Error("Error getting the predict image")
      // }
      // return new ReadableStream({
      //   start(controller) {
      //     return pump();
      //     function pump() {
      //       return reader.read().then(({ done, value }) => {
      //         // When no more data needs to be consumed, close the stream
      //         if (done) {
      //             controller.close();
      //             return;
      //         }
      //         // Enqueue the next data chunk into our target stream
      //         controller.enqueue(value);
      //         return pump();
      //       });
      //     }
      //   }
      // })
    })
    .then(stream => new Response(stream))
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .then(url => {

      // set the state of Fire Image URL to the made url
      this.setState({
        fireImgUrl: url,
        loading: false,
        // detectFireCompleted: true,
      });
    })
    .catch(err => console.error(err));
  }

  // Fire Functions
  onFireSelect = (fire) => {
    this.setState({ selectedFire: fire });
  }

  checkJobStatus(){
    fetch('https://wpp-fire-detection-ml.herokuapp.com/status/' + this.state.job_id)
    .then(res => res.json())
    .then(response => {
      console.log(response)
      if('completed' in response){
        if(response['completed'] == response['total']){
          console.log('done')
          clearInterval(this.timerId)
          this.setState({
            job_done: true,
            loading: false,
          })
        }
      }
    })
  }

  render() {
    var styles = {
      buttonGroupButton: {
          width: '20%',
          backgroundColor: '#f0f0f0', 
          border: '1px solid grey',
          padding: '10px 24px', 
          float: 'left',
          margin:'0 20px 0 0',
          borderRadius: '20px',
          color:'black',
          outline:'none'
      },
      buttonGroupButtonActive: {
          width: '20%',
          backgroundColor: '#1580fb', 
          border: '1px solid #1580fb',
          color: 'white', 
          padding: '10px 24px', 
          float: 'left',
          margin:'0 20px 0 0',
          borderRadius:'20px',
          outline:'none'
      }
    }

    return (
      <div>
        <div>
          <div style={{position:'absolute', marginTop:'72px', zIndex:'-100'}}>
            <div style={{margin:'10px 0 0 20px', width:'75vw'}}>

              {/* <h1>Wildfire Detection</h1> */}
              <div style={{width:"100%", display:'flex', justifyContent:'center', flexWrap:'wrap', margin:'10px'}}>
                  <button style={styles.buttonGroupButton} onClick={this.props.viewChange.bind(this, 'Monitoring')}>Monitoring</button>
                  <button style={styles.buttonGroupButtonActive}>Detection</button>
              </div>
              <hr style={{margin:'0px'}}/>
              
              <div style={{margin:'10px'}}>

                <div style={{display:'flex', justifyContent:'center'}}>
                  <select style={{padding:'16px'}} onChange={(e)=>{this.setState({area: e.target.value}); setTimeout(()=>{ this.getFile()}, 10) }}>
                    <option value='North California'>North California</option>
                    <option value='South California'>South California</option>
                  </select>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                  <select style={{padding:'16px'}} onChange={(e)=>{this.setState({imageColor: e.target.value}); setTimeout(() =>{this.getFile()}, 10) }}>
                    <option value='True Color Composite'>True Color Composite</option>
                    <option value='False Color Composite'>False Color Composite</option>
                  </select>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                  <input type='date' onChange={(e)=>{this.setState({date: e.target.value}); setTimeout(()=>{this.getFile()}, 10)}}/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                  <button className='btn btn-primary' onClick={this.onFileUpload}>Run detection</button>

                </div>
                <hr/>

                {/* <input type='file' className="form-control" onChange={this.onFileChange} /> */}
                <div class="custom-file" style={{width:'60%'}}>
                  <input type="file" class="custom-file-input" id="validatedCustomFile" required onChange={this.onFileChange} />
                  <label class="custom-file-label" for="validatedCustomFile">Choose file...</label>
                  <div class="invalid-feedback">Example invalid custom file feedback</div>
                </div>
                <br/>
                <br/>

                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px', width:'60%'}}>
                  <h5 style={{fontWeight:'bold'}}>Input Image:</h5>
                  <hr/>
                  {this.state.area}, {this.state.imageColor}, {this.state.date}:
                  <br/>
                  <br/>

                  {
                    this.state.gotInputImage === false?
                    <div>Loading...</div>
                    :
                    <img src={this.state.inputFileUrl} width='100%' />
                  }
                </div>
                <br/>
                
                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px', width:'60%', float:'left', marginBottom:'40px'}}>
                  <h5 style={{fontWeight:'bold'}}>Output Image</h5>
                  <hr/>

                  {
                    this.state.job_id == null?
                    <div></div>
                    :
                    this.state.job_done?
                    <img src={'https://wpp-fire-detection-ml.herokuapp.com/image/' + this.state.job_id} width='100%' />
                    :
                    <div>Loading...</div>

                    // <DetectionImage url={this.state.fireImgUrl} loading={this.state.loading} />

                  }
                  {/* <DetectionImage url={this.state.fireImgUrl} loading={this.state.loading} /> */}
                </div>

                <div style={{border:'1px solid grey', borderRadius:'10px', padding:'10px', width:'38%', float:'right'}}>
                  <h5 style={{fontWeight:'bold'}}>Detection List</h5>
                  <hr/>
                  {
                    !this.state.loading?
                    <DetectionList
                      boxes={this.state.bounding_boxes}
                      scores={this.state.detection_scores}
                      classes={this.state.detection_classes}
                    />
                    :
                    <div></div>
                  }
                  {/* <DetectionList
                    boxes={this.state.bounding_boxes}
                    scores={this.state.detection_scores}
                    classes={this.state.detection_classes}
                  /> */}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }

};

export default WildfireDetection;