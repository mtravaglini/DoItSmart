import { StyleSheet, Platform } from 'react-native';

module.exports = StyleSheet.create({
    safeView: {
      paddingTop: Platform.OS === "android" ? 30 : 0,
    },
    image: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    titleContainer: {
      alignItems: 'center',
      paddingTop: "25%",
      paddingBottom: "25%",
      paddingLeft:"10%",
      paddingRight:"10%"
    },
    titleText: {
      fontSize: 35,
      fontWeight:"bold",
      fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
      color:"cornflowerblue",
    },
    logo: {
      width: 66,
      height: 58,
    },
    container: {
      alignItems: 'center',
      paddingTop: 300,
    },
    addTickerContainer: {
      alignItems: 'flex-start',
      paddingTop: 10,
    },
    textDisplayContainer: {
      flexDirection: "row",
      alignItems: 'center',
      paddingTop: 10,
    },
    tickerDisplayContainer: {
      flexDirection: "row",
      justifyContent: 'space-between',
    },
    mainButton: {
      width: "75%",
      height: 50,
      borderRadius: 25,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: "cornflowerblue",
      justifyContent:"center"
    },
    button: {
      height: 47,
      borderRadius: 5,
      width: 80,
      alignItems: 'center',
      backgroundColor: "cornflowerblue",
      justifyContent:"center"
    },
    smallButton: {
      width: "40%",
      height: 40,
      borderRadius: 20,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 5,
      marginRight: 5,
      backgroundColor: "cornflowerblue",
      justifyContent:"center"
    },
    buttonText: {
      textAlign:"center",
      textAlignVertical:"center",
      color:"white",
      fontWeight:"bold",
      fontSize:20
    },
    smallText: {
      textAlign:"center",
      textAlignVertical:"center",
      color:"white",
      fontWeight:"bold",
      fontSize: 16,
    },
    textInput: {
      borderWidth:3,
      borderRadius :15,
      borderTopRightRadius :15,
      borderTopLeftRadius :15,
      border :15,
      borderColor:"cornflowerblue",
      width:"85%",
      height: 40,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 18,
      backgroundColor:"white"
    },
    textInputSmall: {
      borderWidth:3,
      borderRadius:17,
      borderColor:"cornflowerblue",
      width:"25%",
      height: 25,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 18,
      backgroundColor:"white"
    },
    labelDisplay: {
      color: "cornflowerblue",
      width:"20%",
      height: 25,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 15,
    },
    textDisplay: {
      borderBottomWidth: 3,
      borderColor:"cornflowerblue",
      color: "cornflowerblue",
      width:"75%",
      height: 25,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 18,
      backgroundColor:"lightgrey"
    },
    portfolioTextDisplay: {
      color: "cornflowerblue",
      width:"100%",
      height: 25,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 12,
    },
    textDisplaySmall: {
      borderBottomWidth: 3,
      borderColor:"cornflowerblue",
      color: "cornflowerblue",
      width:"32.5%",
      height: 25,
      marginBottom: 5,
      paddingLeft:"5%",
      fontSize: 18,
      backgroundColor:"lightgrey"
    },
    roundButton: {
      width: 100,
      height: 50,
      borderRadius: 25,
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      backgroundColor: "cornflowerblue",
      justifyContent:"center"
    },
    portfolioContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      marginBottom: 0,
      marginTop: 0,
      marginLeft: 0,
      borderColor: "cornflowerblue",
      borderWidth: 5,
      borderRadius: 10,
      paddingBottom:0,
      paddingTop:0,
    },
    portfolioMainText: {
      fontSize: 18,
      paddingLeft: 5,
      fontWeight:"bold",
      alignItems: "flex-start",
      color: "cornflowerblue"
    },
    tagText: {
      fontSize: 18,
      paddingLeft: 5,
      color: "grey"
    },
    closeBox: {
      position: 'absolute', 
      bottom:"2%", 
      right:"2%",
      width: "40%",
      height: 40,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: 'center',
      marginTop: 100
    },
    closeText: {
      fontSize: 18,
      color:"white",
      fontWeight:"bold",
    },
    valueBox: {
      // position: 'absolute', 
      // bottom:"2%", 
      // right:"2%",
      width: "60%",
      height: 40,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: 'center',
      // marginTop: 100
    },
    innerContainer: {
      marginLeft: 45,      
      flexDirection: 'column',
      alignItems: 'center',
    },
    itemHeading: {
      fontWeight: "bold",
      fontSize: 18,
      marginRight: 22,
    },
    formContainer: {
      flexDirection: 'row',
      height: 80,
      marginLeft: 10,
      marginRight: 10,
      marginTop: 100
    },
    containerX: {
      backgroundColor: "#e5e5e5",
      padding: 15,
      borderRadius: 15,
      margin: 5,
      marginHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      // paddingTop: 300,
    },
    input: {
      height:48,
      borderRadius: 5,
      overflow: 'hidden',
      paddingLeft: 16,
      flex: 1,
      marginRight: 5,
      backgroundColor: "white"
    },
    todoIcon: {
      marginTop: 5,
      fontSize: 20,
      marginLeft: 14,
    },
    safeView: {
      // flex: 1,
      paddingTop: Platform.OS === "android" ? 30 : 0,
    },
  });
