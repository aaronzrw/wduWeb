//add useState for handling the image as a file and then the image as a url from firebase
import React, { Component, forwardRef, useCallback, useState} from 'react'
import firebase from 'firebase/app'
import store from "../redux/store";
import _ from 'lodash';

//Components
import uploadImg from '../media/uploadImg.png'

//MUI
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';

//Icons
import PublishIcon from '@material-ui/icons/Publish';
import CloseIcon from '@material-ui/icons/Close';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import {
  SET_SNACKBAR,
} from '../redux/types';


const styles = (theme) => ({
	...theme.spreadThis,
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
});

function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
}
function readURL(file) {
  return URL.createObjectURL(file);
}

//add import for storage 
class UserProfileImg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      image: null,
      url: '',
      progress: null,
      showUploadButton: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.ShowUploadButton = this.ShowUploadButton.bind(this);
    this.HideUploadButton = this.HideUploadButton.bind(this);
    this.ShowApproveButton = this.ShowApproveButton.bind(this);
    this.HideApproveButton = this.HideApproveButton.bind(this);
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(this.state.user, nextProps.user)){
      this.setState({user: nextProps.user})
    }
  }

  handleChange = e => {
    if (e.target.files[0]) {
      const image = e.target.files[0];

      if(isFileImage(image)){
        var url = readURL(image);
        this.setState({image,  url});
      }
      else{
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{type: "error", message:"Invalid Img File"}]
        });
      }
    }
  }
  handleUpload = () => {
    const {image} = this.state;
    var name = Date.now() + '.' + image.name.split('.')[1] ;

    var blob = image.slice(0, image.size, image.type); 
    var newFile = new File([blob], name, {type: image.type});

      const uploadTask = firebase.storage().ref(`userProfiles/${newFile.name}`).put(newFile);
      uploadTask.on('state_changed', 
      (snapshot) => {
        // progrss function ....
        if(!this.state.uploading){
          this.setState({uploading: true})
        }
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        this.setState({progress});
      }, 
      (error) => {
            // error function ....
        console.log(error);
      }, 
    () => {
        // complete function ....
        firebase.storage().ref('userProfiles').child(newFile.name).getDownloadURL()
        .then(async url => {
          return {url, user: await firebase.firestore().doc(`users/${this.state.user.userId}`).get()}
        })
        .then(async (obj) => {
          obj.user.ref.update({img: obj.url});
          return {url: obj.url, data: await firebase.firestore().collection(`waifuPoll`).get()}
          //this.setState({image: null ,url: '', progress:null, uploading: false, showApproveButton:false, showUploadButton: false});
        })
        .then((obj) => {
          obj.data.forEach((doc) => {
            var votes = doc.data().votes;
            var userVote = votes.filter(y => y.husbandoId == this.state.user.userId);
            if(userVote.length > 0){
              userVote[0].img = obj.url;
              doc.ref.update({ votes })
            }
          });
          this.setState({image: null ,url: '', progress:null, uploading: false, showApproveButton:false, showUploadButton: false});
        })
        .catch(err => {
          store.dispatch({
            type: SET_SNACKBAR,
            payload: [{type: "error", message: err.message}]
          });
        })
    });
  }

  ShowUploadButton(){
    if(this.state.progress == null){
      //nothing happening so allow upload
      this.setState({showUploadButton: true})
    }
  }
  HideUploadButton(){
    if(this.state.progress == null){
      //nothing happening so allow upload
      this.setState({showUploadButton: false})
    }
  }
  
  ShowApproveButton(){
    this.setState({showApproveButton: true})
  }
  HideApproveButton(){
    this.setState({showApproveButton: false})
  }

  render() {
    const {classes} = this.props;
    
    return (
      <Grid container style={{height: "100%", position:"relative", filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))"}}>
        <img onMouseEnter={this.ShowUploadButton}
          src={this.state.user.img} style={{height:"100%", width:"100%", clipPath:"circle(50%)"}} />
        
        {this.state.image != null ?
          <>
            <div style={{position:"absolute", top: "50%",transform: "translate(250px, -50%)", filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))"}}>
              
              <div className={classes.wrapper}>
                <img onMouseEnter={this.ShowApproveButton} src={this.state.url} style={{height:"50px", width:"50px", clipPath:"circle(50%)"}} />
                {this.state.uploading && <CircularProgress size={60} className={classes.fabProgress} />}

                {this.state.showApproveButton ?
                  <div onClick={(e) => this.handleUpload()} onMouseLeave={this.HideApproveButton}
                    style={{height:"100%", width:"100%", clipPath:"circle(50%)", backgroundColor:"rgba(0,0,0,0.72)", cursor:"pointer",
                    position: "absolute", top: "50%", left:"50%", transform: "translate(-50%,-50%)", zIndex:1}}>
                      <PublishIcon style={{height:"50%", width:"50%", filter:"invert(1)", position: "absolute", top: "50%", left:"50%", transform: "translate(-50%,-50%)"}} />
                  </div>
                  : <></>
                }
              </div>

              <Typography style={{fontFamily:"Edo", fontSize:"15px", textAlign:"center"}}>PREVIEW</Typography>
            </div>
            
          </>
          : <></>
        }

        {this.state.showUploadButton ?
          <Grid onClick={(e) => this.upload.click() } onMouseLeave={this.HideUploadButton} container alignItems="center" justify="center" 
            style={{height:"100%", width:"100%", clipPath:"circle(50%)", backgroundColor:"rgba(0,0,0,0.72)", cursor:"pointer",
            position: "absolute", top: "50%", left:"50%", transform: "translate(-50%,-50%)", zIndex:1}}>
              <img src={uploadImg} style={{height:"75px", width:"75px", filter:"invert(1)"}} />
              <input id="myInput" type="file" onChange={this.handleChange} ref={(ref) => this.upload = ref} style={{ display: 'none' }} />
          </Grid>
          : <></>
        }
      </Grid>
    )
  }
}
  
export default (withStyles(styles)(UserProfileImg));