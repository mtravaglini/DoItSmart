import { StyleSheet, Platform } from 'react-native';

module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 50 : 0,
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
    color: "cornflowerblue",
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
    marginBottom: 10

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
    width: "95%",
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
    backgroundColor: "#e5e5e5",
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

  // Date 
  dateText: {
    height: 48,
    width: "95%",
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

  // MISC ########################################
  textDisplay: {
    borderBottomWidth: 3,
    borderColor: "cornflowerblue",
    color: "cornflowerblue",
    width: "75%",
    height: 25,
    marginBottom: 5,
    paddingLeft: "5%",
    fontSize: 18,
    backgroundColor: "lightgrey"
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

});
