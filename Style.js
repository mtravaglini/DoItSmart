import { StyleSheet, Platform } from 'react-native';

module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 50 : 0,
    backgroundColor: "#e5e5e5"
  },
  container: {
    alignItems: 'center',
  },
  // ########################################

  // main title screen text ########################################
  mainTitleContainer: {
    alignItems: 'center',
    paddingTop: "25%",
    paddingBottom: "25%",
    paddingLeft: "10%",
    paddingRight: "10%"
  },
  titleText: {
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: "cornflowerblue",
  },
  logo: {
    width: 66,
    height: 58,
  },
  // ########################################

  // page title screen text ########################################
  pageTitleContainer: {
    alignItems: 'center',
  },
  pageTitleText: {
    // width: 'auto',
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: "cornflowerblue"
    // marginBottom: 5
  },
  pageSubTitleText: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: "cornflowerblue",
    borderColor: "cornflowerblue",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignSelf: "center"
  },
  // ########################################

  // standard buttons ########################################
  mainButton: {
    width: "75%",
    height: 50,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "cornflowerblue",
    justifyContent: "center"
  },
  buttonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20
  },
  secondaryButton: {
    width: "75%",
    height: 30,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "white",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "cornflowerblue"
  },
  secondaryButtonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: "cornflowerblue",
    // fontWeight: "bold",
    fontSize: 15
  },
  // ########################################

  // input + button form ########################################
  inputBtnFormContainer: {
    flexDirection: 'row',
    // height: 80,
    marginLeft: 10,
    marginRight: 10,
    // marginTop: 15,
    marginBottom: 15
  },
  inputShort: {
    height: 48,
    width: "70%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    // marginLeft: 0,
    marginRight: "2%",
    fontSize: 18,
    backgroundColor: "white"
  },
  inputButton: {
    height: 48,
    borderRadius: 15,
    width: "28%",
    alignItems: 'center',
    backgroundColor: "cornflowerblue",
    justifyContent: "center"
  },
  // ########################################

  // input + title form ########################################
  inputFormContainer: {
    flexDirection: 'column',
    // height: 80,
    marginLeft: 10,
    marginRight: 10,
    // marginTop: 15,
    // marginBottom: 15,
  },
  inputLabel: {
    paddingLeft: 10,
    fontSize: 10,
  },
  input: {
    height: 48,
    // width: "95%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    marginLeft: 0,
    // marginRight: "2%",
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: "white",
    alignContent: "center",
    // justifyContent: "center"
  },
  // ########################################

  // task list  ########################################
  listContainer: {
    // backgroundColor: "red",
    backgroundColor: "white",
    // padding: 15,
    borderRadius: 15,
    margin: "1%",
    height: 48,
    marginHorizontal: "5%",
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 300,
  },
  listDelIcon: {
    fontSize: 30,
    marginLeft: "3%",
    marginRight: "5%",
  },
  listText: {
    fontWeight: "bold",
    fontSize: 18,
    // marginRight: 22,
  },
  // ########################################

  // Date ###################################
  dateText: {
    height: 48,
    lineHeight: 48,
    width: "95%",
    borderRadius: 15,
    paddingLeft: 10,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: "white",
  },

// Groups on secondary screens
groupContainer: {
  color: "cornflowerblue",
  borderColor: "cornflowerblue",
  borderRadius: 15,
  margin: "1%",
  // height: 48,
  marginHorizontal: "5%",
  flexDirection: 'row',
  alignItems: 'center',
  // paddingTop: 300,
},
groupButton:{
  width: "19%",
  marginRight: "1%",
},
groupText: {
  fontSize: 15,
  // fontWeight: "bold",
  // fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
  color: "white",
  backgroundColor: "cornflowerblue",
  borderColor: "white",
  borderWidth: 1,
  borderRadius: 5,
  paddingHorizontal: 15,
  // marginBottom: 10

},

  // footer
  footer: {
    flexDirection: "row",
    justifyContent: 'space-evenly'
  },
  footerIcon: {
    fontSize: 30,
    // marginLeft: "10%",
    // marginRight: "10%",
  },

  // OTHER ########################################
  textDisplay: {
    color: "cornflowerblue",
    width: "90%",
    height: 48,
    lineHeight: 48,
    marginBottom: 15,
    paddingLeft: "5%",
    fontSize: 18,
    backgroundColor: "white",
    borderRadius: 15,
  },
  closeBox: {
    position: 'absolute',
    bottom: "2%",
    right: "2%",
    width: "40%",
    height: 40,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 100
  },
  closeText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  // ########################################

  // centeredView: {

  // },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    margin: 20,
    marginVertical: 150,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // button: {
  //   borderRadius: 20,
  //   padding: 10,
  //   elevation: 2,
  // },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  // textStyle: {
  //   color: 'white',
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  // },
  // modalText: {
  //   marginBottom: 15,
  //   textAlign: 'center',
  // },




});
