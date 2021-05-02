import React,{Component} from 'react'
import {View,StyleSheet,Text,Image,TouchableOpacity,TextInput,Alert,Modal,KeyboardAvoidingViewComponent, FlatList} from 'react-native';
import db from '../config';
import firebase from 'firebase'
import MyHeader from '../Components/myheader'

export default class MyRecievedBooks extends React.Component{
    constructor(props){
        super(props)
        this.state = {
           UserId: firebase.auth().currentUser.email,
           recievedBookList:[],
        }
        this.RequestRef = null
    }
    keyExtractor= (item,index)=>index.toString()
    renderItem = (item,i)=>(
        <ListItem
        key = {i}
        title = {item.book_name}
        subtitle = {item.bookStatus}
        titleStyle = {{color:'black',fontWeight:'bold'}}
        bottomDivider
        />
    )

    componentDidMount(){
        this.getRecievedBookList()
    }
    componentWillUnmount(){
        this.RequestRef()
    }

    getRecievedBookList = ()=>{
        this.RequestRef = db.collection("request_books").where("user_id","==",this.state.UserId)
        .where("book_status","==", "recieved")
        .onsnapShot((snapshot)=>{
            var bookList = snapshot.docs.math((doc)=>{
                doc.data()
            }
                )
                this.setState({
                    recievedBookList:bookList
                })
        })
    }
    

    render(){
        return(
            <View>
                <MyHeader title = "RecievedBooks" navigation = {this.props.navigation}/>
                <View>
                    {
                        this.state.recievedBooks.lenght === 0
                        ?
                        (
                            <View><Text>list all recieved books</Text></View>
                        )
                        :(
                            <FlatList
                            keyExtractor = {this.keyExtractor}
                            data = {this.state.RecievedBooks}
                            renderItem = {this.renderItem}
                            />
                        )
                    }
                </View>
            </View>
        )
    }
}