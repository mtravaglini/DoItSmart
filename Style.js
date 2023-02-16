import {
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native';

// Blue with green
const headerBackgroundColour = "black";
const headerColour = "cornflowerblue";

const mainScreenColour = "cornflowerblue";
const secondaryScreenColour = "midnightblue";

const labelColour = "midnightblue";

const mainTextColour = "cornflowerblue";
const inputTextColour = "cornflowerblue";
const textBackgroundColour = "white";

const listBackgroundColour = "lightgreen"
const listTextColour = "darkgreen"

const footerBackgroundColour = "black";
const footerColour = "cornflowerblue";


module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    // marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // paddingTop: 0,
    // padding: 0,
    backgroundColor: mainScreenColour,
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
    backgroundColor: secondaryScreenColour,
    marginTop: 0,
    marginBottom: "5%",
    // marginHorizontal: "1%",
    // borderRadius: 5,
  },
  titleText: {
    fontSize: 35,
    fontWeight: "bold",
    // fontFamily: Platform.OS === "android" ? "sans-serif" : "AppleSDGothicNeo",
    color: mainTextColour,
  },
  logo: {
    width: 66,
    height: 58,
  },
  // ########################################
  
  // header ###########################
  header: {
    backgroundColor: headerBackgroundColour,
  },

  // page title screen text ########################################
  pageTitleContainer: {
    alignItems: 'center',
  },
  pageTitleText: {
    // width: 'auto',
    fontSize: 25,
    fontWeight: "bold",
    // fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: headerColour,
    marginTop: 5,
    // marginBottom: 5,
  },
  pageSubTitleText: {
    fontSize: 15,
    fontWeight: "bold",
    // fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: headerColour,
    borderColor: headerColour,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignSelf: "center"
  },
  headerIcon: {
    fontSize: 30,
    marginLeft: "3%",
    marginRight: "5%",
    color: headerColour,  
  },
// ########################################

  // standard buttons ########################################
  mainButton: {
    width: "75%",
    height: 50,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: secondaryScreenColour,
    justifyContent: "center",
    shadowColor: mainScreenColour,
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
    backgroundColor: textBackgroundColour,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: secondaryScreenColour,
    shadowColor: mainScreenColour,
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
    color: secondaryScreenColour,
    // fontWeight: "bold",
    fontSize: 15,
  },
  menuButton: {
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: "5%",
    height: 30,
    borderRadius: 5,
  },
  btnNarrow: {
    width: "25%",
    marginHorizontal: 5,
    // height: 35,
  },
  btnSuccess: {
    backgroundColor: "darkgreen",
    shadowColor: 'darkgreen',
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
    marginHorizontal: "5%",
    marginVertical: "2%"
  },
  inputShort: {
    height: 48,
    width: "80%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    // marginLeft: 0,
    marginRight: "2%",
    fontSize: 18,
    backgroundColor: textBackgroundColour,
    shadowColor: mainScreenColour,
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
    width: "18%",
    alignItems: 'center',
    backgroundColor: secondaryScreenColour,
    justifyContent: "center",
    shadowColor: mainScreenColour,
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
    fontWeight: "bold",
    color: labelColour,
    fontSize: 15,
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
    color: inputTextColour,
    backgroundColor: textBackgroundColour,
    alignContent: "center",
    shadowColor: mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,


    // borderColor: secondaryScreenColour,
    // borderBottomWidth: 4,
    // borderTopWidth: 1,
    // borderLeftWidth: 4,
    // borderRightWidth: 1,
    // justifyContent: "center"
  },
  // ########################################

  // task list  ########################################
  listContainer: {
    backgroundColor: listBackgroundColour,
    // borderRadius: 15,
    // margin: "1%",
    height: 48,
    // marginHorizontal: "5%",
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSwipeContainer: {
    justifyContent: "flex-start",
    flex: 1,  
    backgroundColor: "green",
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSwipeContainer: {
    justifyContent: "flex-end",
    flex: 1,  
    backgroundColor: "red",
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDelIcon: {
    fontSize: 30,
    marginLeft: "3%",
    marginRight: "5%",
    color: listTextColour,
  },
  listText: {
    fontWeight: "bold",
    fontSize: 18,
    color: listTextColour,
    paddingLeft: "5%",
  },
  // ########################################

  // Standard Text
  standardText: {
    fontWeight: "bold",
    fontSize: 18,
    color: mainTextColour,
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
    // marginHorizontal: "5%",
    fontSize: 16,
    backgroundColor: textBackgroundColour,
    shadowColor: mainScreenColour,
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
    backgroundColor: textBackgroundColour,
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
    color: listTextColour,
    backgroundColor: listBackgroundColour,
    borderColor: listTextColour,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    // marginBottom: 10
  },
  tagButton: {
    padding: 2,
  },
  ////////////////////////////////////////////////

  // footer
  footer: {
    flexDirection: "row",
    justifyContent: 'space-evenly',
    backgroundColor: footerBackgroundColour,
    paddingVertical: "1%"
  },
  footerIcon: {
    fontSize: 30,
    color: footerColour,
    alignSelf: "center"
  },
  footerText: {
    color: footerColour,
    alignSelf: "center"
  },

  // OTHER ########################################
  textDisplay: {
    color: secondaryScreenColour,
    width: "90%",
    height: 48,
    lineHeight: 48,
    marginBottom: 15,
    paddingLeft: "5%",
    fontSize: 18,
    backgroundColor: textBackgroundColour,
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
    color: mainTextColour,
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
    backgroundColor: headerBackgroundColour,
    borderRadius: 15,
    borderColor: secondaryScreenColour,
    borderWidth: 1,
    padding: 35,
    alignItems: 'center',
    shadowColor: mainScreenColour,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMenuView: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: "35%",
    marginBottom: "60%",
    // marginVertical: "50%",
    backgroundColor: headerBackgroundColour,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    borderColor: secondaryScreenColour,
    borderWidth: 1,
    padding: 35,
    shadowColor: mainScreenColour,
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
  // buttonOpen: {
  //   backgroundColor: '#F194FF',
  // },
  // buttonClose: {
  //   backgroundColor: '#2196F3',
  // },
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
