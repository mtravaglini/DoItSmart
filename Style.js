import {
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native';

module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    // marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // paddingTop: 0,
    // padding: 0,
    backgroundColor: "midnightblue",
    // paddingTop: 5,
  },
  // container: {
  //   alignItems: 'center',
  // },
  // ########################################

  // main title screen text ########################################
  mainTitleContainer: {
    alignItems: 'center',
    paddingTop: "20%",
    paddingBottom: "20%",
    paddingLeft: "10%",
    paddingRight: "10%",
    backgroundColor: "cornflowerblue",
    marginTop: 0,
    marginBottom: "5%",
    // marginHorizontal: "1%",
    // borderRadius: 5,
  },
  titleText: {
    fontSize: 35,
    fontWeight: "bold",
    // fontFamily: Platform.OS === "android" ? "sans-serif" : "AppleSDGothicNeo",
    color: "white",
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
    // fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: "cornflowerblue",
    marginTop: 5
    // marginBottom: 5
  },
  pageSubTitleText: {
    fontSize: 15,
    fontWeight: "bold",
    // fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
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
    justifyContent: "center",

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    borderColor: "cornflowerblue",

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButtonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: "cornflowerblue",
    // fontWeight: "bold",
    fontSize: 15,
  },
  btnNarrow: {
    width: "25%",
    marginHorizontal: 5,
    // height: 35,
  },
  btnSuccess: {
    backgroundColor: "green",
    shadowColor: 'green',
  },
  btnWarning: {
    backgroundColor: "orange",
    shadowColor: 'orange',
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
    backgroundColor: "white",

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputButton: {
    height: 48,
    borderRadius: 15,
    width: "28%",
    alignItems: 'center',
    backgroundColor: "cornflowerblue",
    justifyContent: "center",

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

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
    color: "lightgrey",
    fontSize: 14,
  },
  input: {
    height: 48,
    marginHorizontal: "1%",
    // width: "95%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    marginLeft: 0,
    // marginRight: "2%",
    marginBottom: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "midnightblue",
    backgroundColor: "white",
    alignContent: "center",

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,


    // borderColor: "cornflowerblue",
    // borderBottomWidth: 4,
    // borderTopWidth: 1,
    // borderLeftWidth: 4,
    // borderRightWidth: 1,
    // justifyContent: "center"
  },
  // ########################################

  // task list  ########################################
  listContainer: {
    // backgroundColor: "red",
    backgroundColor: "cornflowerblue",
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
    color: "white",
    // marginRight: 22,
  },
  // ########################################

  // Standard Text
  standardText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  txtSuccess: {
    color: "green",
  },
  txtWarning: {
    color: "orange",
  },
  txtError: {
    color: "red",
  },

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

    shadowColor: 'cornflowerblue',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // Groups and Resource Tags ################################ 
  tagContainer: {
    backgroundColor: "white",
    padding: "3%",
    borderRadius: 15,
    marginHorizontal: "1%",
    marginBottom: 15,
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row"
  },
  tagText: {
    fontSize: 15,
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
    color: 'cornflowerblue',
    alignSelf: "center"
  },
  footerText: {
    color: 'cornflowerblue',
    alignSelf: "center"
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
    marginHorizontal: 30,
    marginTop: "20%",
    marginBottom: "60%",
    // marginVertical: "50%",
    backgroundColor: 'midnightblue',
    borderRadius: 20,
    borderColor: "cornflowerblue",
    borderWidth: 1,
    padding: 35,
    alignItems: 'center',


    shadowColor: 'cornflowerblue',
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
