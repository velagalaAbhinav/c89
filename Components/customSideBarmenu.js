import React,{Component} from 'react';
import {View,StyleSheet,text,Image,TouchableOpacity,TextInput,Alert,Modal,KeyboardAvoidingViewComponent, ImagePickerIOS} from 'react-native';
import {DrawerItems} from 'react-navigation-drawer'
import {Avatar} from 'react-native-element'
import db from '../config'
import firebase from 'firebase'

export default class customSideBarMenu extends React.Component{
  constructor(){
    super()
    this.state = {
      userId: firebase.auth().currentUser.email,
      image: '#',
      name:'',
      docId:''
    }
  }
  selectPicture = async()=>{
    const {cancelled,uri} = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.All,
      AllowsEditing:true,
      Aspect:[4,3],
      Quality:1
    })
    if(!cancelled){
      this.uploadImage(uri,this.state.userId)
    }
  }
  uploadImage = async(uri,imageName)=>{
    var response = await fetch(uri)
    var blob = await response.blob()
    var Ref = firebase.stories().ref().child('user_profiles/'+ imageName)
    return ref.put(blob).then(response=>{
      this.fetchImage(imageName)
    })
  }

  fetchImage = (imageName) => {
    var storageRef = firebase.storage().ref().child('user_profiles/'+ imageName)
    storageRef.getDownloadURL()
    .then(uri =>{
      this.setState({
        image:uri
      })
      .catch(error =>{
        this.setState({
          image:'#'
        })
      })
    })
  }

  getUserProfile = ()=>{
    db.collection("users").where("email_id",'==', this.state.userId)
    .onSnapshot(snapshot =>{
      snapshot.forEach(doc =>{
        this.setState({
          name:doc.data().first_name + "" + doc.data().last_name,
          docId:doc.id,
          image: doc.data().image,

        })
      })
    })
  }

  componentDidMount(){
    this.fetchImage(this.state.userId)
    this.getUserProfile()
  }
    render(){
        return(
            <View style={{flex:1}}>
              <View style = {{flex:0.5,alignItems:'center',backgroundColor:'orange'}}>
                <Avatar
                roundIt
                source = {{
                  uri:this.state.image
                }}
                size = 'medium'
                onPress = {()=>{
                  this.selectPicture()
                }}
                containerStyle = {styles.imageContainer}
                showEditButton 
                />
                <Text style = {{fontWeight:100,fontSize:20,paddingTop:10}}>{this.state.name}</Text>
              </View>
                <View style = {styles.drawerItemsContainer}>
                    <DrawerItems{...this.props}/>
                </View>
                <View style = {styles.logOutContainer}>
                    <TouchableOpacity style = {styles.logOutButton}
                    onPress = {()=>{
                        this.props.navigation.navigate('WelcomeScreen')
                        firebase.auth().signOut()
                    }}>
                        <Text>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container : {
      flex:1
    },
    drawerItemsContainer:{
      flex:0.8
    },
    logOutContainer : {
      flex:0.2,
      justifyContent:'flex-end',
      paddingBottom:30
    },
    logOutButton : {
      height:30,
      width:'100%',
      justifyContent:'center',
      padding:10
    },
    logOutText:{
      fontSize: 30,
      fontWeight:'bold'
    }
  })