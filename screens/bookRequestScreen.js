import React,{Component} from 'react'
import {View,StyleSheet,Text,Image,TouchableOpacity,TextInput,Alert,Modal,KeyboardAvoidingView, TouchableHighlight, FlatList} from 'react-native';
import db from '../config';
import firebase from 'firebase'
import MyHeader from '../Components/myheader'
import {BookSearch} from 'react-native-goolgle-books'

export default class BookRequestScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            userId: firebase.auth().currentUser.email,
            bookName:'',
            reasonToRequest:'',
            isBookRequestActive : "",
            reuqestedBookName:"",
            BookStatus:"",
            RequestId:"",
            UserDocId:"",
            DocId:"",
            imageLink:'',
            dataSource:'',
            showFlatList:false
        }
    }
    createUniqueId(){
        return Math.random().toString(36).substring(7)
    }
    addRequest = async(bookName,reasonToRequest)=>{
        var userId = this.state.userId
        var randomRequestId = this.createUniqueId()
        db.collection('requested_books').add({
            user_Id: userId,
            book_name:bookName,
            reason_request:reasonToRequest,
            request_Id: randomRequestId
        })
        await this.getBookRequest()
        db.collection("users").where('email_id','==',userId).get()
        .then()
        .then((snapshot)=>{
            snapshot.forEach(doc =>{
                db.collection("users").doc(doc.id).update({
                    isBookRequestActive:true
                })
            })
        })
        this.setState({
            bookName:'',
            reasonToRequest:'',
            RequestId:randomRequestId
        })
        return Alert.alert('bookRequestedSuccessfully')
    }

    recievedBooks = (bookName) =>{
        var UserId = this.state.UserId
        var RequestId = this.state.RequestId
        db.collection("recieved_books").add({
            user_Id:UserId,
            book_name:bookName,
            request_Id:RequestId,
            BookStatus:"recieved"
        })
    }

    getIsBookRequestActive = ()=>{
        db.collection("users").where('email_id','==',this.state.UserId)
        .onSnapShot(querySnapshot =>{
            querySnapshot.forEach(doc =>{
                this.setState({
                    isBookRequestActive:doc.data().thisbookRequestActive,
                    UserDocId:doc.id
                })
            })
        })
    }

    getBookRequest = ()=>{
        var bookRequest = db.collection("requested_books").where('user_Id','==',this.state.UserId).get()
        .then((snapshot)=>{
            snapshot.forEach(doc =>{
                if(doc.data().book_status!== 'recieved'){
                    this.setState({
                        RequestId:doc.data().request_Id,
                        reuqestedBookName:doc.data().book_name,
                        BookStatus:doc.data().book_status,
                        docId:doc.id
                    })
                }
            })
        })
    }

    componentDidMount(){
        this.getBookRequest()
        this.getIsBookRequestActive()
    }
 
    updateBookRequestStatus = () => { 
        db.collection('requested_books').doc(this.state.docId)
        .update({
            book_status:'recieved'
        })
        db.collection("users").where('email_id','==',userId).get()
        .then()
        .then((snapshot)=>{
            snapshot.forEach(doc =>{
                db.collection("users").doc(doc.id).update({
                    isBookRequestActive:false
                })
            })
        })
    }

    sendNotification = ()=>{
        db.collection("users").where('email_id','==',userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                var name = doc.data().first_name
                var lastName = doc.data().last_name
                db.collection("all_notifications").where("request_id","==",this.state.RequestId)
                .then((snapshot)=>{
                    snapshot.forEach(doc =>{
                        var donorId = doc.data().donor_id
                        var bookName = doc.data().book_name
                        db.collection("all_notifications").add({
                            target_User_id:donorId,
                            message:name+""+lastName+'recieved the book'+bookName,
                            notification_Status:"unread",
                            book_Name: bookName
                        })
                    })
                })
            })
        })
    }

    async getBookRequestFromAPI(bookName){
        this.setState({
            bookName:bookName,
        })
        if(bookName.lenght>2){
            var books = await BookSearch.searchbook(bookName,'AIzaSyAGxnB-ngbVn5tFzKgIY5J_XEtSk4_SfGU')
            this.setState({
                dataSource:books.data,
                showFlatList:true
            })
        }
    }

    renderItem = ({item,i}) =>{
        var obj = {
            title: item.volumeInfo.title,
            selfLink: item.selfLink,
            buyLink:item.saleInfo.buyLink,
            imageLink:item.volumeInfo.imageLink
        }
        return(
            <TouchableHighlight
            style = {{alignItems:'center',backgroundColor:'green',padding:10,width:'90%'}}
            activeOpacity = {0.6}
            onPress = {()=>{
                this.setState({
                    showFlatList:false,
                    bookName:item.volumeInfo.title
                })
            }} 
            bottomDivider>
                <Text>{item.volumeInfo.title}</Text>
            </TouchableHighlight>
        )
    }
    
    render(){
        if(this.state.isBookRequestActive === true){
            return(
                <View>
                    <View>
                        <Text>Book Name</Text>
                        <Text>{this.state.reuqestedBookName}</Text>
                    </View>
                    <View>
                        <Text>BookStatus</Text>
                        <Text>{this.state.BookStatus}</Text>
                    </View>
                    <TouchableOpacity
                    style = {{borderWidth:1,borderColor:'orange',backgroundColor:'yellow',width:300,alignSelf:'center',alignItems:'center',height:40,marginTop:30}}
                    onPress = {()=>{
                        this.sendNotification()
                        this.updateBookRequestStatus()
                        this.recievedBooks(this.state.reuqestedBookName)
                        
                    }}>
                        <Text>i received the books</Text>
                    </TouchableOpacity>

                
                </View>
            )
        }
        else{

        
        return(
            <View>
          <MyHeader title = {'requestBook'}/>
          <KeyboardAvoidingView>
                                <TextInput
                                 style = {styles.formTextInput}
                                 placeholder = {"enter book name "}
                                onChangeText = {(text)=>{
                                    this.getBookRequestFromAPI(text)
                                }}
                                onClear = {(text)=>{
                                    this.getBookRequestFromAPI('')
                                }}
                                 value={this.state.bookName}
                                />
                                {
                                    this.state.showFlatList
                                    ?(
                                        <FlatList
                                        data = 
                                    ):
                                    (

                                    )
                                }

                                <TextInput
                                style = {[styles.formTextInput,{height:300}]}
                                multiline
                                numberOfLines = {8}
                                placeholder = {"why do you need the book"}
                                onChangeText = {(text) => {
                                    this.setState ({
                                        reasonToRequest:text
                                    })
                                }}
                                value={this.state.reasonToRequest}
                                />
                                <TouchableOpacity
                                style = {styles.button}
                                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                                >
                                    <Text>Request</Text>
                                </TouchableOpacity>

          </KeyboardAvoidingView>
                
            </View>
        )
      }
    }
}